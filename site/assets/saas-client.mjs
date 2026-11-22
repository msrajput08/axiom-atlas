import {SAAS_CONFIG as config} from "./saas-config.mjs";

const STORE = "axiomatlas.auth.session.v1";
const configured = () => config.enabled === true &&
  /^https:\/\/[^/]+\/?$/.test(config.supabaseUrl) &&
  /^https:\/\//.test(config.apiBase) &&
  typeof config.supabasePublishableKey === "string" &&
  config.supabasePublishableKey.length > 12;
function assertReady() {
  if (!configured()) throw new Error("Cloud accounts are not enabled yet.");
}
function storage() {
  try { return window.sessionStorage; }
  catch { return null; }
}
function save(session) {
  if (!session || typeof session.access_token !== "string" ||
      typeof session.refresh_token !== "string" ||
      !Number.isFinite(session.expires_at)) throw new Error("Invalid auth response");
  const dest = storage();
  if (!dest) throw new Error("Session storage is disabled. Enable it to sign in.");
  dest.setItem(STORE, JSON.stringify(session));
  return session;
}
function read() {
  const s = storage();
  if (!s) return null;
  try {
    const value = JSON.parse(s.getItem(STORE) || "null");
    if (!value || typeof value.access_token !== "string" ||
        typeof value.refresh_token !== "string" || !Number.isFinite(value.expires_at)) return null;
    return value;
  } catch { return null; }
}
function purge() {
  try { storage()?.removeItem(STORE); } catch {}
}
function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}
async function parse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw makeError(body.msg || body.error_description || body.message ||
    body.error || "Request failed", response.status);
  return body;
}
async function authFetch(path, payload, method = "POST", accessToken = null) {
  assertReady();
  const headers = {"Content-Type": "application/json",
    apikey: config.supabasePublishableKey};
  if (accessToken) headers.Authorization = "Bearer " + accessToken;
  const response = await fetch(config.supabaseUrl.replace(/\/$/, "") + "/auth/v1/" + path, {
    method, headers, body: payload === undefined ? undefined : JSON.stringify(payload),
    cache: "no-store", referrerPolicy: "no-referrer"
  });
  return parse(response);
}
function sessionFrom(data) {
  if (!data || !data.access_token || !data.refresh_token || !Number.isFinite(data.expires_in)) {
    throw makeError("Email verification may be required before sign-in.", 403);
  }
  return save({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000
  });
}
export function isCloudConfigured() { return configured(); }
export function clearSession() { purge(); }
export function hasSession() { return !!read(); }
export async function signIn(email, password) {
  return sessionFrom(await authFetch("token?grant_type=password", {email, password}));
}
export async function signUp(email, password) {
  return authFetch("signup?redirect_to=" + encodeURIComponent(location.origin + "/account/"),
    {email, password});
}
export async function sendRecovery(email) {
  return authFetch("recover?redirect_to=" + encodeURIComponent(location.origin + "/account/"),
    {email});
}
export async function completeRecovery(password) {
  const s = read();
  if (!s) throw new Error("Recovery session is missing. Open your recovery email again.");
  return authFetch("user", {password}, "PUT", s.access_token);
}
export async function useAuthRedirect() {
  if (!configured()) return null;
  const hash = location.hash ? new URLSearchParams(location.hash.slice(1)) : null;
  if (!hash || !hash.has("access_token")) return null;
  // Clear auth tokens from address bar before any async operations.
  const access = hash.get("access_token");
  const refresh = hash.get("refresh_token");
  const kind = hash.get("type");
  history.replaceState(null, "", location.pathname + location.search);
  if (!access || !refresh) throw new Error("Incomplete confirmation link");
  // Exchange a refresh token rather than trusting expiry from URL parameters.
  const data = await authFetch("token?grant_type=refresh_token", {refresh_token: refresh});
  sessionFrom(data);
  return kind || "confirmation";
}
export async function refresh() {
  const prior = read();
  if (!prior) return null;
  try {
    const data = await authFetch("token?grant_type=refresh_token",
      {refresh_token: prior.refresh_token});
    return sessionFrom(data);
  } catch (error) {
    if (error.status === 400 || error.status === 401 || error.status === 403) purge();
    throw error;
  }
}
export async function accessToken() {
  if (!configured()) return null;
  let s = read();
  if (!s) return null;
  if (s.expires_at <= Date.now() + 60000) s = await refresh();
  return s?.access_token || null;
}
export async function signOut() {
  const token = read()?.access_token;
  purge();
  if (configured() && token) {
    try { await authFetch("logout", undefined, "POST", token); } catch {}
  }
}
export async function apiRequest(method, path, payload) {
  assertReady();
  if (!/^\/api\/(?:me|projects(?:\/[0-9a-f-]{36})?)$/.test(path)) {
    throw new Error("Unsupported API route");
  }
  const url = config.apiBase.replace(/\/$/, "") + path;
  async function perform(jwt) {
    return fetch(url, {
      method,
      headers: {
        Authorization: "Bearer " + jwt,
        ...(payload !== undefined ? {"Content-Type": "application/json"} : {})
      },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      cache: "no-store", referrerPolicy: "no-referrer"
    });
  }
  let token = await accessToken();
  if (!token) throw makeError("Sign in to access cloud projects.", 401);
  let response = await perform(token);
  if (response.status === 401) {
    const s = await refresh();
    if (!s) throw makeError("Your session expired. Sign in again.", 401);
    response = await perform(s.access_token);
  }
  return parse(response);
}
