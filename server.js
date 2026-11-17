/* ==========================================================================
   Aria — tiny server (no npm install needed, Node 18+)
   --------------------------------------------------------------------------
   · serves the whole site on PORT (default 8080)
   · real Google sign-in with Client ID + Client SECRET (kept here, server-side)
   · callback:  BASE_URL + /auth/google/callback
   Run:  node server.js        (reads settings from .env)
   ========================================================================== */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
/* Many VPS have broken IPv6; prefer IPv4 when contacting Google. */
try { require("dns").setDefaultResultOrder("ipv4first"); } catch (e) {}

/* ------------------------------------------------------------------ .env */
const ROOT = __dirname;
try {
  fs.readFileSync(path.join(ROOT, ".env"), "utf8").split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  });
} catch (e) { /* no .env file */ }

const PORT = parseInt(process.env.PORT || "8080", 10);
const BASE_URL = (process.env.BASE_URL || "http://localhost:" + PORT).replace(/\/+$/, "");
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const ALLOWED = (process.env.GOOGLE_ALLOWED_DOMAINS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const REDIRECT_URI = BASE_URL + "/auth/google/callback";
const SECURE = BASE_URL.startsWith("https://");


/* HTTPS helper: forces IPv4 and a long connect timeout (many VPS have broken
   IPv6 / slow routes to Google, which made the built-in fetch time out). */
const https = require("https");
function httpsJson(urlStr, opts) {
  opts = opts || {};
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const body = opts.body || null;
    const req = https.request({
      hostname: u.hostname, port: 443, path: u.pathname + u.search,
      method: opts.method || "GET", family: 4,
      headers: Object.assign({ "User-Agent": "aria-server", "Accept": "application/json" },
        body ? { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) } : {})
    }, (r) => {
      let data = "";
      r.on("data", (c) => (data += c));
      r.on("end", () => {
        let j = {};
        try { j = JSON.parse(data); } catch (e) { j = { error: "bad_json", raw: data.slice(0, 200) }; }
        resolve({ ok: r.statusCode >= 200 && r.statusCode < 300, status: r.statusCode, json: j });
      });
    });
    req.setTimeout(30000, () => req.destroy(Object.assign(new Error("timeout after 30s"), { code: "ETIMEDOUT" })));
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}
async function httpsJsonRetry(url, opts) {
  try { return await httpsJson(url, opts); }
  catch (e) { console.error("retrying after:", e.code || e.message); return await httpsJson(url, opts); }
}

/* ---------------------------------------------------------------- helpers */
const b64 = (s) => Buffer.from(s).toString("base64url");
const sign = (s) => crypto.createHmac("sha256", SESSION_SECRET).update(s).digest("base64url");
function pack(obj) { const p = b64(JSON.stringify(obj)); return p + "." + sign(p); }
function unpack(tok) {
  if (!tok || tok.indexOf(".") < 0) return null;
  const [p, sig] = tok.split(".");
  const good = sign(p);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  try {
    const o = JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
    return o.exp && o.exp > Date.now() ? o : null;
  } catch (e) { return null; }
}
function cookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((c) => {
    const i = c.indexOf("=");
    if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}
function setCookie(res, name, value, maxAge) {
  const c = [name + "=" + encodeURIComponent(value), "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=" + maxAge];
  if (SECURE) c.push("Secure");
  const prev = res.getHeader("Set-Cookie") || [];
  res.setHeader("Set-Cookie", [].concat(prev, c.join("; ")));
}
function safeReturn(p) {
  return typeof p === "string" && p.startsWith("/") && !p.startsWith("//") && !p.includes("\\") ? p : "/login.html";
}
function redirect(res, loc) { res.writeHead(302, { Location: loc, "Cache-Control": "no-store" }); res.end(); }
function backTo(res, ret, params) {
  const u = new URL(safeReturn(ret), "http://x");
  Object.keys(params).forEach((k) => u.searchParams.set(k, params[k]));
  redirect(res, u.pathname + u.search);
}
function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

/* ------------------------------------------------------------ google auth */
function startGoogle(req, res, url) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return backTo(res, url.searchParams.get("ret"), { gerr: "Google sign-in is not set up on the server yet (.env)." });
  }
  const state = crypto.randomBytes(16).toString("hex");
  setCookie(res, "aria_oauth", pack({ state, ret: safeReturn(url.searchParams.get("ret")), exp: Date.now() + 10 * 60 * 1000 }), 600);
  const q = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account"
  });
  redirect(res, "https://accounts.google.com/o/oauth2/v2/auth?" + q);
}

async function googleCallback(req, res, url) {
  const saved = unpack(cookies(req).aria_oauth);
  const ret = saved ? saved.ret : "/login.html";
  setCookie(res, "aria_oauth", "", 0);
  if (url.searchParams.get("error")) return backTo(res, ret, { gerr: "Google sign-in was cancelled." });
  if (!saved || saved.state !== url.searchParams.get("state")) {
    return backTo(res, ret, { gerr: "Sign-in session expired. Please try again." });
  }
  try {
    const tr = await httpsJsonRetry("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        code: url.searchParams.get("code") || "",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code"
      }).toString()
    });
    const t = tr.json;
    if (!t.id_token) {
      console.error("Token exchange failed:", t);
      return backTo(res, ret, { gerr: "Google rejected the sign-in (" + (t.error || "no token") + ")." });
    }
    /* Google verifies the signature + expiry; we verify audience + email. */
    const vr = await httpsJsonRetry("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(t.id_token));
    const p = vr.json;
    if (!vr.ok || p.aud !== CLIENT_ID) {
      console.error("tokeninfo failed:", p);
      return backTo(res, ret, { gerr: "Google token could not be verified." });
    }
    if (String(p.email_verified) !== "true" || !p.email) return backTo(res, ret, { gerr: "Your Google email is not verified." });
    const domain = p.email.split("@")[1].toLowerCase();
    if (ALLOWED.length && ALLOWED.indexOf(domain) === -1) {
      console.error("Domain not allowed:", domain);
      return backTo(res, ret, { gerr: "This Google account is not on the allowed campus domains (" + ALLOWED.join(", ") + ")." });
    }
    console.log("Google sign-in OK:", p.email);
    /* Hand the verified profile to the page as a short-lived signed token
       (no cookie needed; the page removes it from the address bar at once). */
    const handoff = pack({ name: p.name || p.email.split("@")[0], email: p.email, picture: p.picture || "", exp: Date.now() + 2 * 60 * 1000 });
    backTo(res, ret, { g: handoff });
  } catch (e) {
    console.error("Google request failed:", e.code || e.message);
    backTo(res, ret, { gerr: "Could not reach Google. Try again." });
  }
}

/* ----------------------------------------------------------------- static */
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json", ".woff2": "font/woff2"
};
function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (p === "/") p = "/index.html";
  const file = path.normalize(path.join(ROOT, p));
  const rel = path.relative(ROOT, file).split(path.sep);
  const ok = file.startsWith(ROOT + path.sep) && (rel[0] === "assets" || (rel.length === 1 && file.endsWith(".html")));
  if (!ok) { res.writeHead(404); return res.end("Not found"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": [".html", ".js", ".css"].includes(ext) ? "no-store" : "public, max-age=3600"
    });
    res.end(data);
  });
}

/* ----------------------------------------------------------------- server */
http.createServer(async (req, res) => {
  const url = new URL(req.url, BASE_URL);
  try {
    if (url.pathname === "/auth/google") return startGoogle(req, res, url);
    if (url.pathname === "/auth/google/callback") return await googleCallback(req, res, url);
    if (url.pathname === "/auth/me") {
      const prof = unpack(url.searchParams.get("t") || "");
      console.log("/auth/me ->", prof ? "profile ok" : "invalid or expired token");
      return prof ? json(res, 200, { name: prof.name, email: prof.email, picture: prof.picture }) : json(res, 401, { error: "Sign-in token invalid or expired." });
    }
    serveStatic(req, res, url);
  } catch (e) {
    console.error(e);
    res.writeHead(500); res.end("Server error");
  }
}).listen(PORT, () => {
  console.log("Aria running on http://localhost:" + PORT);
  console.log("Public URL     : " + BASE_URL);
  console.log("Google callback: " + REDIRECT_URI);
  if (!CLIENT_ID || !CLIENT_SECRET) console.log("! GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing in .env");
  /* Startup self-check: can this machine reach Google over IPv4? */
  httpsJson("https://oauth2.googleapis.com/tokeninfo")
    .then((r) => console.log("Google reachable from this server (HTTP " + r.status + ") - sign-in will work."))
    .catch((e) => console.log("! This server CANNOT reach Google (" + (e.code || e.message) + "). Google sign-in will fail until the VPS can open https://oauth2.googleapis.com (check firewall / outbound rules / DNS)."));
});
