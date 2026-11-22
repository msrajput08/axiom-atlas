/**
 * AxiomAtlas SaaS API foundation for Cloudflare Workers + D1.
 * NOT deployed. Authentication delegates to Supabase Auth (asymmetric JWT).
 * No login/password collection, checkout or entitlement mutations on this API.
 */
const MODEL = "rlc_series_v1";
const MAX_JSON = 26000;
const JWT_AUDIENCE = "authenticated";
const JWKS_TTL = 5 * 60 * 1000;
const jwksCache = new Map();

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      ...extra
    }
  });
}
function decode(segment) {
  if (typeof segment !== "string" || !/^[A-Za-z0-9_-]+$/.test(segment)) {
    throw httpError(401, "Invalid authentication token");
  }
  const raw = atob(segment.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(segment.length / 4) * 4, "="));
  return Uint8Array.from(raw, ch => ch.charCodeAt(0));
}
function parsePart(part) {
  try { return JSON.parse(new TextDecoder().decode(decode(part))); }
  catch { throw httpError(401, "Invalid authentication token"); }
}
function uuid(str) {
  return typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}
async function verifyJWT(authHeader, env) {
  if (!authHeader || !/^Bearer [A-Za-z0-9._-]{50,8192}$/.test(authHeader)) {
    throw httpError(401, "Authentication required");
  }
  if (!env.SUPABASE_URL || !/^https:\/\/[a-zA-Z0-9.-]+\/?$/.test(env.SUPABASE_URL)) {
    throw httpError(503, "Authentication service unavailable");
  }
  const issuer = env.SUPABASE_URL.replace(/\/$/, "") + "/auth/v1";
  const parts = authHeader.slice(7).split(".");
  if (parts.length !== 3) throw httpError(401, "Invalid authentication token");
  const header = parsePart(parts[0]);
  const payload = parsePart(parts[1]);
  if (!header || !["ES256", "RS256"].includes(header.alg) ||
      typeof header.kid !== "string" || header.kid.length > 180 ||
      !/^[\w.:-]+$/.test(header.kid)) {
    throw httpError(401, "Unsupported authentication token");
  }
  const now = Math.floor(Date.now() / 1000);
  const sub = payload && payload.sub;
  if (!uuid(sub) || payload.iss !== issuer ||
      !(payload.aud === JWT_AUDIENCE || (Array.isArray(payload.aud) && payload.aud.includes(JWT_AUDIENCE))) ||
      payload.role !== "authenticated" || payload.is_anonymous === true ||
      typeof payload.exp !== "number" || payload.exp <= now ||
      typeof payload.iat !== "number" || payload.iat > now + 60 ||
      (payload.nbf !== undefined && (typeof payload.nbf !== "number" || payload.nbf > now + 60))) {
    throw httpError(401, "Authentication token expired or invalid");
  }
  let keys = jwksCache.get(issuer);
  if (!keys || keys.expires < Date.now()) {
    const response = await fetch(issuer + "/.well-known/jwks.json", {headers: {Accept: "application/json"}});
    if (!response.ok) throw httpError(503, "Authentication keys unavailable");
    const body = await response.json();
    if (!body || !Array.isArray(body.keys) || body.keys.length > 30) throw httpError(503, "Authentication keys unavailable");
    keys = {keys: body.keys, expires: Date.now() + JWKS_TTL};
    jwksCache.set(issuer, keys);
  }
  const jwk = keys.keys.find(k => k.kid === header.kid &&
    (k.alg === undefined || k.alg === header.alg) && k.use !== "enc" && (k.key_ops === undefined || k.key_ops.includes("verify")) &&
    ((header.alg === "ES256" && k.kty === "EC" && k.crv === "P-256") ||
     (header.alg === "RS256" && k.kty === "RSA")));
  if (!jwk) throw httpError(401, "Untrusted authentication key");
  const alg = header.alg === "ES256" ?
    {name: "ECDSA", namedCurve: "P-256"} :
    {name: "RSASSA-PKCS1-v1_5", hash: "SHA-256"};
  let verified = false;
  try {
    const key = await crypto.subtle.importKey("jwk", jwk, alg, false, ["verify"]);
    const signature = decode(parts[2]);
    const signed = new TextEncoder().encode(parts[0] + "." + parts[1]);
    verified = await crypto.subtle.verify(
      header.alg === "ES256" ? {name: "ECDSA", hash: "SHA-256"} : alg,
      key, signature, signed
    );
  } catch { verified = false; }
  if (!verified) throw httpError(401, "Invalid authentication signature");
  return sub;
}
async function rateLimit(db, actorId, action) {
  const limit = action === "write" ? 12 : 90;
  const bucket = Math.floor(Date.now() / 60000);
  const r = await db.prepare(
    "INSERT INTO saas_rate_limits (actor_id, action, window_minute, attempts) VALUES (?, ?, ?, 1) " +
    "ON CONFLICT(actor_id, action, window_minute) DO UPDATE SET attempts = attempts + 1 WHERE attempts < ?"
  ).bind(actorId, action, bucket, limit).run();
  if (!r.success) throw httpError(503, "Rate limiting unavailable");
  if (r.meta && r.meta.changes === 0) throw httpError(429, "Too many requests. Try again shortly.");
}
async function entitlements(db, userId, env) {
  const free = {plan: "free", maxProjects: 3, maxScenarios: 50, cloudSync: true};
  if (env.ENABLE_PAID_ENTITLEMENTS !== "true") return free;
  const row = await db.prepare(
    "SELECT plan, status, current_period_end FROM saas_entitlements WHERE user_id = ?"
  ).bind(userId).first();
  if (!row || !["active", "trialing"].includes(row.status) ||
      typeof row.current_period_end !== "string" ||
      Number.isNaN(Date.parse(row.current_period_end)) ||
      Date.parse(row.current_period_end) <= Date.now()) return free;
  if (row.plan === "studio") return {plan: "studio", maxProjects: 50, maxScenarios: 50, cloudSync: true};
  if (row.plan === "business") return {plan: "business", maxProjects: 100, maxScenarios: 50, cloudSync: true};
  return free;
}
function validateProject(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw httpError(400, "Invalid project");
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (title.length < 1 || title.length > 100) throw httpError(400, "Project title must be 1–100 characters");
  if (input.model !== MODEL) throw httpError(400, "Unsupported calculation model");
  const payload = input.payload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
      payload.version !== 1 || !Array.isArray(payload.scenarios) ||
      payload.scenarios.length < 1 || payload.scenarios.length > 50) {
    throw httpError(400, "Project must contain 1–50 valid scenarios");
  }
  const seen = new Set();
  const cleaned = payload.scenarios.map(s => {
    if (!s || typeof s !== "object" || Array.isArray(s) ||
        typeof s.id !== "string" || !/^[a-z0-9_-]{4,64}$/i.test(s.id) ||
        seen.has(s.id) ||
        typeof s.name !== "string" || !s.name.trim() || s.name.length > 70) {
      throw httpError(400, "Invalid scenario identity or name");
    }
    seen.add(s.id);
    const out = {id: s.id, name: s.name.trim()};
    for (const name of ["resistance", "inductance", "capacitance", "frequency", "voltage"]) {
      const value = s[name];
      if (typeof value !== "number" || !Number.isFinite(value) ||
          value > 1e12 || (name === "voltage" ? value < 0 : value < 0.000001)) {
        throw httpError(400, "Invalid scenario input: " + name);
      }
      out[name] = value;
    }
    return out;
  });
  const active = typeof payload.active === "string" && seen.has(payload.active) ?
    payload.active : cleaned[0].id;
  const serialized = JSON.stringify({version: 1, active, scenarios: cleaned});
  if (serialized.length > 20000) throw httpError(413, "Project is too large");
  return {title, model: MODEL, payloadJson: serialized};
}
async function readBody(request) {
  if (!/^application\/json(?:;|$)/i.test(request.headers.get("content-type") || "")) {
    throw httpError(415, "Content-Type must be application/json");
  }
  if (Number(request.headers.get("content-length") || 0) > MAX_JSON) throw httpError(413, "Request too large");
  const text = await request.text();
  if (text.length > MAX_JSON) throw httpError(413, "Request too large");
  try { return JSON.parse(text); }
  catch { throw httpError(400, "Invalid JSON"); }
}
function projectResponse(row) {
  return {
    id: row.id, title: row.title, model: row.model,
    payload: JSON.parse(row.payload_json), version: row.version,
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}
async function handle(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  const allowed = typeof env.APP_ORIGIN === "string" ? env.APP_ORIGIN.replace(/\/$/, "") : "";
  if (!allowed || !/^https:\/\//.test(allowed)) throw httpError(503, "API is not configured");
  if (origin && origin !== allowed) throw httpError(403, "Origin not permitted");
  const cors = origin === allowed ? {"Access-Control-Allow-Origin": allowed, "Vary": "Origin"} : {};
  if (request.method === "OPTIONS") {
    if (!origin || origin !== allowed) throw httpError(403, "Origin not permitted");
    return new Response(null, {status: 204, headers: {
      ...cors, "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "600", "Cache-Control": "no-store"
    }});
  }
  if (url.pathname === "/api/health" && request.method === "GET") return json({ok: true, version: 1}, 200, cors);
  if (!env.DB || typeof env.DB.prepare !== "function") throw httpError(503, "Project storage unavailable");
  const userId = await verifyJWT(request.headers.get("Authorization"), env);
  const writable = ["POST", "PUT", "DELETE"].includes(request.method);
  await rateLimit(env.DB, userId, writable ? "write" : "read");
  if (url.pathname === "/api/me" && request.method === "GET") {
    return json({userId, entitlements: await entitlements(env.DB, userId, env)}, 200, cors);
  }
  if (url.pathname === "/api/projects") {
    if (request.method === "GET") {
      const r = await env.DB.prepare(
        "SELECT id, title, model, version, created_at, updated_at FROM saas_projects " +
        "WHERE owner_id = ? ORDER BY updated_at DESC, id DESC LIMIT 101"
      ).bind(userId).all();
      return json({projects: (r.results || []).map(p => ({
        id: p.id, title: p.title, model: p.model,
        version: p.version, createdAt: p.created_at, updatedAt: p.updated_at
      }))}, 200, cors);
    }
    if (request.method === "POST") {
      const input = validateProject(await readBody(request));
      const policy = await entitlements(env.DB, userId, env);
      const id = crypto.randomUUID();
      const result = await env.DB.prepare(
        "INSERT INTO saas_projects (id, owner_id, title, model, payload_json) " +
        "SELECT ?, ?, ?, ?, ? WHERE " +
        "(SELECT COUNT(*) FROM saas_projects WHERE owner_id = ?) < ?"
      ).bind(id, userId, input.title, input.model, input.payloadJson, userId, policy.maxProjects).run();
      if (result.meta && result.meta.changes === 0) throw httpError(409, "Cloud project limit reached for your plan");
      const row = await env.DB.prepare("SELECT * FROM saas_projects WHERE id = ? AND owner_id = ?")
        .bind(id, userId).first();
      return json({project: projectResponse(row)}, 201, cors);
    }
    throw httpError(405, "Method not allowed");
  }
  const match = /^\/api\/projects\/([0-9a-f-]{36})$/.exec(url.pathname);
  if (match && uuid(match[1])) {
    const id = match[1];
    if (request.method === "GET") {
      const row = await env.DB.prepare("SELECT * FROM saas_projects WHERE id = ? AND owner_id = ?")
        .bind(id, userId).first();
      if (!row) throw httpError(404, "Project not found");
      return json({project: projectResponse(row)}, 200, cors);
    }
    if (request.method === "PUT") {
      const body = await readBody(request);
      if (!Number.isSafeInteger(body.version) || body.version < 1) throw httpError(400, "Expected project version required");
      const validated = validateProject(body);
      const result = await env.DB.prepare(
        "UPDATE saas_projects SET title = ?, model = ?, payload_json = ?, version = version + 1, " +
        "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') " +
        "WHERE id = ? AND owner_id = ? AND version = ?"
      ).bind(validated.title, validated.model, validated.payloadJson, id, userId, body.version).run();
      if (result.meta && result.meta.changes === 0) {
        const exists = await env.DB.prepare("SELECT id FROM saas_projects WHERE id = ? AND owner_id = ?")
          .bind(id, userId).first();
        throw httpError(exists ? 409 : 404, exists ? "Project changed. Reload before saving." : "Project not found");
      }
      const row = await env.DB.prepare("SELECT * FROM saas_projects WHERE id = ? AND owner_id = ?")
        .bind(id, userId).first();
      return json({project: projectResponse(row)}, 200, cors);
    }
    if (request.method === "DELETE") {
      const result = await env.DB.prepare("DELETE FROM saas_projects WHERE id = ? AND owner_id = ?")
        .bind(id, userId).run();
      if (result.meta && result.meta.changes === 0) throw httpError(404, "Project not found");
      return json({deleted: true}, 200, cors);
    }
    throw httpError(405, "Method not allowed");
  }
  throw httpError(404, "Route not found");
}
export default {
  async fetch(request, env) {
    try {
      return await handle(request, env);
    } catch (e) {
      const status = Number.isInteger(e.status) && e.status >= 400 && e.status < 600 ? e.status : 500;
      // Do not return SQL, secrets or stack traces to clients.
      const allowed = typeof env.APP_ORIGIN === "string" ? env.APP_ORIGIN.replace(/\/$/, "") : "";
      const origin = request.headers.get("Origin");
      const cors = allowed && origin === allowed ?
        {"Access-Control-Allow-Origin": allowed, "Vary": "Origin"} : {};
      return json({error: status === 500 ? "Internal server error" : e.message}, status, cors);
    }
  },
  async scheduled(_event, env) {
    if (!env.DB) return;
    // Remove rate-limit counters older than two days (configure a daily cron trigger).
    await env.DB.prepare("DELETE FROM saas_rate_limits WHERE window_minute < ?")
      .bind(Math.floor(Date.now() / 60000) - 2880).run();
  }
};
