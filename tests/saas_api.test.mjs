import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";
import worker from "../saas/worker.mjs";

globalThis.crypto = webcrypto;
const AUTH = "https://auth.axiomatlas.example";
const APP = "https://axiomatlas.netlify.app";
const keyPair = await crypto.subtle.generateKey({name: "ECDSA", namedCurve: "P-256"}, true, ["sign", "verify"]);
const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
Object.assign(publicJwk, {kid: "test-key-1", alg: "ES256", use: "sig"});
let jwksRequests = 0;
globalThis.fetch = async (url) => {
  assert.equal(url, AUTH + "/auth/v1/.well-known/jwks.json");
  jwksRequests++;
  return new Response(JSON.stringify({keys: [publicJwk]}), {status: 200});
};
const b64 = value => Buffer.from(typeof value === "string" || value instanceof Uint8Array ? value : JSON.stringify(value)).toString("base64url");
async function access(userId, modify = {}) {
  const now = Math.floor(Date.now() / 1000);
  const head = {alg: "ES256", typ: "JWT", kid: "test-key-1"};
  const claims = {
    iss: AUTH + "/auth/v1", aud: "authenticated", role: "authenticated",
    sub: userId, iat: now, exp: now + 3600, ...modify
  };
  const signed = b64(head) + "." + b64(claims);
  const signature = await crypto.subtle.sign({name: "ECDSA", hash: "SHA-256"},
    keyPair.privateKey, new TextEncoder().encode(signed));
  return signed + "." + b64(new Uint8Array(signature));
}
class MockD1 {
  constructor() { this.projects = new Map(); this.entitlements = new Map(); this.limits = new Map(); }
  prepare(sql) {
    return { bind: (...args) => ({
      first: async () => this.query(sql, args, "first"),
      all: async () => this.query(sql, args, "all"),
      run: async () => this.query(sql, args, "run")
    }) };
  }
  query(sql, args, mode) {
    if (sql.startsWith("INSERT INTO saas_rate_limits")) {
      const [actor, action, window, max] = args;
      const key = actor + ":" + action + ":" + window;
      const count = this.limits.get(key) || 0;
      if (count >= max) return {success: true, meta: {changes: 0}};
      this.limits.set(key, count + 1);
      return {success: true, meta: {changes: 1}};
    }
    if (sql.startsWith("SELECT plan, status")) return this.entitlements.get(args[0]) || null;
    if (sql.startsWith("SELECT id, title, model")) {
      const projects = [...this.projects.values()].filter(p => p.owner_id === args[0])
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 101);
      return {results: projects.map(({id, title, model, version, created_at, updated_at}) =>
        ({id, title, model, version, created_at, updated_at}))};
    }
    if (sql.startsWith("INSERT INTO saas_projects")) {
      const [id, user, title, model, payload, checkOwner, maximum] = args;
      assert.equal(user, checkOwner);
      if ([...this.projects.values()].filter(p => p.owner_id === user).length >= maximum)
        return {success: true, meta: {changes: 0}};
      const now = new Date().toISOString();
      this.projects.set(id, {id, owner_id: user, title, model,
        payload_json: payload, version: 1, created_at: now, updated_at: now});
      return {success: true, meta: {changes: 1}};
    }
    if (sql.startsWith("SELECT * FROM saas_projects")) {
      const p = this.projects.get(args[0]);
      return p && p.owner_id === args[1] ? {...p} : null;
    }
    if (sql.startsWith("UPDATE saas_projects")) {
      const [title, model, payload, id, owner, version] = args;
      const p = this.projects.get(id);
      if (!p || p.owner_id !== owner || p.version !== version)
        return {success: true, meta: {changes: 0}};
      Object.assign(p, {title, model, payload_json: payload, version: version + 1,
        updated_at: new Date().toISOString()});
      return {success: true, meta: {changes: 1}};
    }
    if (sql.startsWith("SELECT id FROM saas_projects")) {
      const p = this.projects.get(args[0]);
      return p && p.owner_id === args[1] ? {id: p.id} : null;
    }
    if (sql.startsWith("DELETE FROM saas_projects")) {
      const p = this.projects.get(args[0]);
      if (!p || p.owner_id !== args[1]) return {success: true, meta: {changes: 0}};
      this.projects.delete(args[0]);
      return {success: true, meta: {changes: 1}};
    }
    throw new Error("Unexpected SQL in " + mode + ": " + sql);
  }
}

const userA = crypto.randomUUID();
const userB = crypto.randomUUID();
const tokenA = await access(userA);
const tokenB = await access(userB);
const db = new MockD1();
const env = {APP_ORIGIN: APP, SUPABASE_URL: AUTH, DB: db, ENABLE_PAID_ENTITLEMENTS: "false"};
let assertions = 0;
async function call(method, path, token, body, changes = {}) {
  const headers = {Origin: APP};
  if (token) headers.Authorization = "Bearer " + token;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const request = new Request("https://api.example.workers.dev" + path,
    {method, headers, body: body !== undefined ? JSON.stringify(body) : undefined});
  const response = await worker.fetch(request, {...env, ...changes});
  const data = await response.json();
  return {status: response.status, headers: response.headers, data};
}
async function expect(method, path, token, body, status, changes) {
  const r = await call(method, path, token, body, changes);
  assert.equal(r.status, status, method + " " + path + " => " + JSON.stringify(r.data));
  assert.equal(r.headers.get("cache-control"), "no-store");
  assertions += 2;
  return r.data;
}
const valid = (name = "Reference") => ({
  title: name, model: "rlc_series_v1",
  payload: {version: 1, active: "scenario1", scenarios: [{
    id: "scenario1", name: "Reference", resistance: 100, inductance: 10,
    capacitance: 100, frequency: 5, voltage: 12
  }]}
});
await expect("GET", "/api/health", null, undefined, 200);
await expect("GET", "/api/me", null, undefined, 401);
const me = await expect("GET", "/api/me", tokenA, undefined, 200);
assert.equal(me.userId, userA);
assert.equal(me.entitlements.plan, "free");
assert.equal(me.entitlements.maxProjects, 3);
assert.equal(jwksRequests, 1);
assertions += 4;
const forged = tokenA.slice(0, -6) + "abcdef";
await expect("GET", "/api/me", forged, undefined, 401);
await expect("GET", "/api/me", await access(userA, {exp: Math.floor(Date.now() / 1000) - 2}), undefined, 401);
await expect("GET", "/api/me", await access(userA, {role: "anon"}), undefined, 401);
await expect("GET", "/api/me", await access(userA, {aud: "service_role"}), undefined, 401);
await expect("GET", "/api/me", await access(userA, {is_anonymous: true}), undefined, 401);
await expect("GET", "/api/me", tokenA, undefined, 403, {APP_ORIGIN: "https://other.example"});
await expect("GET", "/api/me", tokenA, undefined, 503, {DB: undefined});
const bad = valid();
bad.payload.scenarios[0].resistance = 0;
await expect("POST", "/api/projects", tokenA, bad, 400);
const duplicate = valid();
duplicate.payload.scenarios.push({...duplicate.payload.scenarios[0]});
await expect("POST", "/api/projects", tokenA, duplicate, 400);
await expect("POST", "/api/projects", tokenA, {title: "Other", model: "arbitrary", payload: {}}, 400);
const first = (await expect("POST", "/api/projects", tokenA, valid("Circuit A"), 201)).project;
assert.equal(first.title, "Circuit A");
assert.equal(first.version, 1);
assert.equal(first.payload.scenarios.length, 1);
assertions += 3;
await expect("POST", "/api/projects", tokenA, valid("Circuit B"), 201);
await expect("POST", "/api/projects", tokenA, valid("Circuit C"), 201);
await expect("POST", "/api/projects", tokenA, {...valid("Attempt paid bypass"), plan: "business"}, 409);
const list = await expect("GET", "/api/projects", tokenA, undefined, 200);
assert.equal(list.projects.length, 3);
assert.equal(list.projects[0].payload, undefined, "listing must not leak project body");
assertions += 2;
await expect("GET", "/api/projects/" + first.id, tokenB, undefined, 404);
await expect("PUT", "/api/projects/" + first.id, tokenB, {...valid("Theft"), version: 1}, 404);
await expect("DELETE", "/api/projects/" + first.id, tokenB, undefined, 404);
const updated = (await expect("PUT", "/api/projects/" + first.id, tokenA,
  {...valid("Circuit A edited"), version: 1}, 200)).project;
assert.equal(updated.version, 2);
assert.equal(updated.title, "Circuit A edited");
assertions += 2;
await expect("PUT", "/api/projects/" + first.id, tokenA, {...valid("Stale"), version: 1}, 409);
const stillThere = await expect("GET", "/api/projects/" + first.id, tokenA, undefined, 200);
assert.equal(stillThere.project.title, "Circuit A edited");
assertions++;
db.entitlements.set(userA, {
  plan: "business", status: "active", current_period_end: new Date(Date.now() + 3600000).toISOString()
});
const off = await expect("GET", "/api/me", tokenA, undefined, 200);
assert.equal(off.entitlements.plan, "free");
const on = await expect("GET", "/api/me", tokenA, undefined, 200,
  {ENABLE_PAID_ENTITLEMENTS: "true"});
assert.equal(on.entitlements.plan, "business");
assert.equal(on.entitlements.maxProjects, 100);
assertions += 3;
db.entitlements.set(userA, {
  plan: "business", status: "active", current_period_end: new Date(Date.now() - 60000).toISOString()
});
const expired = await expect("GET", "/api/me", tokenA, undefined, 200,
  {ENABLE_PAID_ENTITLEMENTS: "true"});
assert.equal(expired.entitlements.plan, "free");
assertions++;
await expect("DELETE", "/api/projects/" + first.id, tokenA, undefined, 200);
await expect("GET", "/api/projects/" + first.id, tokenA, undefined, 404);
const newOne = await expect("POST", "/api/projects", tokenA, valid("After delete"), 201);
assert.ok(newOne.project.id);
assertions++;
// Separate user owns a separate set of projects; no global project limit sharing.
const b = await expect("POST", "/api/projects", tokenB, valid("Another user"), 201);
assert.ok(b.project.id);
assertions++;
// Bounded per-user, per-minute server-side read throttling.
let throttled = false;
for (let i = 0; i < 100; i++) {
  const r = await call("GET", "/api/me", tokenB);
  if (r.status === 429) { throttled = true; break; }
}
assert.ok(throttled, "read throttle must enforce server-side");
assertions++;
console.log("SaaS API integration security checks passed (" + assertions + " assertions; JWKS fetched " + jwksRequests + " time(s)).");
