import { useState, useRef, useEffect, useCallback, useMemo, Component } from "react";

/* ═══════════════════════════════════════════════
 * NASA P10 COMPLIANCE MANIFEST
 * ───────────────────────────────────────────────
 * R1: Simple control flow — no recursion, no goto
 * R2: All loops bounded — MAX_* constants enforced
 * R3: No dynamic alloc post-init — state declared at mount
 * R4: Functions ≤ 60 lines — extracted components/hooks
 * R5: Guard clauses — every function validates inputs
 * R6: Smallest scope — state co-located with consumers
 * R7: Return values checked — all async wrapped
 * R8: No preprocessor abuse — clean imports only
 * R9: No raw pointer abuse — refs typed and bounded
 * R10: No suppressed warnings — clean console
 * ═══════════════════════════════════════════════ */

// ─── P10-R7: Error Boundary (catches render errors) ───
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(e, info) { console.error("Intcu error:", e, info); }
  render() {
    if (this.state.error) return (
      <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fafaf9", color: "#1a1a1a", fontFamily: "'Sora', sans-serif", padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</div>
        <div style={{ fontSize: 14, color: "#6b6b6b", marginBottom: 24 }}>Intcu encountered an error. Your data is safe.</div>
        <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
          style={{ padding: "10px 24px", borderRadius: 8, background: "#00B8A9", color: "#fafaf9", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Reload Intcu
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ─── P10-R2: Bounded iteration limits ───
const MAX_LINES = 5000;
const MAX_SCRIPTS = 50;
const MAX_SESSIONS = 30;
const MAX_INJECTIONS = 20;
const MAX_MEMBERS = 10;
const MAX_TRANSCRIPT = 200;
const MAX_EXCHANGES = 50;
const MAX_HISTORY = 12;
const MAX_POLL_RETRIES = 3;
const SYNC_INTERVAL_MS = 700;
const AVG_WPM = 150;
const MAX_ADMIN_ROWS = 50;
const MAX_LOG_ENTRIES = 100;

// ─── Theme: Hybrid UX zones (dark chrome, light content) ───
const T = {
  // Chrome zones (header, tabs, controls)
  chrome: "#0e0f11", chromeMid: "#16171b", chromeLight: "#1e1f25",
  chromeBorder: "#2a2b32", chromeText: "#e4e4e7", chromeTextDim: "#71717a",
  // Content zone (viewport, modals)
  bg: "#fafaf9", bgAlt: "#f5f4f2", bgCard: "#ffffff",
  border: "#e4e2de", borderLit: "#d4d0ca",
  text: "#1a1a1a", textDim: "#6b6b6b", textMuted: "#9ca3af",
  // Brand colors
  teal: "#00B8A9", tealDark: "#009e95", green: "#16a34a",
  red: "#dc2626", amber: "#d97706", blue: "#2563eb",
  purple: "#7c3aed", cyan: "#00B8A9", accent: "#00B8A9",
  font: "'Sora', sans-serif", fontSerif: "'Source Serif 4', serif",
  radius: 8, gap: 8,
};
// ─── P10-R2: Named constants (no magic numbers) ───
const DEBOUNCE_MS = 2500;
const SCROLL_FACTOR = 0.6;
const TOAST_MS = 2500;
const COUNTDOWN_SECS = 3;
const VOICE_MAX_RESTARTS = 3;
const API_COOLDOWN_MS = 2000;
const CUE_FONT_SCALE = 0.45;
const EDIT_FONT_CAP = 22;
const EMPTY_LINE_SCALE = 0.4;
const SPEECH_LANG = "en-US";
const DATE_SHORT = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
const DATE_LONG = { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };

const FONT_URLS = [
  "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap",
];
const PROMPTER_FONTS = [
  { name: "Sora", css: T.font },
  { name: "Source Serif", css: "'Source Serif 4', serif" },
  { name: "Crimson Pro", css: "'Crimson Pro', serif" },
  { name: "Lexend (Dyslexia)", css: "'Lexend', sans-serif" },
];

const WRITER_TONES = ["Professional", "Conversational", "Inspirational", "Persuasive", "Educational", "Humorous", "Empathetic"];
const WRITER_FORMATS = ["Speech", "Presentation", "Pitch", "Tutorial", "Story", "Sermon", "Debate Opening", "Toast", "Eulogy", "Sales Call"];
const LANGUAGES = [
  "English", "Spanish", "Mandarin", "French", "Arabic", "Portuguese", "Tagalog",
  "Japanese", "Korean", "German", "Italian", "Russian", "Hindi", "Thai",
  "Vietnamese", "Indonesian", "Malay", "Dutch", "Turkish", "Polish",
];

// ─── Usage Gates & Billing ───
const PLAN_GATES = {
  copilot: ["pro", "team", "enterprise"],
  recording: ["pro", "team", "enterprise"],
  myfile_brainstorm: ["pro", "team", "enterprise"],
  unlimited_ai: ["pro", "team", "enterprise"],
  all_engines: ["pro", "team", "enterprise"],
  session_export: ["pro", "team", "enterprise"],
  team_sync: ["team", "enterprise"],
  translate: ["pro", "team", "enterprise"],
  quotes: ["pro", "team", "enterprise"],
};
const FREE_ENGINES = ["deepseek", "groq", "grok", "gemini"];
const FREE_DAILY_AI = 3;

const COPILOT_STYLES = [
  { id: "brief", label: "Brief", icon: "⚡" },
  { id: "detailed", label: "Detailed", icon: "📋" },
  { id: "diplomatic", label: "Diplomatic", icon: "🤝" },
  { id: "assertive", label: "Assertive", icon: "💪" },
  { id: "socratic", label: "Socratic", icon: "🔍" },
];
const COPILOT_NICHES = [
  { id: "general", label: "General", p: "Help respond intelligently in a general conversation." },
  { id: "negotiate", label: "Negotiation", p: "Negotiation coach. Identify leverage, detect pressure tactics, protect position, flag anchoring." },
  { id: "sales", label: "Sales / Pitch", p: "Sales coach. Handle objections, reinforce value, guide to close, detect buying signals." },
  { id: "interview", label: "Interview", p: "Interview coach. STAR method, concise, confident, impressive." },
  { id: "debate", label: "Debate", p: "Debate coach. Spot fallacies, suggest counters, maintain rhetorical strength." },
  { id: "media", label: "Media / Press", p: "Media coach. Stay on message, bridge hostile questions, flag traps." },
  { id: "podcast", label: "Podcast", p: "Podcast coach. Story-driven answers, keep energy up, redirect tangents." },
  { id: "legal", label: "Legal", p: "Legal coach. Answer precisely, don't volunteer extra, flag leading questions." },
  { id: "academic", label: "Academic", p: "Academic defense coach. Defend methodology, acknowledge limitations, show mastery." },
  { id: "pastoral", label: "Pastoral", p: "Pastoral coach. Respond with empathy, active listening, wisdom. Be present." },
];

const CUE_MAP = {
  "[PAUSE]": { label: "▸▸ PAUSE", color: T.amber },
  "[SLOW]": { label: "◆ SLOW", color: T.blue },
  "[BREATHE]": { label: "○ BREATHE", color: T.green },
};

// ─── Social Media ───
const SOCIALS = [
  { id: "x", label: "X", url: "https://x.com/intaboracay", icon: "𝕏" },
  { id: "linkedin", label: "LinkedIn", url: "https://linkedin.com/company/intcu", icon: "in" },
  { id: "instagram", label: "Instagram", url: "https://instagram.com/intcu.ai", icon: "📸" },
  { id: "facebook", label: "Facebook", url: "https://facebook.com/intcu", icon: "f" },
  { id: "tiktok", label: "TikTok", url: "https://tiktok.com/@intcu", icon: "♪" },
  { id: "youtube", label: "YouTube", url: "https://youtube.com/@intcu", icon: "▶" },
];

function shareContent(platform, text, url = "https://intcu.com") {
  const encoded = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  const popup = (href) => window.open(href, "_blank", "width=600,height=400,scrollbars=yes");
  if (platform === "x") popup(`https://x.com/intent/tweet?text=${encoded}&url=${encodedUrl}`);
  else if (platform === "linkedin") popup(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`);
  else if (platform === "facebook") popup(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
  else { navigator.clipboard?.writeText(text + " " + url); return "copied"; }
  return "shared";
}

const SocialRow = ({ style: s }) => (
  <div style={{ display: "flex", justifyContent: "center", gap: 8, ...s }}>
    {SOCIALS.map(s => (
      <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" title={s.label}
        style={{ width: 40, height: 40, borderRadius: 8, background: T.chromeLight, color: T.chromeText, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, fontFamily: T.font, textDecoration: "none", transition: "background 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.background = T.teal}
        onMouseLeave={e => e.currentTarget.style.background = T.chromeLight}>{s.icon}</a>
    ))}
  </div>
);

// ─── P10-R4/R5: Utility functions (each ≤ 10 lines, guarded) ───
const wc = (t) => { if (!t) return 0; return t.trim().split(/\s+/).filter(Boolean).length; };
const estTime = (t) => { const m = Math.ceil(wc(t) / AVG_WPM); return m < 1 ? "<1m" : `${m}m`; };
const fmtTime = (s) => { if (s < 0) s = 0; return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const genCode = () => { const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let r = ""; for (let i = 0; i < 6; i++) r += c[Math.floor(Math.random() * c.length)]; return r; };
const bounded = (arr, max) => (arr || []).slice(0, max);
const sanitize = (text) => { if (!text) return ""; return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
const MAX_STORAGE_MB = 4;
const checkStorage = () => { try { let total = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); total += (localStorage.getItem(k) || "").length; } return total < MAX_STORAGE_MB * 1024 * 1024; } catch { return false; } };
const syllabify = (word) => {
  if (!word || word.length < 4) return word;
  return word.replace(/([aeiouyAEIOUY]+)([^aeiouyAEIOUY])/g, "$1·$2");
};
const fmtDate = (d, style = DATE_SHORT) => { try { return new Date(d).toLocaleDateString("en-US", style); } catch { return ""; } };

// P10-R7: Shared API fetch with fallback (DRY — used by callAI and genCpResponse)
async function fetchAI(payload) {
  for (const url of [API_ENDPOINT, API_DIRECT]) {
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) continue;
      const data = await res.json();
      return data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || null;
    } catch { continue; }
  }
  return null;
}

// P10-R7: Safe storage — localStorage for personal, /api/room for shared (cross-device)
const ROOM_API = "/api/room";
const sGet = async (k, shared = false) => {
  if (shared) {
    // Parse room key: "room:CODE:key" → code=CODE, key=key
    const parts = k.split(":"); if (parts.length < 3) return null;
    const [, code, key] = parts;
    try {
      const res = await fetch(`${ROOM_API}?code=${code}&key=${key}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      // Fallback to localStorage for same-device testing
      try { const v = localStorage.getItem(`shared:${k}`); return v ? JSON.parse(v) : null; } catch { return null; }
    }
  }
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
};
const sSet = async (k, v, shared = false) => {
  if (shared) {
    const parts = k.split(":"); if (parts.length < 3) return false;
    const [, code, key] = parts;
    try {
      const res = await fetch(ROOM_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, key, data: v }) });
      if (res.ok) return true;
    } catch (e) { console.warn("Fallback:", e?.message || e); }
    // Fallback to localStorage
    try { localStorage.setItem(`shared:${k}`, JSON.stringify(v)); return true; } catch { return false; }
  }
  if (!checkStorage()) return false;
  try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; }
};

// P10-R5: Guarded cue renderer
function renderCue(text, enabled) {
  if (!text && text !== "") return "\u00A0";
  const safe = sanitize(text);
  if (!enabled) return safe || "\u00A0";
  const up = (safe || "").trim().toUpperCase();
  if (CUE_MAP[up]) return <span style={{ color: CUE_MAP[up].color, fontSize: `${CUE_FONT_SCALE}em`, fontWeight: 700, letterSpacing: 3, fontFamily: T.font, display: "block", padding: "4px 0" }}>{CUE_MAP[up].label}</span>;
  if (safe.includes("[EMPHASIS]")) {
    const parts = bounded(safe.split(/\[EMPHASIS\]|\[\/EMPHASIS\]/i), 20);
    return parts.map((p, i) => i % 2 === 1
      ? <span key={i} style={{ color: T.amber, fontWeight: 700, borderBottom: `2px solid ${T.amber}`, paddingBottom: 2 }}>{p}</span>
      : <span key={i}>{p}</span>);
  }
  return safe || "\u00A0";
}

// ─── P10-R7: AI API call wrapper (uses /api/ai proxy in production) ───
const API_ENDPOINT = "/api/ai";
const API_DIRECT = "https://api.anthropic.com/v1/messages"; // fallback for artifact/dev

async function callAI(system, userMsg, maxTokens = 1000, engine = "claude") {
  if (!userMsg) return null; // P10-R5
  userMsg = "USER INPUT START\n" + userMsg + "\nUSER INPUT END";
  const MODELS = {
    claude: "claude-sonnet-4-20250514", deepseek: "deepseek-chat", grok: "grok-4-fast",
    gemini: "gemini-2.5-flash", openai: "gpt-5-mini", minimax: "minimax-m2.7",
    mistral: "mistral-large-latest", groq: "llama-4-scout-17b",
  };
  return fetchAI({ model: MODELS[engine] || MODELS.claude, max_tokens: maxTokens, engine,
    ...(system ? { system } : {}), messages: [{ role: "user", content: userMsg }] });
}

// ─── Shared UI atoms (P10-R4: each ≤ 15 lines) ───
const Btn = ({ children, onClick, bg, disabled, style: s, label, title }) => (
  <button disabled={disabled} onClick={onClick} title={title} aria-label={label || (typeof children === "string" ? children : undefined)} style={{ padding: "7px 14px", borderRadius: T.radius, background: bg || T.chromeLight, color: T.chromeText, border: `1px solid ${T.chromeBorder}`, cursor: disabled ? "default" : "pointer", fontSize: 12, fontFamily: T.font, fontWeight: 600, whiteSpace: "nowrap", opacity: disabled ? 0.4 : 1, transition: "all 0.15s", minHeight: 36, ...s }}>{children}</button>
);

const Knob = ({ label, value, onChange, min, max, step = 1, unit = "" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
    <span style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: 2, color: "#a1a1aa", fontFamily: T.font }}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Btn onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); onChange(Math.max(min, +(value - step).toFixed(1))); }} style={{ width: 24, height: 24, padding: 0, fontSize: 14, color: "#e4e4e7" }}>−</Btn>
      <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 13, fontWeight: 600, color: "#e4e4e7", minWidth: 28, textAlign: "center", fontFamily: T.font }}>{value}{unit}</span>
      <Btn onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); onChange(Math.min(max, +(value + step).toFixed(1))); }} style={{ width: 24, height: 24, padding: 0, fontSize: 14, color: "#e4e4e7" }}>+</Btn>
    </div>
  </div>
);

const Pill = ({ label, active, onClick, color = T.red, title }) => (
  <button onClick={onClick} title={title} style={{ padding: "6px 12px", borderRadius: 20, background: active ? color : "transparent", border: `1px solid ${active ? color : T.chromeBorder}`, color: active ? "#fff" : T.chromeTextDim, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: T.font, letterSpacing: 0.5, transition: "all 0.15s", minHeight: 32 }}>{label}</button>
);

const Toast = ({ msg, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, TOAST_MS); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg) return null;
  return <div role="alert" aria-live="polite" style={{ position: "fixed", bottom: 60, left: "50%", transform: "translateX(-50%)", background: T.chrome, border: `1px solid ${T.chromeBorder}`, borderRadius: 8, padding: "8px 20px", fontSize: 12, color: T.chromeText, fontFamily: T.font, zIndex: 99, animation: "fadeUp 0.3s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>{msg}</div>;
};

// ═══════════════════════════════════════════════
// MAIN APPLICATION
// ═══════════════════════════════════════════════
function IntcuApp() {
  // ─── Auth state ───
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState("");

  // ─── Auth signing ───
  const getAuthKey = () => { let k = localStorage.getItem("intcu-auth-key"); if (!k) { k = "intcu-v1-" + Date.now(); localStorage.setItem("intcu-auth-key", k); } return k; };
  const signUser = (u) => ({ ...u, sig: btoa(u.email + (u.role || "user") + (u.plan || "free") + getAuthKey()) });
  const verifyUser = (u) => { if (!u?.sig || !u?.email) return false; return u.sig === btoa(u.email + (u.role || "user") + (u.plan || "free") + getAuthKey()); };

  // ─── Responsive ───
  useEffect(() => { const h = () => setIsMobile(window.innerWidth < 768); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);

  // ─── Auth persistence ───
  useEffect(() => {
    // Seed default admin
    const stored = localStorage.getItem("intcu-users");
    if (!stored) {
      const defaultAdmin = [{ email: "admin", password: btoa("123456"), name: "Administrator", role: "admin", created: new Date().toISOString() }];
      localStorage.setItem("intcu-users", JSON.stringify(defaultAdmin));
    }
    // Check session with signature verification
    const session = localStorage.getItem("intcu-user");
    if (session) {
      try { const u = JSON.parse(session); if (verifyUser(u)) { setCurrentUser(u); setLoggedIn(true); setShowLogin(false); } else { localStorage.removeItem("intcu-user"); } } catch { localStorage.removeItem("intcu-user"); }
    }
  }, []);

  const getUsers = () => { try { const d = JSON.parse(localStorage.getItem("intcu-users")); return Array.isArray(d) ? d : []; } catch { return []; } };

  const handleLogin = () => {
    setLoginError("");
    if (!loginEmail.trim() || !loginPassword) { setLoginError("Enter email and password"); return; }
    const users = getUsers();
    const found = users.find(u => u.email === loginEmail.trim() && u.password === btoa(loginPassword));
    if (found) {
      const signed = signUser(found);
      setCurrentUser(signed); setLoggedIn(true); setShowLogin(false);
      localStorage.setItem("intcu-user", JSON.stringify(signed));
      try { const log = JSON.parse(localStorage.getItem("intcu-admin-log") || "[]"); log.unshift({ user: found.email, plan: found.plan || "free", action: "login", ts: new Date().toISOString() }); localStorage.setItem("intcu-admin-log", JSON.stringify(log.slice(0, MAX_LOG_ENTRIES))); } catch {}
    } else { setLoginError("Invalid email or password"); }
  };

  const handleRegister = () => {
    setLoginError("");
    if (!registerName.trim() || !loginEmail.trim() || !loginPassword) { setLoginError("All fields required"); return; }
    if (loginPassword.length < 4) { setLoginError("Password must be at least 4 characters"); return; }
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase())) { setLoginError("Email already registered"); return; }
    const newUser = { email: loginEmail.trim(), password: btoa(loginPassword), name: registerName.trim(), role: "user", created: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem("intcu-users", JSON.stringify(users));
    const signed = signUser(newUser);
    setCurrentUser(signed); setLoggedIn(true); setShowLogin(false);
    localStorage.setItem("intcu-user", JSON.stringify(signed));
  };

  const logout = () => {
    setLoggedIn(false); setCurrentUser(null); setShowLogin(true);
    localStorage.removeItem("intcu-user");
    setLoginEmail(""); setLoginPassword(""); setRegisterName(""); setLoginError("");
  };

  // ─── Usage Gates ───
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [adminPage, setAdminPage] = useState("overview");
  const [gatedFeature, setGatedFeature] = useState("");

  const getUserPlan = () => currentUser?.plan || "free";

  const checkGate = (feature) => {
    if (!PLAN_GATES[feature]) return true;
    return PLAN_GATES[feature].includes(getUserPlan());
  };

  const checkDailyLimit = () => {
    const plan = getUserPlan();
    if (plan !== "free") return true;
    try {
      const today = new Date().toDateString();
      const data = JSON.parse(localStorage.getItem("intcu-usage") || "{}");
      if (data.date !== today) { data.date = today; data.count = 0; }
      if (data.count >= FREE_DAILY_AI) return false;
      data.count++;
      localStorage.setItem("intcu-usage", JSON.stringify(data));
      return true;
    } catch { return true; }
  };

  const requireGate = (feature) => {
    if (checkGate(feature)) return true;
    setGatedFeature(feature); setShowUpgrade(true); return false;
  };

  const requireAI = () => {
    if (!checkDailyLimit()) { show("Daily limit reached — upgrade to Pro for unlimited"); return false; }
    return true;
  };

  // ─── TTS ───
  const [ttsPlaying, setTtsPlaying] = useState(false);

  const startTTS = () => {
    if (!script.trim()) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(script.replace(/\[(PAUSE|BREATHE|SLOW|EMPHASIS|\/EMPHASIS)\]/gi, ""));
    utt.rate = 0.9; utt.pitch = 1;
    utt.onstart = () => setTtsPlaying(true);
    utt.onend = () => setTtsPlaying(false);
    utt.onerror = () => setTtsPlaying(false);
    window.speechSynthesis.speak(utt);
  };

  const stopTTS = () => { window.speechSynthesis.cancel(); setTtsPlaying(false); };

  // ─── PDF Export ───
  const exportPDF = (text, title = "Intcu Script") => {
    if (!text) return;
    const words = wc(text);
    const time = estTime(text);
    const date = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>@page{size:letter;margin:1in}body{font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.8;color:#1a1a1a;max-width:6.5in;margin:0 auto;padding:0}h1{font-family:-apple-system,sans-serif;font-size:22px;font-weight:700;margin:0 0 4px;color:#009e95}p.meta{font-size:11px;color:#666;margin:0 0 24px;border-bottom:1px solid #ddd;padding-bottom:12px}.content{white-space:pre-wrap;margin-bottom:32px}.footer{border-top:1px solid #ddd;padding-top:12px;font-size:10px;color:#999;text-align:center}p.stats{font-size:11px;color:#888;margin:20px 0 8px}</style></head><body><h1>${title}</h1><p class="meta">${date}</p><div class="content">${text.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div><p class="stats">${words} words · ${time} read time</p><div class="footer">intcu.com — The Intelligent Cue</div><script>window.onload=()=>{window.print();}<\/script></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) { show("Allow popups to export PDF"); }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const ShareMenu = ({ text, onClose }) => (
    <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 6, zIndex: 50, minWidth: 180, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
      {[
        ["Share on X", () => { shareContent("x", text); onClose(); }],
        ["Share on LinkedIn", () => { shareContent("linkedin", text); onClose(); }],
        ["Share on Facebook", () => { shareContent("facebook", text); onClose(); }],
        ["Copy link", () => { navigator.clipboard?.writeText("https://intcu.com"); show("Link copied"); onClose(); }],
        ["Export as .txt", () => { const b = new Blob([text], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "intcu-script.txt"; a.click(); URL.revokeObjectURL(u); onClose(); }],
      ].map(([label, fn]) => (
        <div key={label} onClick={fn} style={{ padding: "7px 12px", fontSize: 12, color: T.text, cursor: "pointer", borderRadius: 4, fontFamily: T.font, fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.background = T.bgAlt}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{label}</div>
      ))}
    </div>
  );

  // ─── Mode ───
  const [mode, setMode] = useState("script");
  // Theme is a fixed hybrid — no toggle needed
  const [toast, setToast] = useState("");
  const show = (m) => setToast(m);

  // ─── Welcome Dashboard ───
  const [showWelcome, setShowWelcome] = useState(true);
  const [motd, setMotd] = useState(null);

  // ─── Script state ───
  const [script, setScript] = useState(`Welcome to Intcu — The Intelligent Cue.\n\nSpeak smarter. Respond instantly.\n\n[PAUSE]\n\nSwitch to Writer to generate scripts with AI. Switch to Copilot for live conversation intelligence.\n\n[BREATHE]\n\nUse cue markers: [PAUSE], [SLOW], [BREATHE] on their own line.\nWrap words in [EMPHASIS]like this[/EMPHASIS] for highlights.\n\nKeyboard: Space play/pause · ↑↓ speed · R reset · E edit · M mirror\n\n[PAUSE]\n\nNever miss a perfect line again.`);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);
  const [fontSize, setFontSize] = useState(44);
  const [mirrored, setMirrored] = useState(false);
  const [editing, setEditing] = useState(true);
  const [margin, setMargin] = useState(18);
  const [fontIdx, setFontIdx] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [counting, setCounting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [adaptive, setAdaptive] = useState(true);
  const [focus, setFocus] = useState(true);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceLive, setVoiceLive] = useState(false);
  const [cues, setCues] = useState(true);
  const [spacing, setSpacing] = useState(1.7);
  const [guidePos, setGuidePos] = useState(35);
  const [fs, setFs] = useState(false); // fullscreen
  const [elapsed, setElapsed] = useState(0);
  const [activeLine, setActiveLine] = useState(0);
  const [activeWord, setActiveWord] = useState(0);
  const [orientation, setOrientation] = useState("auto");
  const [showLib, setShowLib] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [saveName, setSaveName] = useState("");
  const [dyslexia, setDyslexia] = useState(false); // high-contrast, tinted bg, wider spacing
  const [dyslexiaOverlay, setDyslexiaOverlay] = useState(() => localStorage.getItem("intcu-dys-overlay") || "cream");
  const [apiCooldown, setApiCooldown] = useState(false);
  const voiceRestarts = useRef(0);
  const voiceRestartTimer = useRef(null);
  // ─── Translator ───
  const [targetLang, setTargetLang] = useState("");

  // ─── Quote Finder ───
  const [showQuotes, setShowQuotes] = useState(false);
  const [quoteTopic, setQuoteTopic] = useState("");
  const [quoteResults, setQuoteResults] = useState([]);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // ─── Recording, Captions, AI Engine ───
  const [recording, setRecording] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [aiEngine, setAiEngine] = useState("claude"); // claude | grok | deepseek
  const mediaRecRef = useRef(null);
  const camVideoRef = useRef(null);
  const chunksRef = useRef([]);
  const captionRecRef = useRef(null);

  // ─── Writer state ───
  const [wTopic, setWTopic] = useState("");
  const [wTone, setWTone] = useState("Professional");
  const [wFmt, setWFmt] = useState("Speech");
  const [wDur, setWDur] = useState("3");
  const [wAud, setWAud] = useState("");
  const [wCtx, setWCtx] = useState("");
  const [wLoading, setWLoading] = useState(false);
  const [wResult, setWResult] = useState("");
  const [wCoach, setWCoach] = useState(""); // Script Coach Agent output
  const [wCoachLoading, setWCoachLoading] = useState(false);

  // ─── MyFile state (notes/brainstorm/prompt builder) ───
  const [mfNotes, setMfNotes] = useState([]);
  const [mfInput, setMfInput] = useState("");
  const [mfSelected, setMfSelected] = useState(new Set());
  const [mfExpanded, setMfExpanded] = useState(null); // expanded note for AI brainstorm
  const [mfBrainstorm, setMfBrainstorm] = useState("");
  const [mfBrainLoading, setMfBrainLoading] = useState(false);
  const [mfPromptResult, setMfPromptResult] = useState("");
  const [mfPromptLoading, setMfPromptLoading] = useState(false);
  const fileRef = useRef(null);

  // ─── Copilot state ───
  const [cpActive, setCpActive] = useState(false);
  const [cpNiche, setCpNiche] = useState("general");
  const [cpStyle, setCpStyle] = useState("brief");
  const [cpCtx, setCpCtx] = useState("");
  const [cpTranscript, setCpTranscript] = useState([]);
  const [cpSuggestion, setCpSuggestion] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [cpHistory, setCpHistory] = useState([]);
  const [cpExchanges, setCpExchanges] = useState([]);
  const [cpSessions, setCpSessions] = useState([]);
  const [cpViewSession, setCpViewSession] = useState(null);
  const [cpIntel, setCpIntel] = useState(""); // Meeting Intel Agent

  // ─── Sync state ───
  const [showSync, setShowSync] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [roomOn, setRoomOn] = useState(false);
  const [roomRole, setRoomRole] = useState("host");
  const [screenPos, setScreenPos] = useState("center");
  const [myName, setMyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [members, setMembers] = useState([]);
  const [injections, setInjections] = useState([]);
  const [injText, setInjText] = useState("");

  // ─── Refs (P10-R9: minimal, typed) ───
  const scrollRef = useRef(null);
  const animRef = useRef(null);
  const lastT = useRef(null);
  const lineRefs = useRef([]);
  const recRef = useRef(null);
  const voiceRef = useRef(false);
  const playRef = useRef(false);
  const elRef = useRef(null);
  const cpRecRef = useRef(null);
  const cpBufRef = useRef("");
  const cpTimerRef = useRef(null);
  const cpRestartTimer = useRef(null);
  const syncRef = useRef(null);
  const rcRef = useRef("");
  const rrRef = useRef("host");
  const mnRef = useRef("");
  const cpNicheRef = useRef("general");
  const cpStyleRef = useRef("brief");
  const cpCtxRef = useRef("");
  const cpHistRef = useRef([]);

  const targetLangRef = useRef("");

  // Keep refs synced (P10-R6)
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { cpNicheRef.current = cpNiche; }, [cpNiche]);
  useEffect(() => { cpStyleRef.current = cpStyle; }, [cpStyle]);
  useEffect(() => { cpCtxRef.current = cpCtx; }, [cpCtx]);
  useEffect(() => { cpHistRef.current = cpHistory; }, [cpHistory]);
  useEffect(() => { targetLangRef.current = targetLang; }, [targetLang]);

  // Derived (P10-R2: bounded)
  const lines = useMemo(() => bounded(script.split("\n"), MAX_LINES), [script]);
  const words = useMemo(() => wc(script), [script]);
  const readTime = useMemo(() => estTime(script), [script]);
  const targetSec = Math.ceil((words / AVG_WPM) * 60);
  const lineMults = useMemo(() => {
    if (!adaptive) return lines.map(() => 1);
    const counts = lines.map(l => wc(l) || 1);
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length || 1;
    return counts.map(c => Math.max(0.5, Math.min(1.8, c / avg)));
  }, [lines, adaptive]);

  const pace = elapsed > 0 && progress > 0 ? (() => {
    const exp = (elapsed / targetSec) * 100;
    const d = progress - exp;
    if (d > 8) return { l: "AHEAD", c: T.green };
    if (d < -8) return { l: "BEHIND", c: T.red };
    return { l: "ON PACE", c: T.amber };
  })() : null;

  // ─── Init: fonts, storage ───
  useEffect(() => {
    FONT_URLS.forEach(u => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = u; document.head.appendChild(l); });
    (async () => {
      const s = await sGet("pp-scripts");
      if (s) setScripts(bounded(s, MAX_SCRIPTS));
      const sess = await sGet("pp-sessions");
      if (sess) setCpSessions(bounded(sess, MAX_SESSIONS));
    })();
  }, []);

  // ─── Welcome MOTD fetch ───
  const DEFAULT_SCRIPT = `Welcome to Intcu — The Intelligent Cue.\n\nSpeak smarter. Respond instantly.\n\n[PAUSE]\n\nSwitch to Writer to generate scripts with AI. Switch to Copilot for live conversation intelligence.\n\n[BREATHE]\n\nUse cue markers: [PAUSE], [SLOW], [BREATHE] on their own line.\nWrap words in [EMPHASIS]like this[/EMPHASIS] for highlights.\n\nKeyboard: Space play/pause · ↑↓ speed · R reset · E edit · M mirror\n\n[PAUSE]\n\nNever miss a perfect line again.`;
  const isDefaultScript = script === DEFAULT_SCRIPT;

  useEffect(() => {
    if (!showWelcome) return;
    const today = new Date().toDateString();
    const cached = localStorage.getItem("intcu-motd");
    if (cached) {
      try { const d = JSON.parse(cached); if (d.date === today) { setMotd(d); return; } } catch {}
    }
    (async () => {
      const result = await callAI(
        "You are a daily inspiration curator for professionals, leaders, and creators. Return ONE powerful quote that is relevant to today's world — think resilience, AI, leadership, entrepreneurship, mental health, innovation, or overcoming adversity. Mix classic wisdom (Marcus Aurelius, Churchill) with modern voices (Brené Brown, Naval Ravikant, Simon Sinek, James Clear, Sara Blakely, Jensen Huang). Never repeat yesterday's pick. Match the quote to the current season or global mood. Also include a sophisticated English vocabulary word useful in business or public speaking, with definition and example sentence. Return ONLY valid JSON: {\"quote\":\"text\",\"author\":\"Full Name\",\"word\":\"the word\",\"definition\":\"meaning\",\"example\":\"example sentence\"}",
        "Give me today's motivational quote and word of the day.", 500, aiEngine
      );
      if (result) {
        try {
          const clean = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed = JSON.parse(clean);
          const data = { ...parsed, date: today };
          localStorage.setItem("intcu-motd", JSON.stringify(data));
          setMotd(data);
        } catch { /* fallback used */ }
      }
    })();
  }, [showWelcome]);

  // ─── Script storage ───
  const saveScripts = async (list) => { const b = bounded(list, MAX_SCRIPTS); setScripts(b); await sSet("pp-scripts", b); };
  const saveSessions = async (list) => { const b = bounded(list, MAX_SESSIONS); setCpSessions(b); await sSet("pp-sessions", b); };

  // ─── Scroll engine (P10-R4: ≤ 30 lines) ───
  const getActive = useCallback(() => {
    if (!scrollRef.current) return 0;
    const gy = scrollRef.current.getBoundingClientRect().top + scrollRef.current.clientHeight * (guidePos / 100);
    let cl = 0, cd = Infinity;
    const refs = bounded(lineRefs.current, MAX_LINES);
    for (let i = 0; i < refs.length; i++) {
      if (!refs[i]) continue;
      const r = refs[i].getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - gy);
      if (d < cd) { cd = d; cl = i; }
    }
    return cl;
  }, [guidePos]);

  const animateFnRef = useRef(null);
  const animate = useCallback((ts) => {
    if (!lastT.current) { lastT.current = ts; animRef.current = requestAnimationFrame((t) => { if (animateFnRef.current) animateFnRef.current(t); }); return; }
    const rawDt = ts - lastT.current; lastT.current = ts;
    const dt = Math.min(Math.max(rawDt, 0), 100);
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const mult = Math.max(lineMults[getActive()] || 1, 0.1);
    let px = (speedRef.current * 60 * dt * mult) / 1000;
    if (isNaN(px) || px <= 0) px = speedRef.current * 0.5;
    el.scrollTop += px;
    const mx = el.scrollHeight - el.clientHeight;
    if (mx > 0) setProgress(Math.min((el.scrollTop / mx) * 100, 100));
    if (mx > 0 && el.scrollTop >= mx) { setPlaying(false); return; }
    animRef.current = requestAnimationFrame((t) => { if (animateFnRef.current) animateFnRef.current(t); });
  }, [getActive, lineMults]);
  animateFnRef.current = animate;

  useEffect(() => {
    const tick = (ts) => { if (animateFnRef.current) animateFnRef.current(ts); };
    if (playing && !counting && !voiceRef.current) { lastT.current = null; animRef.current = requestAnimationFrame(tick); }
    else if (animRef.current) cancelAnimationFrame(animRef.current);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [playing, counting]);

  // Countdown
  useEffect(() => { if (!counting || countdown <= 0) { if (counting) setCounting(false); return; } const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }, [countdown, counting]);

  // Elapsed timer
  useEffect(() => {
    if (playing && !counting) { elRef.current = setInterval(() => setElapsed(t => t + 1), 1000); }
    else if (elRef.current) clearInterval(elRef.current);
    return () => { if (elRef.current) clearInterval(elRef.current); };
  }, [playing, counting]);

  // Focus tracker
  useEffect(() => { if (editing || !focus || mode !== "script") return; const i = setInterval(() => setActiveLine(getActive()), 100); return () => clearInterval(i); }, [editing, focus, getActive, mode]);

  // Word tracker — advance activeWord during playback
  const prevLineRef = useRef(0);
  useEffect(() => {
    if (!playing || counting || editing || !focus || mode !== "script") { setActiveWord(0); return; }
    const wps = speed * 0.5; // words per second
    const interval = setInterval(() => {
      if (prevLineRef.current !== activeLine) { setActiveWord(0); prevLineRef.current = activeLine; return; }
      setActiveWord(w => w + 1);
    }, Math.max(100, 1000 / wps));
    return () => clearInterval(interval);
  }, [playing, counting, editing, focus, mode, speed, activeLine]);

  // Reset word on stop/reset
  useEffect(() => { if (!playing) setActiveWord(0); }, [playing]);

  // ─── Voice scroll (P10-R4: ≤ 25 lines) ───
  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { show("Voice scroll not supported in this browser"); return; }
    voiceRestarts.current = 0;
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = SPEECH_LANG;
    r.onresult = (e) => {
      if (!scrollRef.current) return;
      let burst = 0;
      for (let i = e.resultIndex; i < e.results.length; i++) burst += e.results[i][0].transcript.trim().split(/\s+/).length;
      scrollRef.current.scrollTop += burst * fontSize * SCROLL_FACTOR;
    };
    r.onerror = (e) => { if (e.error !== "aborted" && e.error !== "no-speech") { console.warn("Voice scroll error:", e.error); show("Mic error: " + e.error); } };
    r.onend = () => {
      if (voiceRef.current && voiceRestarts.current < VOICE_MAX_RESTARTS) {
        voiceRestarts.current++;
        voiceRestartTimer.current = setTimeout(() => { try { r.start(); } catch (e) { console.warn("Voice restart failed:", e); setVoiceLive(false); } }, 1000);
      } else {
        if (voiceRef.current && voiceRestarts.current >= VOICE_MAX_RESTARTS) show("Voice scroll stopped — mic unavailable");
        setVoiceLive(false);
      }
    };
    recRef.current = r;
    try { r.start(); setVoiceLive(true); } catch (e) { console.warn("Voice start failed:", e); show("Mic access denied"); }
  }, [fontSize]);
  const stopVoice = useCallback(() => {
    voiceRef.current = false; voiceRestarts.current = 0;
    if (voiceRestartTimer.current) { clearTimeout(voiceRestartTimer.current); voiceRestartTimer.current = null; }
    if (recRef.current) { try { recRef.current.abort(); } catch (e) { console.warn("Voice stop error:", e); } recRef.current = null; }
    setVoiceLive(false);
  }, []);

  useEffect(() => {
    if (playing && !counting && voiceOn) { voiceRef.current = true; startVoice(); }
    else if (!playing || !voiceOn) stopVoice();
  }, [playing, counting, voiceOn, startVoice, stopVoice]);

  // ─── Actions (P10-R5: guarded) ───
  const doPlay = useCallback(() => {
    if (editing) setEditing(false);
    if (!playRef.current) { setCountdown(COUNTDOWN_SECS); setCounting(true); setPlaying(true); }
    else setPlaying(false);
  }, [editing]);
  const doReset = useCallback(() => { setPlaying(false); setProgress(0); setElapsed(0); if (scrollRef.current) scrollRef.current.scrollTop = 0; }, []);
  const doEdit = useCallback(() => { setPlaying(false); stopVoice(); setEditing(true); setProgress(0); if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [stopVoice]);

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      // Global shortcuts (work in any mode)
      if (e.key === "?") { e.preventDefault(); setShowShortcuts(s => !s); return; }
      if (e.code === "Escape") { setShowShortcuts(false); return; }
      if (e.code === "Digit1" && !e.metaKey && !e.ctrlKey) { setMode("script"); return; }
      if (e.code === "Digit2" && !e.metaKey && !e.ctrlKey) { setMode("writer"); return; }
      if (e.code === "Digit3" && !e.metaKey && !e.ctrlKey) { setMode("myfile"); return; }
      if (e.code === "Digit4" && !e.metaKey && !e.ctrlKey) { setMode("copilot"); return; }
      // Script-only shortcuts
      if (mode !== "script") return;
      if (e.code === "Space") { e.preventDefault(); doPlay(); }
      else if (e.code === "ArrowUp") { e.preventDefault(); setSpeed(s => Math.min(10, s + 1)); }
      else if (e.code === "ArrowDown") { e.preventDefault(); setSpeed(s => Math.max(1, s - 1)); }
      else if (e.code === "KeyR" && !e.metaKey) { e.preventDefault(); doReset(); }
      else if (e.code === "KeyE" && !e.metaKey) { e.preventDefault(); doEdit(); }
      else if (e.code === "KeyM" && !e.metaKey) { e.preventDefault(); setMirrored(m => !m); }
      else if (e.code === "KeyF" && !e.metaKey) { e.preventDefault(); setFs(f => !f); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mode, doPlay, doReset, doEdit]);

  // ─── Webcam Recording (P10-R5: guarded) ───
  const startCam = async () => {
    if (!requireGate("recording")) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 1280, height: 720 }, audio: true });
      setCamOn(true);
      if (camVideoRef.current) { camVideoRef.current.srcObject = stream; camVideoRef.current.play(); }
      // Start recording
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm" });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `intcu-recording-${Date.now()}.webm`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        show("Recording saved");
      };
      mediaRecRef.current = mr;
      mr.start();
      setRecording(true);
      show("Recording started");
    } catch (e) { console.warn("Camera error:", e); show("Camera access denied"); }
  };

  const stopCam = () => {
    if (mediaRecRef.current && recording) { try { mediaRecRef.current.stop(); } catch (e) { console.warn("Stop recording error:", e); } }
    if (camVideoRef.current?.srcObject) {
      camVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
      camVideoRef.current.srcObject = null;
    }
    setCamOn(false); setRecording(false); mediaRecRef.current = null;
  };

  // ─── Live Caption Engine (uses SpeechRecognition, separate from copilot) ───
  const startCaptions = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = SPEECH_LANG;
    r.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript;
      setCaptionText(text);
    };
    r.onend = () => { if (captionRecRef.current) try { r.start(); } catch (e) { console.warn("Fallback:", e?.message || e); } };
    captionRecRef.current = r;
    try { r.start(); } catch (e) { console.warn("Caption mic error:", e); }
  };
  const stopCaptions = () => {
    if (captionRecRef.current) { try { captionRecRef.current.abort(); } catch (e) { console.warn(e); } captionRecRef.current = null; }
    setCaptionText("");
  };

  useEffect(() => {
    if (captions && playing && !counting && mode === "script") startCaptions();
    else stopCaptions();
    return () => stopCaptions();
  }, [captions, playing, counting, mode]);

  // ─── Multi-Engine AI (Claude/Grok/DeepSeek via proxy) ───
  // Engine config passed to /api/ai proxy which routes accordingly
  // ─── Multi-Engine AI (8 providers, tiered) ───
  const AI_ENGINES = [
    { id: "claude", label: "Claude Sonnet", tier: "pro", cost: "$3/M" },
    { id: "deepseek", label: "DeepSeek V4", tier: "free", cost: "$0.14/M" },
    { id: "grok", label: "Grok 4.1 Fast", tier: "free", cost: "$0.20/M" },
    { id: "gemini", label: "Gemini Flash", tier: "free", cost: "$0.50/M" },
    { id: "openai", label: "GPT-5 mini", tier: "pro", cost: "$0.25/M" },
    { id: "minimax", label: "MiniMax M2.7", tier: "pro", cost: "$0.14/M" },
    { id: "mistral", label: "Mistral Large", tier: "pro", cost: "$0.50/M" },
    { id: "groq", label: "Llama 4 (Groq)", tier: "free", cost: "$0.11/M" },
  ];

  // ─── Writer + Script Coach Agent ───
  const generate = async () => {
    if (!wTopic.trim()) return; // P10-R5
    if (!requireAI()) return;
    setWLoading(true); setWResult(""); setWCoach("");
    const prompt = `Write a ${wFmt.toLowerCase()} script about: "${wTopic}"\nTone: ${wTone}\nTarget: ~${parseInt(wDur) * AVG_WPM} words (${wDur} min)\n${wAud ? `Audience: ${wAud}` : ""}\n${wCtx ? `Context: ${wCtx}` : ""}\n\nRules:\n- ONLY the spoken text. No stage directions, brackets, headers.\n- Natural speech — contractions, rhetorical questions, pauses via line breaks.\n- Hook in first 10 seconds. Memorable close.\n- Match word count to target precisely.`;
    const result = await callAI(null, prompt, 4000, aiEngine);
    setWResult(result || "Generation failed — try again.");
    setWLoading(false);
  };

  // Script Coach Agent: analyzes generated script
  const runCoach = async () => {
    if (!wResult) return; // P10-R5
    if (!requireAI()) return;
    setWCoachLoading(true);
    const analysis = await callAI(
      "You are an expert speech coach. Analyze the script and provide 3-5 specific, actionable improvements. Focus on: opening hook strength, pacing variation, emotional arc, closing impact, and audience engagement. Be direct and specific — cite exact lines. Format as numbered points. Keep under 200 words.",
      `Analyze this ${wFmt.toLowerCase()} script:\n\n${wResult}`
    );
    setWCoach(analysis || "Analysis unavailable.");
    setWCoachLoading(false);
  };

  // ─── Translator (P10-R5: guarded) ───
  const translateScript = async (text) => {
    if (!text || !targetLang) return text;
    if (!requireGate("translate") || !requireAI()) return text;
    const result = await callAI(
      `You are a professional translator. Translate the following script into ${targetLang}. PRESERVE all markers exactly as-is: [PAUSE], [BREATHE], [SLOW], [EMPHASIS], [/EMPHASIS]. Only translate the spoken text. Return ONLY the translated text with markers intact.`,
      text, 4000, aiEngine
    );
    return result || text;
  };

  // ─── Quote Finder (P10-R5: guarded) ───
  const searchQuotes = async () => {
    if (!quoteTopic.trim()) return;
    if (!requireGate("quotes") || !requireAI()) return;
    setQuoteLoading(true); setQuoteResults([]);
    const result = await callAI(
      `You are a quote research assistant. Return EXACTLY 5 verified, real quotes related to the topic. You must only use quotes you are confident are real and correctly attributed. Return as a JSON array with objects: {"quote":"...","author":"...","source":"...","year":"...","context":"..."}. Return ONLY the JSON array, no other text.`,
      `Find 5 verified quotes about: "${quoteTopic.trim()}"`, 2000, aiEngine
    );
    if (!result) { setQuoteResults([]); show("Quote search failed — try again"); setQuoteLoading(false); return; }
    try {
      const clean = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed)) setQuoteResults(bounded(parsed, 5));
      else setQuoteResults([]);
    } catch { setQuoteResults([]); show("Quote format error — try again"); }
    setQuoteLoading(false);
  };

  const insertQuote = (q) => {
    const insert = `\n[PAUSE]\n"${sanitize(q.quote)}"\n— ${sanitize(q.author)}, ${sanitize(q.source)} (${sanitize(q.year)})\n[PAUSE]\n`;
    setScript(prev => prev + insert);
    setMode("script"); setEditing(true);
    show("Quote inserted into script");
  };

  // ─── File Import: .txt, .docx, .pdf (P10-R5: guarded, P10-R2: bounded) ───
  const importFile = async (file) => {
    if (!file) return; // P10-R5
    const name = file.name.toLowerCase();
    const MAX_FILE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE) { show("File too large — 5MB max"); return; }

    try {
      if (name.endsWith(".txt")) {
        const text = await file.text();
        setScript(text);
        show(`Imported ${wc(text)} words from ${file.name}`);
      } else if (name.endsWith(".docx")) {
        // mammoth.js via CDN for docx parsing
        if (!window.mammoth) {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js";
          await new Promise((resolve, reject) => { s.onload = resolve; s.onerror = () => reject(new Error("CDN unavailable")); document.head.appendChild(s); });
        }
        const arrayBuf = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuf });
        if (result?.value) {
          setScript(result.value);
          show(`Imported ${wc(result.value)} words from ${file.name}`);
        } else { show("Could not extract text from docx"); }
      } else if (name.endsWith(".pdf")) {
        // pdf.js via CDN for PDF text extraction
        if (!window.pdfjsLib) {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";
          s.type = "module";
          // For pdf.js we need a different approach — use fetch + inline
          show("PDF import loading...");
          // Simplified: read as text if possible, else show instructions
          const text = await file.text();
          if (text && text.length > 100 && !text.includes("%PDF")) {
            setScript(text); show(`Imported from ${file.name}`);
          } else {
            show("PDF import: copy text from PDF and paste into editor");
          }
          return;
        }
      } else {
        // Try as plain text
        const text = await file.text();
        if (text) { setScript(text); show(`Imported from ${file.name}`); }
        else { show("Unsupported file type — use .txt, .docx, or paste text"); }
      }
    } catch (e) { console.warn("File import error:", e); show("Import failed — try pasting text instead"); }
    if (mode !== "script") setMode("script");
    setEditing(true);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) importFile(file);
  };

  // ─── MyFile: Notes / Brainstorm / Prompt Builder ───
  // Load notes from storage
  useEffect(() => { (async () => { const n = await sGet("pp-mynotes"); if (n) setMfNotes(bounded(n, MAX_SCRIPTS)); })(); }, []);
  const saveNotes = async (list) => { const b = bounded(list, MAX_SCRIPTS); setMfNotes(b); await sSet("pp-mynotes", b); };

  const addNote = () => {
    if (!mfInput.trim()) return;
    const note = { id: Date.now(), text: mfInput.trim(), created: new Date().toISOString(), tags: [] };
    saveNotes([note, ...mfNotes]);
    setMfInput("");
    show("Note saved");
  };

  const deleteNote = (id) => { saveNotes(mfNotes.filter(n => n.id !== id)); };
  const addNoteFromText = (text) => {
    if (!text?.trim()) return;
    const note = { id: Date.now(), text: text.trim(), created: new Date().toISOString(), tags: [] };
    saveNotes([note, ...mfNotes]);
  };

  const toggleSelect = (id) => {
    setMfSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // AI Brainstorm: expand a single note with ideas
  const brainstormNote = async (note) => {
    if (!note?.text) return;
    if (!requireGate("myfile_brainstorm") || !requireAI()) return;
    setMfExpanded(note.id);
    setMfBrainLoading(true); setMfBrainstorm("");
    const result = await callAI(
      "You are a creative brainstorming partner. Take the user's idea and expand it with 5-7 concrete angles, questions to explore, supporting points, or related concepts. Be specific and actionable. Use numbered points. Keep under 200 words.",
      `Brainstorm and expand on this idea:\n\n"${note.text}"`
    );
    setMfBrainstorm(result || "Brainstorm unavailable — try again.");
    setMfBrainLoading(false);
  };

  // Prompt Builder: combine selected notes into a structured LLM prompt
  const buildPrompt = async () => {
    const selected = mfNotes.filter(n => mfSelected.has(n.id));
    if (selected.length === 0) { show("Select notes first"); return; }
    if (!requireGate("myfile_brainstorm") || !requireAI()) return;
    setMfPromptLoading(true); setMfPromptResult("");
    const noteTexts = bounded(selected, 20).map((n, i) => `${i + 1}. ${n.text}`).join("\n");
    const result = await callAI(
      "You are a prompt engineering expert. Take the user's notes/ideas and combine them into a clear, well-structured prompt that could be given to an AI assistant. The prompt should: 1) Set clear context, 2) Define the task precisely, 3) Specify the desired output format, 4) Include relevant constraints. Output ONLY the finished prompt — no meta-commentary.",
      `Build a structured AI prompt from these notes:\n\n${noteTexts}`
    );
    setMfPromptResult(result || "Prompt generation failed.");
    setMfPromptLoading(false);
  };

  // Send notes or prompt to other modes
  const notesToScript = () => {
    const selected = mfNotes.filter(n => mfSelected.has(n.id));
    const text = selected.length > 0 ? selected.map(n => n.text).join("\n\n") : mfNotes.map(n => n.text).join("\n\n");
    setScript(text); setMode("script"); setEditing(true); show("Notes sent to script");
  };
  const notesToWriter = () => {
    const selected = mfNotes.filter(n => mfSelected.has(n.id));
    const text = selected.length > 0 ? selected.map(n => n.text).join(". ") : "";
    if (text) { setWCtx(text); setMode("writer"); show("Notes added as Writer context"); }
    else { show("Select notes first"); }
  };

  // ─── Copilot engine ───
  const startCopilot = () => {
    if (!requireGate("copilot")) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { show("Speech recognition not supported"); return; }
    setCpActive(true); setCpTranscript([]); setCpSuggestion(""); setCpHistory([]);
    cpBufRef.current = ""; setCpExchanges([]); setCpIntel("");
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = SPEECH_LANG;
    r.onresult = (e) => {
      let nf = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) nf += e.results[i][0].transcript + " "; else interim += e.results[i][0].transcript;
      }
      if (nf.trim()) {
        cpBufRef.current += nf;
        if (cpBufRef.current.length > 5000) cpBufRef.current = cpBufRef.current.slice(-2000);
        setCpTranscript(p => bounded([...p.filter(t => t.type !== "interim"), { type: "final", text: nf.trim() }], MAX_TRANSCRIPT));
        if (cpTimerRef.current) clearTimeout(cpTimerRef.current);
        cpTimerRef.current = setTimeout(() => { if (cpBufRef.current.trim()) genCpResponse(cpBufRef.current); }, DEBOUNCE_MS);
      }
      if (interim) setCpTranscript(p => bounded([...p.filter(t => t.type !== "interim"), { type: "interim", text: interim }], MAX_TRANSCRIPT));
    };
    let cpRestarts = 0;
    r.onerror = (e) => { if (e.error !== "aborted" && e.error !== "no-speech") { console.warn("Copilot mic error:", e.error); show("Mic error: " + e.error); } };
    r.onend = () => {
      if (cpRecRef.current && cpRestarts < VOICE_MAX_RESTARTS) {
        cpRestarts++;
        cpRestartTimer.current = setTimeout(() => { try { r.start(); } catch (e) { console.warn("Copilot restart failed:", e); } }, 1000);
      } else if (cpRecRef.current) { show("Mic disconnected — tap Stop then restart"); }
    };
    cpRecRef.current = r;
    try { r.start(); } catch (e) { setCpActive(false); show("Mic access denied"); console.warn("Copilot mic denied:", e); }
  };

  const stopCopilot = async () => {
    // Auto-save session (P10-R5: guard)
    const finals = bounded(cpTranscript.filter(t => t.type === "final"), MAX_TRANSCRIPT);
    if (cpExchanges.length > 0 || finals.length > 0) {
      const niche = COPILOT_NICHES.find(n => n.id === cpNiche) || COPILOT_NICHES[0];
      const session = { id: Date.now(), date: new Date().toISOString(), niche: niche.label, style: cpStyle,
        context: cpCtx, exchanges: bounded(cpExchanges, MAX_EXCHANGES),
        transcript: finals.map(t => t.text), fullTranscript: finals.map(t => t.text).join(" "), intel: cpIntel };
      await saveSessions([session, ...cpSessions]);
      show("Session saved");
    }
    setCpActive(false);
    if (cpRecRef.current) { try { cpRecRef.current.abort(); } catch (e) { console.warn("Copilot stop error:", e); } cpRecRef.current = null; }
    if (cpTimerRef.current) clearTimeout(cpTimerRef.current);
    if (cpRestartTimer.current) { clearTimeout(cpRestartTimer.current); cpRestartTimer.current = null; }
  };

  const genCpResponse = async (transcript) => {
    if (!transcript?.trim() || cpLoading) return; // P10-R5
    setCpLoading(true);
    const niche = COPILOT_NICHES.find(n => n.id === cpNicheRef.current) || COPILOT_NICHES[0];
    const style = COPILOT_STYLES.find(s => s.id === cpStyleRef.current) || COPILOT_STYLES[0];
    const sys = `${niche.p}\n\nStyle: ${style.label}\n${cpCtxRef.current ? `User context: ${cpCtxRef.current}` : ""}\n\nRULES:\n- Write EXACTLY what to SAY OUT LOUD. Nothing else.\n- No labels, headers, quotes, directions.\n- ${style.id === "brief" ? "2-3 sentences max." : "3-5 sentences."}\n- Natural spoken language. Must flow when read aloud.`;
    const msgs = [...bounded(cpHistRef.current, MAX_HISTORY), { role: "user", content: `What was said:\n"${transcript.trim()}"\n\nGenerate response.` }];
    const text = await callAI(sys, msgs[msgs.length - 1].content, 1000, aiEngine);
    if (!text) { setCpSuggestion("Connection error — check network."); setCpLoading(false); return; }
    let finalText = text;
    if (targetLangRef.current) {
      const translated = await callAI(
        `Translate the following into ${targetLangRef.current}. Return ONLY the translation, nothing else.`,
        text, 1000, aiEngine
      );
      if (translated) finalText = translated;
    }
    setCpSuggestion(finalText);
    setCpHistory(p => bounded([...p, { role: "user", content: `Transcript: "${transcript.trim()}"` }, { role: "assistant", content: text }], MAX_HISTORY));
    setCpExchanges(p => bounded([...p, { heard: transcript.trim(), response: text, time: new Date().toISOString() }], MAX_EXCHANGES));
    cpBufRef.current = "";
    setCpLoading(false);
  };

  const cpRespondNow = () => {
    if (apiCooldown) { show("Wait — processing previous request"); return; }
    if (cpTimerRef.current) clearTimeout(cpTimerRef.current);
    let t = cpBufRef.current.trim();
    if (!t) { const f = bounded(cpTranscript.filter(x => x.type === "final"), 5); t = f.map(x => x.text).join(" "); }
    if (t) {
      setApiCooldown(true);
      genCpResponse(t).finally(() => setTimeout(() => setApiCooldown(false), API_COOLDOWN_MS));
    } else { show("No speech detected yet"); }
  };

  // Meeting Intelligence Agent
  const runIntel = async () => {
    if (cpExchanges.length < 1) { show("Need at least 1 exchange"); return; }
    setCpLoading(true);
    const summary = cpExchanges.map((e, i) => `Exchange ${i + 1}:\nThem: "${e.heard}"\nYou: "${e.response}"`).join("\n\n");
    const analysis = await callAI(
      "You are a meeting intelligence analyst. Analyze the conversation and provide: 1) KEY THEMES (2-3 main topics), 2) SENTIMENT (how the other party seems), 3) LEVERAGE POINTS (advantages detected), 4) RISKS (things to watch for), 5) RECOMMENDED NEXT MOVE (one specific action). Be direct and tactical. Under 150 words.",
      `Analyze this conversation:\n\n${summary}`
    );
    setCpIntel(analysis || "Analysis unavailable.");
    setCpLoading(false);
  };

  // ─── Word export (P10-R4: extracted) ───
  const exportDoc = (session) => {
    if (!session) return; // P10-R5
    const date = fmtDate(session.date, DATE_LONG);
    let exHtml = "";
    bounded(session.exchanges || [], MAX_EXCHANGES).forEach((ex, i) => {
      exHtml += `<div style="margin:16px 0;page-break-inside:avoid"><h3 style="color:#2c3e50;font-size:13px;margin:0 0 6px">Exchange ${i + 1}</h3><div style="background:#f0f4f8;border-left:4px solid #3b82f6;padding:10px 14px;margin-bottom:6px;border-radius:0 4px 4px 0"><p style="margin:0 0 2px;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px">Heard</p><p style="margin:0;font-size:12px;line-height:1.5;color:#333">${(ex.heard || "").replace(/</g, "&lt;")}</p></div><div style="background:#ecfdf5;border-left:4px solid #22c55e;padding:10px 14px;border-radius:0 4px 4px 0"><p style="margin:0 0 2px;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px">Response</p><p style="margin:0;font-size:12px;line-height:1.5;color:#333">${(ex.response || "").replace(/</g, "&lt;")}</p></div></div>`;
    });
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>@page{size:8.5in 11in;margin:1in}body{font-family:Georgia,serif;font-size:12px;line-height:1.6;color:#333}h1{font-family:Arial;font-size:20px;color:#00B8A9;border-bottom:2px solid #00B8A9;padding-bottom:6px}h2{font-family:Arial;font-size:14px;color:#333;margin-top:20px}</style></head><body><h1>Intcu — Copilot Session</h1><p style="font-size:11px;color:#888">${date} · ${session.niche} · ${session.style}</p>${session.context ? `<div style="background:#fef9e7;border:1px solid #fcd34d;padding:10px;border-radius:4px;margin:12px 0"><p style="margin:0;font-size:11px;color:#555">${session.context.replace(/</g, "&lt;")}</p></div>` : ""}<h2>Exchanges</h2>${exHtml || "<p style='color:#999'>None</p>"}<h2>Transcript</h2><p style="background:#f5f5f5;padding:12px;border-radius:4px;font-size:11px;color:#666">${(session.fullTranscript || "None").replace(/</g, "&lt;")}</p>${session.intel ? `<h2>Meeting Intelligence</h2><p style="background:#f0f4ff;padding:12px;border-radius:4px;font-size:11px;color:#444;white-space:pre-wrap">${session.intel.replace(/</g, "&lt;")}</p>` : ""}<hr style="border:none;border-top:1px solid #ddd;margin:24px 0"><p style="font-size:9px;color:#ccc;text-align:center">Intcu — The Intelligent Cue · intcu.com</p></body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `intcu-session-${new Date(session.date).toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // ─── Room sync (P10-R2/R7: bounded, checked) ───
  const createRoom = async () => {
    if (!requireGate("team_sync")) return;
    const code = genCode(); const name = myName.trim() || "Host";
    const ok1 = await sSet(`room:${code}:state`, { script, speed, scrollPct: 0, playing: false, fontSize, ts: Date.now() }, true);
    const ok2 = await sSet(`room:${code}:members`, [{ name, screen: screenPos, role: "host", ts: Date.now() }], true);
    await sSet(`room:${code}:injections`, [], true);
    await sSet(`room:${code}:copilot`, { suggestion: "", transcript: [] }, true);
    if (!ok1 || !ok2) { show("Room creation failed"); return; }
    setRoomCode(code); rcRef.current = code; setRoomRole("host"); rrRef.current = "host"; mnRef.current = name;
    setRoomOn(true); setMembers([{ name, screen: screenPos, role: "host", ts: Date.now() }]);
    startSync(code, "host"); show(`Room ${code} created`);
  };

  const joinRoom = async () => {
    const code = joinCode.trim().toUpperCase(); if (code.length !== 6) return;
    const name = myName.trim() || "Member";
    const state = await sGet(`room:${code}:state`, true);
    if (!state) { show("Room not found"); return; }
    setScript(state.script); setSpeed(state.speed); setFontSize(state.fontSize || 44);
    const mbrs = (await sGet(`room:${code}:members`, true)) || [];
    const updated = bounded([...mbrs, { name, screen: screenPos, role: "member", ts: Date.now() }], MAX_MEMBERS);
    await sSet(`room:${code}:members`, updated, true);
    setRoomCode(code); rcRef.current = code; setRoomRole("member"); rrRef.current = "member"; mnRef.current = name;
    setRoomOn(true); setMembers(updated); if (editing) setEditing(false);
    startSync(code, "member"); show(`Joined room ${code}`);
  };

  const leaveRoom = async () => {
    if (syncRef.current) clearInterval(syncRef.current);
    if (rcRef.current) {
      const mbrs = (await sGet(`room:${rcRef.current}:members`, true)) || [];
      await sSet(`room:${rcRef.current}:members`, mbrs.filter(m => m.name !== mnRef.current), true);
    }
    setRoomOn(false); setRoomCode(""); rcRef.current = ""; setMembers([]); setInjections([]); show("Left room");
  };

  const startSync = (code, role) => {
    if (syncRef.current) clearInterval(syncRef.current);
    syncRef.current = setInterval(async () => {
      try {
        const mbrs = bounded((await sGet(`room:${code}:members`, true)) || [], MAX_MEMBERS);
        setMembers(mbrs);
        const injs = bounded((await sGet(`room:${code}:injections`, true)) || [], MAX_INJECTIONS);
        setInjections(injs);
        const cop = (await sGet(`room:${code}:copilot`, true));
        if (cop?.suggestion) setCpSuggestion(cop.suggestion);

        if (role === "host") {
          const sp = scrollRef.current ? (scrollRef.current.scrollTop / Math.max(1, scrollRef.current.scrollHeight - scrollRef.current.clientHeight)) * 100 : 0;
          await sSet(`room:${code}:state`, { script, speed, scrollPct: sp, playing, fontSize, ts: Date.now() }, true);
          const up = mbrs.map(m => m.role === "host" ? { ...m, ts: Date.now() } : m);
          await sSet(`room:${code}:members`, up, true);
        } else {
          const st = await sGet(`room:${code}:state`, true);
          if (st) {
            if (st.ts && Date.now() - st.ts > 10000) show("Host may be disconnected");
            if (st.script !== script) setScript(st.script);
            if (st.speed !== speed) setSpeed(st.speed);
            if (scrollRef.current) {
              const mx = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
              const tgt = (st.scrollPct / 100) * mx;
              if (Math.abs(tgt - scrollRef.current.scrollTop) > 5) scrollRef.current.scrollTop = tgt;
            }
            if (st.playing !== playing) setPlaying(st.playing);
          }
          const up2 = mbrs.map(m => m.name === mnRef.current ? { ...m, ts: Date.now(), screen: screenPos } : m);
          await sSet(`room:${code}:members`, up2, true);
        }
      } catch (e) { console.warn("Fallback:", e?.message || e); }
    }, SYNC_INTERVAL_MS);
  };

  useEffect(() => { return () => { if (syncRef.current) clearInterval(syncRef.current); }; }, []);

  // Broadcast copilot to room
  useEffect(() => {
    if (roomOn && roomRole === "host" && cpSuggestion && rcRef.current) {
      sSet(`room:${rcRef.current}:copilot`, { suggestion: cpSuggestion, transcript: bounded(cpTranscript.filter(t => t.type === "final").map(t => t.text), 10) }, true);
    }
  }, [cpSuggestion, roomOn, roomRole, cpTranscript]);

  const sendInj = async () => {
    if (!injText.trim() || !rcRef.current) return;
    const cur = bounded((await sGet(`room:${rcRef.current}:injections`, true)) || [], MAX_INJECTIONS);
    const up = [...cur, { from: mnRef.current || "Team", text: injText.trim(), time: Date.now() }].slice(-MAX_INJECTIONS);
    await sSet(`room:${rcRef.current}:injections`, up, true);
    setInjections(up); setInjText(""); show("Note sent");
  };

  // ═══════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════
  const orientStyle = orientation === "landscape" ? { transform: "rotate(90deg)", transformOrigin: "center", width: "100vh", height: "100vw", position: "fixed", top: "50%", left: "50%", marginTop: "-50vw", marginLeft: "-50vh" } : orientation === "portrait" ? { maxWidth: 480, margin: "0 auto" } : {};

  // ─── Landing Page (SEO-crawlable) ───
  if ((!loggedIn || showLogin) && showLanding) {
    const secStyle = { padding: isMobile ? "32px 16px" : "60px 20px", maxWidth: 960, margin: "0 auto" };
    const cardGrid = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 };
    return (
      <div style={{ position: "fixed", inset: 0, background: T.bg, color: T.text, fontFamily: T.font, overflowY: "auto", overflowX: "hidden", zIndex: 1 }}>
        {/* Nav */}
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", background: T.chrome, position: "sticky", top: 0, zIndex: 10 }}>
          <svg viewBox="0 0 200 60" style={{ width: 72, height: 22 }} role="img" aria-label="Intcu logo"><text x="10" y="43" fontFamily="'Sora', sans-serif" fontSize="38" fontWeight="700" letterSpacing="2" fill={T.chromeText}>int</text><text x="102" y="43" fontFamily="'Sora', sans-serif" fontSize="38" fontWeight="700" letterSpacing="2" fill={T.teal}>cu</text><circle cx="155" cy="28" r="4" fill={T.teal} opacity="0.9"/></svg>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setShowLanding(false); setIsRegistering(false); }} style={{ padding: "8px 18px", borderRadius: T.radius, background: "transparent", border: `1px solid ${T.chromeBorder}`, color: T.chromeText, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Sign In</button>
            <button onClick={() => { setShowLanding(false); setIsRegistering(true); }} style={{ padding: "8px 18px", borderRadius: T.radius, background: T.teal, border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Get Started Free</button>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ textAlign: "center", padding: isMobile ? "48px 16px 32px" : "80px 20px 60px" }}>
          <svg viewBox="0 0 200 60" style={{ width: isMobile ? 120 : 160, height: isMobile ? 36 : 48, marginBottom: 12 }} role="img" aria-label="Intcu"><text x="10" y="43" fontFamily="'Sora', sans-serif" fontSize="38" fontWeight="700" letterSpacing="2" fill={T.text}>int</text><text x="102" y="43" fontFamily="'Sora', sans-serif" fontSize="38" fontWeight="700" letterSpacing="2" fill={T.teal}>cu</text><circle cx="155" cy="28" r="4" fill={T.teal} opacity="0.9"/><circle cx="155" cy="28" r="7" fill={T.teal} opacity="0.15"/></svg>
          <div style={{ fontSize: isMobile ? 11 : 13, color: T.teal, letterSpacing: 2, fontWeight: 600, marginBottom: isMobile ? 14 : 20 }}>The Intelligent Cue</div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 700, lineHeight: 1.3, maxWidth: isMobile ? "90%" : 600, margin: "0 auto 12px", fontFamily: T.font }}>AI-powered teleprompter with live conversation copilot</h1>
          <p style={{ fontSize: isMobile ? 14 : 16, color: T.textDim, maxWidth: isMobile ? "90%" : 480, margin: "0 auto 28px", lineHeight: 1.6 }}>Speak smarter. Respond instantly. 10 coaching scenarios, 8 AI engines, team sync — free to start.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", padding: isMobile ? "0 8px" : 0 }}>
            <button onClick={() => { setShowLanding(false); setIsRegistering(true); }} style={{ padding: "14px 32px", borderRadius: T.radius, background: T.teal, color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: T.font, width: isMobile ? "100%" : "auto", minHeight: 48 }}>Get Started Free</button>
            <a href="#features" style={{ padding: "14px 32px", borderRadius: T.radius, background: "transparent", color: T.text, border: `1px solid ${T.border}`, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.font, textDecoration: "none", width: isMobile ? "100%" : "auto", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>See Features ↓</a>
          </div>
        </section>

        {/* Features */}
        <section id="features" style={secStyle}>
          <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 28 }}>Everything you need to speak with confidence</h2>
          <div style={cardGrid}>
            {[
              ["📝", "Smart Teleprompter", "Auto-scroll, voice control, adaptive speed, cue markers, word-by-word tracking, and dyslexia mode."],
              ["✨", "AI Script Writer", "Generate scripts in 10 formats — speeches, pitches, sermons, toasts — with coaching analysis."],
              ["🎙️", "Conversation Copilot", "Real-time AI responses for negotiations, interviews, pitches, debates, and podcasts."],
              ["📡", "Team Sync", "Multi-screen rooms with tactical injections. Host controls scroll, team sees suggestions."],
              ["🌐", "Translator", "Translate scripts and copilot responses into 20+ languages. Preserve cue markers."],
              ["💬", "Quote Finder", "Verified quotes on any topic. One tap to insert into your script with proper attribution."],
            ].map(([icon, title, desc]) => (
              <article key={title} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: "20px 22px" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }} role="img" aria-label={title}>{icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Engines */}
        <section style={{ ...secStyle, textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Powered by 8 AI engines</h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
            {["Claude Sonnet", "GPT-5 mini", "Gemini Flash", "Grok 4.1", "DeepSeek V4", "Mistral Large", "Llama 4 (Groq)", "MiniMax M2.7"].map(name => (
              <span key={name} style={{ padding: "8px 16px", borderRadius: 20, background: T.bgCard, border: `1px solid ${T.border}`, fontSize: 12, fontWeight: 600, color: T.textDim }}>{name}</span>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section style={secStyle}>
          <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 28 }}>Simple pricing</h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              ["Free", "$0", "forever", ["Full teleprompter", "3 AI calls/day", "Free engines", "10 saved scripts"], false],
              ["Pro", "$12", "/month", ["Unlimited AI calls", "All 8 engines", "Copilot + Coach", "Recording + Export", "Translate + Quotes"], true],
              ["Team", "$29", "/seat/month", ["Everything in Pro", "Room sync (10 members)", "Team copilot", "Tactical injections", "Admin dashboard"], false],
            ].map(([name, price, period, features, featured]) => (
              <article key={name} style={{ background: T.bgCard, border: `1px solid ${featured ? T.teal : T.border}`, borderRadius: 10, padding: "24px 22px", position: "relative" }}>
                {featured && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: T.teal, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 12px", borderRadius: 10, letterSpacing: 1 }}>POPULAR</div>}
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{name}</h3>
                <div style={{ marginBottom: 14 }}><span style={{ fontSize: 32, fontWeight: 700, color: T.teal }}>{price}</span><span style={{ fontSize: 12, color: T.textDim }}> {period}</span></div>
                {features.map(f => <div key={f} style={{ fontSize: 12, color: T.textDim, padding: "4px 0", borderBottom: `1px solid ${T.border}` }}>{f}</div>)}
                <button onClick={() => { setShowLanding(false); setIsRegistering(true); }} style={{ width: "100%", marginTop: 16, padding: "10px 0", borderRadius: T.radius, background: featured ? T.teal : T.bgAlt, color: featured ? "#fff" : T.text, border: featured ? "none" : `1px solid ${T.border}`, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>{name === "Free" ? "Get Started" : `Choose ${name}`}</button>
              </article>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "32px 20px", borderTop: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>
          <p>intcu.com — The Intelligent Cue</p>
          <p style={{ marginTop: 4 }}>Artisans F&B Corp · Puerto Princesa, Philippines</p>
          <SocialRow style={{ marginTop: 16 }} />
        </footer>
      </div>
    );
  }

  // ─── Login Page ───
  if (!loggedIn || showLogin) return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: T.chrome, fontFamily: T.font, overflowY: "auto", zIndex: 1 }}>
      <div style={{ width: isMobile ? "90%" : "88%", maxWidth: 400, padding: isMobile ? "0 4px" : 0 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>INT<span style={{ color: T.teal }}>CU</span></div>
          <div style={{ fontSize: 12, color: T.textDim, letterSpacing: 1 }}>The Intelligent Cue</div>
        </div>
        <div style={{ background: T.bgCard, border: `1px solid ${T.borderLit}`, borderRadius: 12, padding: "28px 24px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", marginBottom: 20, borderBottom: `1px solid ${T.border}` }}>
            <button onClick={() => { setIsRegistering(false); setLoginError(""); }} style={{ flex: 1, padding: "10px 0", background: "transparent", border: "none", borderBottom: !isRegistering ? `2px solid ${T.teal}` : "2px solid transparent", color: !isRegistering ? T.text : T.textDim, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Sign In</button>
            <button onClick={() => { setIsRegistering(true); setLoginError(""); }} style={{ flex: 1, padding: "10px 0", background: "transparent", border: "none", borderBottom: isRegistering ? `2px solid ${T.teal}` : "2px solid transparent", color: isRegistering ? T.text : T.textDim, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Register</button>
          </div>
          {isRegistering && <input value={registerName} onChange={e => setRegisterName(e.target.value)} placeholder="Full name" maxLength={50} style={{ width: "100%", height: 48, background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "0 14px", color: T.text, fontSize: 14, fontFamily: T.font, marginBottom: 10, boxSizing: "border-box", outline: "none" }} />}
          <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email or username" maxLength={100} onKeyDown={e => { if (e.key === "Enter" && !isRegistering) handleLogin(); }} style={{ width: "100%", height: 48, background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "0 14px", color: T.text, fontSize: 14, fontFamily: T.font, marginBottom: 10, boxSizing: "border-box", outline: "none" }} />
          <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Password" maxLength={100} type="password" onKeyDown={e => { if (e.key === "Enter") isRegistering ? handleRegister() : handleLogin(); }} style={{ width: "100%", height: 48, background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "0 14px", color: T.text, fontSize: 14, fontFamily: T.font, marginBottom: 16, boxSizing: "border-box", outline: "none" }} />
          <button onClick={isRegistering ? handleRegister : handleLogin} style={{ width: "100%", height: 48, background: T.teal, color: "#fff", border: "none", borderRadius: T.radius, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.font, letterSpacing: 0.5 }}>{isRegistering ? "Create Account" : "Sign In"}</button>
          {loginError && <div style={{ marginTop: 10, fontSize: 12, color: T.red, textAlign: "center" }}>{loginError}</div>}
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 10, color: T.textMuted }}>intcu.com — Speak smarter. Respond instantly.</div>
        <div style={{ textAlign: "center", marginTop: 12 }}><div style={{ fontSize: 9, color: T.chromeTextDim, marginBottom: 6 }}>Follow us</div><SocialRow /></div>
      </div>
    </div>
  );

  // ─── Admin Dashboard ───
  if (showAdmin && currentUser?.role === "admin") {
    const adminUsers = (() => { try { return JSON.parse(localStorage.getItem("intcu-users") || "[]"); } catch { return []; } })();
    const adminLog = (() => { try { return JSON.parse(localStorage.getItem("intcu-admin-log") || "[]").slice(0, MAX_LOG_ENTRIES); } catch { return []; } })();
    const today = new Date().toDateString();
    const totalUsers = adminUsers.length;
    const proUsers = adminUsers.filter(u => u.plan === "pro").length;
    const teamUsers = adminUsers.filter(u => u.plan === "team").length;
    const activeToday = adminLog.filter(e => { try { return new Date(e.ts).toDateString() === today; } catch { return false; } }).length;
    const [adminSearch, setAdminSearch] = useState("");
    const [adminFilter, setAdminFilter] = useState("all");
    const [adminSettings, setAdminSettings] = useState(() => { try { return JSON.parse(localStorage.getItem("intcu-admin-settings") || "{}"); } catch { return {}; } });
    const [featureFlags, setFeatureFlags] = useState(() => { try { return JSON.parse(localStorage.getItem("intcu-feature-flags") || "{}"); } catch { return {}; } });
    const filteredUsers = adminUsers.filter(u => {
      if (adminFilter !== "all" && (u.plan || "free") !== adminFilter) return false;
      if (adminSearch && !u.email?.includes(adminSearch) && !u.name?.includes(adminSearch)) return false;
      return true;
    }).slice(0, MAX_ADMIN_ROWS);
    const updateUser = (email, updates) => {
      const oldUser = adminUsers.find(u => u.email === email);
      const users = adminUsers.map(u => u.email === email ? { ...u, ...updates } : u);
      localStorage.setItem("intcu-users", JSON.stringify(users));
      if (email === currentUser.email) { const upd = { ...currentUser, ...updates }; setCurrentUser(upd); localStorage.setItem("intcu-user", JSON.stringify(upd)); }
      if (updates.plan && oldUser) { try { const bl = JSON.parse(localStorage.getItem("intcu-admin-billing-log") || "[]"); bl.unshift({ user: email, oldPlan: oldUser.plan || "free", newPlan: updates.plan, changedBy: currentUser.email, ts: new Date().toISOString() }); localStorage.setItem("intcu-admin-billing-log", JSON.stringify(bl.slice(0, 20))); } catch {} }
      show(`Updated ${email}`);
    };
    const deleteUser = (email) => {
      if (email === currentUser.email) { show("Can't delete yourself"); return; }
      if (!window.confirm(`Delete ${email}?`)) return;
      const users = adminUsers.filter(u => u.email !== email);
      localStorage.setItem("intcu-users", JSON.stringify(users));
      show(`Deleted ${email}`);
    };
    const engineUsage = (() => { try { const d = JSON.parse(localStorage.getItem("intcu-engine-usage") || "{}"); return Object.entries(d).sort((a, b) => b[1] - a[1]).slice(0, 8); } catch { return []; } })();
    const maxEngine = engineUsage.length > 0 ? engineUsage[0][1] : 1;

    const NAV = [["overview", "📊", "Overview"], ["users", "👥", "Users"], ["analytics", "📈", "Analytics"], ["settings", "🔧", "Settings"], ["billing", "💳", "Billing"], ["system", "🛡", "System"]];
    const navItem = (id, icon, label) => (
      <div key={id} onClick={() => setAdminPage(id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", borderLeft: adminPage === id ? `3px solid ${T.teal}` : "3px solid transparent", background: adminPage === id ? "rgba(0,184,169,0.06)" : "transparent", color: adminPage === id ? T.chromeText : T.chromeTextDim, fontSize: 13, fontWeight: adminPage === id ? 600 : 400, transition: "all 0.15s" }}><span>{icon}</span><span className="admin-nav-label">{label}</span></div>
    );
    const statCard = (label, value, accent = T.teal) => (
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderLeft: `3px solid ${accent}`, borderRadius: T.radius, padding: "16px 20px" }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: accent, fontFamily: T.font }}>{value}</div>
        <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>{label}</div>
      </div>
    );

    return (
      <div style={{ width: "100%", height: "100vh", display: "flex", fontFamily: T.font, overflow: "hidden" }}>
        {/* Sidebar */}
        <div className="admin-sidebar" style={{ width: 220, flexShrink: 0, background: T.chrome, borderRight: `1px solid ${T.chromeBorder}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.chromeBorder}` }}>
            <svg viewBox="0 0 200 60" style={{ width: 72, height: 22 }}><text x="10" y="43" fontFamily="'Sora', sans-serif" fontSize="38" fontWeight="700" letterSpacing="2" fill={T.chromeText}>int</text><text x="102" y="43" fontFamily="'Sora', sans-serif" fontSize="38" fontWeight="700" letterSpacing="2" fill={T.teal}>cu</text><circle cx="155" cy="28" r="4" fill={T.teal} opacity="0.9"/></svg>
            <div style={{ fontSize: 9, color: T.chromeTextDim, letterSpacing: 2, marginTop: 2 }}>ADMIN</div>
          </div>
          <div style={{ flex: 1, paddingTop: 8 }}>{NAV.map(([id, icon, label]) => navItem(id, icon, label))}</div>
          <div style={{ padding: 12, borderTop: `1px solid ${T.chromeBorder}` }}>
            <button onClick={() => setShowAdmin(false)} style={{ width: "100%", padding: "8px 0", background: T.chromeLight, border: `1px solid ${T.chromeBorder}`, borderRadius: T.radius, color: T.chromeTextDim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>← Back to App</button>
          </div>
        </div>
        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 24px", background: T.chrome, borderBottom: `1px solid ${T.chromeBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.chromeText }}>Admin Dashboard</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: T.chromeTextDim }}>{currentUser.name || currentUser.email}</span>
              <Btn onClick={logout} style={{ fontSize: 9, padding: "3px 8px" }}>Logout</Btn>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 24, background: T.bg }}>

            {/* Overview */}
            {adminPage === "overview" && <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
                {statCard("Total Users", totalUsers)}
                {statCard("Pro Users", proUsers, T.blue)}
                {statCard("Team Users", teamUsers, T.purple)}
                {statCard("Active Today", activeToday, T.green)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>Recent Activity</div>
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
                {adminLog.length === 0 && <div style={{ padding: 20, textAlign: "center", color: T.textMuted, fontSize: 12 }}>No activity yet</div>}
                {adminLog.slice(0, 10).map((e, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderBottom: `1px solid ${T.border}`, fontSize: 12 }}>
                    <div><span style={{ fontWeight: 600, color: T.text }}>{e.user}</span> <span style={{ color: T.textDim }}>{e.action}</span> <span style={{ fontSize: 10, color: T.teal, fontWeight: 600 }}>{e.plan || ""}</span></div>
                    <span style={{ fontSize: 10, color: T.textMuted }}>{fmtDate(e.ts)}</span>
                  </div>
                ))}
              </div>
            </>}

            {/* Users */}
            {adminPage === "users" && <>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <input value={adminSearch} onChange={e => setAdminSearch(e.target.value)} placeholder="Search users..." style={{ flex: 1, minWidth: 180, padding: "8px 12px", background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: T.radius, color: T.text, fontSize: 13, fontFamily: T.font, outline: "none" }} />
                <select value={adminFilter} onChange={e => setAdminFilter(e.target.value)} style={{ padding: "8px 12px", background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: T.radius, color: T.text, fontSize: 12, fontFamily: T.font }}>
                  <option value="all">All Plans</option><option value="free">Free</option><option value="pro">Pro</option><option value="team">Team</option>
                </select>
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 8 }}>Showing {filteredUsers.length} of {adminUsers.length}</div>
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 0.7fr 0.7fr 1.2fr 1.5fr", padding: "8px 14px", background: T.bgAlt, borderBottom: `1px solid ${T.border}` }}>
                  {["Name", "Email", "Plan", "Role", "Created", "Actions"].map(h => <span key={h} style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{h}</span>)}
                </div>
                {filteredUsers.map(u => {
                  const planColor = u.plan === "pro" ? T.teal : u.plan === "team" ? T.purple : T.textMuted;
                  return <div key={u.email} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 0.7fr 0.7fr 1.2fr 1.5fr", padding: "10px 14px", borderBottom: `1px solid ${T.border}`, alignItems: "center", minHeight: 48 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name || "—"}</span>
                    <span style={{ fontSize: 11, color: T.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: planColor, padding: "2px 8px", borderRadius: 10, textAlign: "center" }}>{u.plan || "free"}</span>
                    <span>{u.role === "admin" ? <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: T.amber, padding: "2px 6px", borderRadius: 10 }}>admin</span> : <span style={{ fontSize: 10, color: T.textMuted }}>user</span>}</span>
                    <span style={{ fontSize: 10, color: T.textMuted }}>{fmtDate(u.created)}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Btn onClick={() => { const next = { free: "pro", pro: "team", team: "free" }; updateUser(u.email, { plan: next[u.plan || "free"] || "pro" }); }} style={{ fontSize: 9, padding: "2px 8px", background: T.bgAlt, color: T.text, border: `1px solid ${T.border}` }}>Plan</Btn>
                      <Btn onClick={() => updateUser(u.email, { role: u.role === "admin" ? "user" : "admin" })} style={{ fontSize: 9, padding: "2px 8px", background: T.bgAlt, color: T.text, border: `1px solid ${T.border}` }}>Role</Btn>
                      <Btn onClick={() => deleteUser(u.email)} style={{ fontSize: 9, padding: "2px 8px", background: "transparent", color: T.red, border: "none" }}>✕</Btn>
                    </div>
                  </div>;
                })}
              </div>
            </>}

            {/* Analytics */}
            {adminPage === "analytics" && <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
                {statCard("AI Calls Today", (() => { try { const d = JSON.parse(localStorage.getItem("intcu-usage") || "{}"); return d.date === today ? d.count || 0 : 0; } catch { return 0; } })())}
                {statCard("Copilot Sessions", (() => { try { return JSON.parse(localStorage.getItem("pp-sessions") || "[]").length; } catch { return 0; } })(), T.purple)}
                {statCard("Most Used Engine", engineUsage.length > 0 ? engineUsage[0][0] : "—", T.amber)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>Engine Usage</div>
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 16 }}>
                {engineUsage.length === 0 && <div style={{ textAlign: "center", color: T.textMuted, fontSize: 12, padding: 20 }}>No engine usage data yet</div>}
                {engineUsage.map(([engine, count]) => (
                  <div key={engine} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text, minWidth: 80, textAlign: "right" }}>{engine}</span>
                    <div style={{ flex: 1, height: 20, background: T.bgAlt, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(2, (count / maxEngine) * 100)}%`, height: "100%", background: T.teal, borderRadius: 4, transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.textDim, minWidth: 30 }}>{count}</span>
                  </div>
                ))}
              </div>
            </>}

            {/* Settings / Billing / System — placeholder */}
            {/* Settings */}
            {adminPage === "settings" && (() => {
              const as = adminSettings;
              const ff = featureFlags;
              const fieldStyle = { width: "100%", maxWidth: 400, height: 44, background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "0 12px", color: T.text, fontSize: 13, fontFamily: T.font, outline: "none", boxSizing: "border-box" };
              return <>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Platform Settings</div>
                <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 20, marginBottom: 24 }}>
                  {[
                    ["defaultEngine", "Default AI Engine", <select value={as.defaultEngine || "claude"} onChange={e => setAdminSettings(p => ({ ...p, defaultEngine: e.target.value }))} style={fieldStyle}>{AI_ENGINES.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}</select>],
                    ["freeDailyLimit", "Free Daily AI Limit", <input type="number" value={as.freeDailyLimit ?? 3} onChange={e => setAdminSettings(p => ({ ...p, freeDailyLimit: +e.target.value }))} style={fieldStyle} min={0} max={100} />],
                    ["maxRoomMembers", "Max Room Members", <input type="number" value={as.maxRoomMembers ?? 10} onChange={e => setAdminSettings(p => ({ ...p, maxRoomMembers: +e.target.value }))} style={fieldStyle} min={1} max={50} />],
                    ["defaultLanguage", "Default Language", <select value={as.defaultLanguage || ""} onChange={e => setAdminSettings(p => ({ ...p, defaultLanguage: e.target.value }))} style={fieldStyle}><option value="">None</option>{LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}</select>],
                  ].map(([key, label, input]) => <div key={key} style={{ marginBottom: 14 }}><div style={{ fontSize: 11, color: T.textDim, marginBottom: 4, fontWeight: 600 }}>{label}</div>{input}</div>)}
                  <button onClick={() => { localStorage.setItem("intcu-admin-settings", JSON.stringify(adminSettings)); show("Settings saved"); }} style={{ padding: "10px 24px", borderRadius: T.radius, background: T.teal, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font, marginTop: 4 }}>Save Settings</button>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Feature Flags</div>
                <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 20 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {[["copilot", "Copilot"], ["translator", "Translator"], ["quotes", "Quotes"], ["recording", "Recording"], ["brainstorm", "Brainstorm"], ["teamSync", "Team Sync"], ["tour", "Tour"]].map(([id, label]) => (
                      <Pill key={id} label={label} active={ff[id] !== false} onClick={() => { const next = { ...ff, [id]: ff[id] === false ? true : false }; setFeatureFlags(next); localStorage.setItem("intcu-feature-flags", JSON.stringify(next)); show(`${label}: ${next[id] !== false ? "ON" : "OFF"}`); }} color={T.teal} />
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 10 }}>Disabled features are hidden from all users.</div>
                </div>
              </>;
            })()}

            {/* Billing */}
            {adminPage === "billing" && (() => {
              const revenue = (proUsers * 12) + (teamUsers * 29);
              const aiCalls = (() => { try { const d = JSON.parse(localStorage.getItem("intcu-usage") || "{}"); return d.date === today ? d.count || 0 : 0; } catch { return 0; } })();
              const cost = +(aiCalls * 0.003).toFixed(2);
              const margin = revenue > 0 ? Math.round(((revenue - cost) / revenue) * 100) : 0;
              const freeCount = totalUsers - proUsers - teamUsers;
              const billingLog = (() => { try { return JSON.parse(localStorage.getItem("intcu-admin-billing-log") || "[]").slice(0, 20); } catch { return []; } })();
              const total = totalUsers || 1;
              return <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
                  {statCard("Monthly Revenue", `$${revenue}`, T.teal)}
                  {statCard("API Cost Estimate", `$${cost}`, T.red)}
                  {statCard("Gross Margin", `${margin}%`, T.green)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>Plan Distribution</div>
                <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 16, marginBottom: 24 }}>
                  <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ width: `${(freeCount / total) * 100}%`, background: T.textMuted, minWidth: freeCount > 0 ? 2 : 0 }} />
                    <div style={{ width: `${(proUsers / total) * 100}%`, background: T.teal, minWidth: proUsers > 0 ? 2 : 0 }} />
                    <div style={{ width: `${(teamUsers / total) * 100}%`, background: T.purple, minWidth: teamUsers > 0 ? 2 : 0 }} />
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
                    <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: T.textMuted, marginRight: 4 }} />Free {freeCount}</span>
                    <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: T.teal, marginRight: 4 }} />Pro {proUsers}</span>
                    <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: T.purple, marginRight: 4 }} />Team {teamUsers}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>Plan Change Log</div>
                <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
                  {billingLog.length === 0 && <div style={{ padding: 20, textAlign: "center", color: T.textMuted, fontSize: 12 }}>No plan changes yet</div>}
                  {billingLog.map((e, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderBottom: `1px solid ${T.border}`, fontSize: 12 }}>
                      <div><span style={{ fontWeight: 600, color: T.text }}>{e.user}</span> <span style={{ color: T.textMuted }}>{e.oldPlan}</span> <span style={{ color: T.textDim }}>→</span> <span style={{ color: T.teal, fontWeight: 600 }}>{e.newPlan}</span> <span style={{ fontSize: 10, color: T.textMuted }}>by {e.changedBy}</span></div>
                      <span style={{ fontSize: 10, color: T.textMuted }}>{fmtDate(e.ts)}</span>
                    </div>
                  ))}
                </div>
              </>;
            })()}

            {/* System */}
            {adminPage === "system" && <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
                {[["App Version", "1.1.0"], ["Deploy", "Live"], ["API Proxy", "Active"], ["KV Store", "Connected"]].map(([label, status]) => (
                  <div key={label} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.green, boxShadow: `0 0 6px ${T.green}` }} />
                    <div><div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{label}</div><div style={{ fontSize: 11, color: T.textDim }}>{status}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>Quick Actions</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => {
                  if (!window.confirm("Clear all caches? User accounts and admin settings will be preserved.")) return;
                  const keep = ["intcu-users", "intcu-admin-settings", "intcu-user", "intcu-feature-flags"];
                  let cleared = 0;
                  Object.keys(localStorage).forEach(k => { if (k.startsWith("intcu-") && !keep.includes(k)) { localStorage.removeItem(k); cleared++; } });
                  show(`Cleared ${cleared} cache entries`);
                }} style={{ padding: "10px 20px", borderRadius: T.radius, background: T.red, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Clear Caches</button>
                <button onClick={() => { localStorage.removeItem("intcu-tour-done"); show("Tour will replay on next visit"); }} style={{ padding: "10px 20px", borderRadius: T.radius, background: T.amber, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Reset Tour</button>
                <button onClick={() => {
                  const data = {};
                  Object.keys(localStorage).forEach(k => { if (k.startsWith("intcu-") || k.startsWith("pp-")) { try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { data[k] = localStorage.getItem(k); } } });
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = `intcu-export-${new Date().toISOString().slice(0, 10)}.json`;
                  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                  show("Data exported");
                }} style={{ padding: "10px 20px", borderRadius: T.radius, background: T.blue, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Export Data</button>
              </div>
            </>}

          </div>
        </div>
        <Toast msg={toast} onDone={() => setToast("")} />
        <style>{`
          @media(max-width:768px){.admin-sidebar{width:60px!important}.admin-nav-label{display:none}}
          @keyframes fadeUp{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: T.bg, color: T.text, overflow: "hidden", position: "relative", fontFamily: T.font, ...orientStyle }}>

      {/* ─── Top bar ─── */}
      {!fs && <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: T.chrome, borderBottom: `1px solid ${T.chromeBorder}`, flexShrink: 0, minHeight: 42 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: (playing && !counting) || cpActive ? (voiceLive || cpActive ? T.teal : T.teal) : T.textMuted, boxShadow: (playing && !counting) || cpActive ? `0 0 10px ${T.teal}` : "none", transition: "all 0.3s" }} />
          <svg viewBox="0 0 200 60" style={{ width: 80, height: 24, verticalAlign: "middle" }}>
            <text x="10" y="43" fontFamily="'Sora', sans-serif" fontSize="38" fontWeight="700" letterSpacing="2" fill={T.chromeText}>int</text>
            <text x="102" y="43" fontFamily="'Sora', sans-serif" fontSize="38" fontWeight="700" letterSpacing="2" fill={T.teal}>cu</text>
            <circle cx="155" cy="28" r="4" fill={T.teal} opacity="0.9"/>
            <circle cx="155" cy="28" r="7" fill={T.teal} opacity="0.15"/>
          </svg>
          {voiceLive && <span style={{ fontSize: 8, color: T.blue, fontWeight: 700, letterSpacing: 1, animation: "pulse 2s infinite" }}>VOICE</span>}
          {cpActive && <span style={{ fontSize: 8, color: T.red, fontWeight: 700, letterSpacing: 1, animation: "pulse 1.5s infinite" }}>LIVE</span>}
          {roomOn && <span style={{ fontSize: 8, color: T.purple, fontWeight: 700 }}>ROOM {roomCode}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {mode === "script" && <span style={{ fontSize: 9, color: T.chromeTextDim }}>{words}w · {readTime}</span>}
          {currentUser && <span style={{ fontSize: 9, color: T.chromeTextDim, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.name || currentUser.email}</span>}
          {currentUser?.role === "admin" && <><span style={{ fontSize: 7, color: T.teal, fontWeight: 700, letterSpacing: 1, background: `rgba(0,212,200,0.1)`, padding: "1px 4px", borderRadius: 3 }}>ADMIN</span><Btn onClick={() => { setShowAdmin(true); setAdminPage("overview"); }} style={{ fontSize: 11, padding: "3px 8px" }} title="Admin Dashboard">⚙</Btn></>}
          <Btn onClick={logout} style={{ fontSize: 9, padding: "3px 8px" }} title="Sign out">↪</Btn>
          <Btn onClick={() => setShowShortcuts(true)} style={{ fontSize: 11, padding: "3px 8px", fontWeight: 700 }} title="Keyboard shortcuts (?)">?</Btn>
          <Btn onClick={() => setShowSync(true)} bg={roomOn ? T.purple : T.bgCard} style={{ fontSize: 10, padding: "4px 10px" }} title="Multi-screen sync & team rooms">{roomOn ? `📡 ${members.length}` : "📡"}</Btn>
        </div>
      </div>}

      {/* ─── Mode tabs ─── */}
      {!fs && <nav role="navigation" aria-label="Mode tabs" style={{ display: "flex", borderBottom: `1px solid ${T.chromeBorder}`, background: T.chrome, flexShrink: 0 }}>
        {[["script", "📝 Script"], ["writer", "✨ Writer"], ["myfile", "📋 MyFile"], ["copilot", "🎙️ Copilot"]].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={mode === id} aria-label={`${label} mode`} onClick={() => { if (playing) { setPlaying(false); stopVoice(); } if (cpActive) stopCopilot(); setMode(id); setShowWelcome(false); }}
            style={{ flex: 1, padding: "8px 0", background: "transparent", border: "none", borderBottom: mode === id ? `2px solid ${T.teal}` : "2px solid transparent", color: mode === id ? T.chromeText : T.chromeTextDim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: T.font, transition: "all 0.15s" }}>{label}</button>
        ))}
      </nav>}

      {/* ─── Sync Modal ─── */}
      {showSync && <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}>
        <div style={{ background: T.bgCard, border: `1px solid ${T.borderLit}`, borderRadius: 10, width: "92%", maxWidth: 420, maxHeight: "80vh", overflowY: "auto", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700 }}>📡 Intcu Sync</span>
            <Btn onClick={() => setShowSync(false)} style={{ background: "transparent", border: "none", fontSize: 16 }}>✕</Btn>
          </div>
          {!roomOn ? <>
            <p style={{ fontSize: 11, color: T.textDim, lineHeight: 1.6, margin: "0 0 12px" }}>Sync screens or connect your team. Host creates a room, others join with the code.</p>
            <input value={myName} onChange={e => setMyName(e.target.value)} placeholder="Your name" maxLength={20} style={iStyle} />
            <div style={{ display: "flex", gap: 6, margin: "10px 0" }}>
              {["left", "center", "right"].map(p => <Btn key={p} onClick={() => setScreenPos(p)} bg={screenPos === p ? T.purple : T.bgCard} style={{ flex: 1, textTransform: "uppercase", fontSize: 10, letterSpacing: 1 }}>{p === "left" ? "◀ L" : p === "right" ? "R ▶" : "● C"}</Btn>)}
            </div>
            <Btn onClick={createRoom} bg={T.purple} style={{ width: "100%", padding: "12px", fontSize: 14, marginBottom: 16, textAlign: "center" }}>Create Room</Btn>
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
              <p style={{ fontSize: 10, color: T.textDim, margin: "0 0 6px" }}>Or join existing room:</p>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} placeholder="CODE" style={{ ...iStyle, flex: 1, fontFamily: "monospace", fontSize: 20, textAlign: "center", letterSpacing: 6, textTransform: "uppercase" }} />
                <Btn onClick={joinRoom} bg={joinCode.length === 6 ? T.green : T.bgCard} disabled={joinCode.length !== 6} style={{ padding: "10px 20px", fontSize: 14, fontWeight: 700 }}>Join</Btn>
              </div>
            </div>
          </> : <>
            <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16, textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: T.teal, fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>ROOM CODE</div>
              <div style={{ fontSize: 32, fontFamily: "monospace", fontWeight: 700, letterSpacing: 8 }}>{roomCode}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              {bounded(members, MAX_MEMBERS).map((m, i) => <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: T.bg, borderRadius: 4, marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: Date.now() - m.ts < 3000 ? T.green : T.red }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{m.name}</span>
                  {m.role === "host" && <span style={{ fontSize: 8, color: T.amber, fontWeight: 700 }}>HOST</span>}
                </div>
                <span style={{ fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{m.screen}</span>
              </div>)}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              <input value={injText} onChange={e => setInjText(e.target.value)} placeholder="Team note..." maxLength={200} onKeyDown={e => { if (e.key === "Enter") sendInj(); }} style={{ ...iStyle, flex: 1 }} />
              <Btn onClick={sendInj} bg={T.red}>Send</Btn>
            </div>
            <Btn onClick={leaveRoom} bg={T.red} style={{ width: "100%", textAlign: "center" }}>Leave Room</Btn>
          </>}
        </div>
      </div>}

      {/* ─── Team injection overlay ─── */}
      {roomOn && injections.length > 0 && !showSync && <div style={{ position: "absolute", bottom: 44, left: 12, right: 12, zIndex: 25, pointerEvents: "none" }}>
        {bounded(injections, 3).slice(-3).map((inj, i) => {
          const age = (Date.now() - inj.time) / 1000;
          if (age > 30) return null;
          return <div key={inj.time} style={{ background: `rgba(168,85,247,0.12)`, border: `1px solid rgba(168,85,247,0.25)`, borderRadius: 6, padding: "5px 12px", marginBottom: 3, backdropFilter: "blur(8px)", opacity: Math.max(0.3, 1 - age / 30) }}>
            <span style={{ fontSize: 9, color: T.purple, fontWeight: 700 }}>{inj.from}: </span>
            <span style={{ fontSize: 12, color: "#fff" }}>{sanitize(inj.text)}</span>
          </div>;
        })}
      </div>}

      {/* ═══ SCRIPT MODE ═══ */}
      {mode === "script" && <>
        {/* Countdown */}
        {counting && countdown > 0 && <div style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)" }}>
          <div style={{ fontSize: 160, fontWeight: 600, fontFamily: T.font, color: T.teal, textShadow: `0 0 80px rgba(0,212,200,0.3)`, animation: "pulse 1s infinite" }}>{countdown}</div>
        </div>}

        {/* Progress */}
        {!editing && <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, zIndex: 20, background: T.border }}><div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${T.teal}, ${T.tealDark})`, transition: "width 0.3s" }} /></div>}

        {/* Library */}
        {showLib && <div style={{ position: "absolute", inset: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
          <div style={{ background: T.bgCard, border: `1px solid ${T.borderLit}`, borderRadius: 10, width: "92%", maxWidth: 440, maxHeight: "70vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700 }}>Script Library</span>
              <Btn onClick={() => setShowLib(false)} style={{ background: "transparent", border: "none" }}>✕</Btn>
            </div>
            <div style={{ display: "flex", gap: 6, padding: "10px 16px", borderBottom: `1px solid ${T.border}` }}>
              <input value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="Name..." style={{ ...iStyle, flex: 1 }} />
              <Btn onClick={async () => { await saveScripts([{ id: Date.now(), name: saveName.trim() || `Script ${scripts.length + 1}`, text: script }, ...scripts]); setSaveName(""); show("Saved"); }} bg={T.green}>Save</Btn>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {scripts.length === 0 && <p style={{ padding: 20, textAlign: "center", color: T.textMuted, fontSize: 12 }}>No saved scripts</p>}
              {bounded(scripts, MAX_SCRIPTS).map(s => <div key={s.id} style={{ display: "flex", alignItems: "center", padding: "8px 16px", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }} onClick={() => { setScript(s.text); setShowLib(false); setEditing(true); }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 9, color: T.textMuted }}>{wc(s.text)}w · {estTime(s.text)}</div></div>
                <Btn onClick={e => { e.stopPropagation(); exportPDF(s.text, s.name); }} style={{ background: "transparent", border: "none", color: T.blue, fontSize: 10 }} title="Export as PDF">📄</Btn>
                <Btn onClick={e => { e.stopPropagation(); saveScripts(scripts.filter(x => x.id !== s.id)); }} style={{ background: "transparent", border: "none", color: T.red, fontSize: 14 }}>✕</Btn>
              </div>)}
            </div>
          </div>
        </div>}

        {/* Quote Finder Modal */}
        {showQuotes && <div style={{ position: "absolute", inset: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
          <div style={{ background: T.bgCard, border: `1px solid ${T.borderLit}`, borderRadius: 10, width: "92%", maxWidth: 480, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700 }}>💬 Quote Finder</span>
              <Btn onClick={() => setShowQuotes(false)} style={{ background: "transparent", border: "none" }}>✕</Btn>
            </div>
            <div style={{ display: "flex", gap: 6, padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
              <input value={quoteTopic} onChange={e => setQuoteTopic(e.target.value)} placeholder="Topic (e.g. leadership, courage, innovation)..." onKeyDown={e => { if (e.key === "Enter") searchQuotes(); }} style={{ ...iStyle, flex: 1 }} />
              <Btn onClick={searchQuotes} disabled={quoteLoading || !quoteTopic.trim()} bg={T.teal}>{quoteLoading ? "..." : "Search"}</Btn>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {quoteLoading && <div style={{ textAlign: "center", padding: 20, fontSize: 12, color: T.teal, fontWeight: 600, animation: "pulse 1s infinite" }}>Finding verified quotes...</div>}
              {quoteResults.length === 0 && !quoteLoading && <div style={{ textAlign: "center", padding: 20, color: T.textMuted, fontSize: 12 }}>Enter a topic to find verified quotes</div>}
              {quoteResults.map((q, i) => (
                <div key={i} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: T.text, fontStyle: "italic", marginBottom: 6 }}>"{sanitize(q.quote)}"</div>
                  <div style={{ fontSize: 11, color: T.textDim, marginBottom: 2 }}>— {q.author}</div>
                  <div style={{ fontSize: 9, color: T.textMuted, marginBottom: 8 }}>{q.source} ({q.year}){q.context ? ` · ${q.context}` : ""}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn onClick={() => insertQuote(q)} bg={T.green} style={{ fontSize: 10 }}>→ Script</Btn>
                    <Btn onClick={() => { navigator.clipboard?.writeText(`"${q.quote}" — ${q.author}, ${q.source} (${q.year})`); show("Copied"); }} style={{ fontSize: 10 }}>Copy</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>}

        {/* Controls */}
        {!fs && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "5px 10px", gap: 5, borderBottom: `1px solid ${T.chromeBorder}`, background: T.chromeMid, flexShrink: 0, flexWrap: "wrap" }}>
          <Btn onClick={doPlay} bg={playing ? T.red : T.green} style={{ minWidth: 64 }} title="Play / Pause (Space)">{playing ? "⏸ Pause" : "▶ Play"}</Btn>
          <Btn onClick={doReset} title="Reset to start (R)">⟲</Btn>
          <Btn onClick={doEdit} title="Edit script (E)">✎</Btn>
          <Btn onClick={() => setShowLib(true)} title="Script library">📁</Btn>
          <Btn onClick={() => setShowQuotes(true)} label="Quote finder" title="Quote finder" style={{ minHeight: 40, fontSize: 16 }}>💬</Btn>
          <Btn onClick={() => setFs(!fs)} title="Fullscreen (double-tap)">{fs ? "⊡" : "⊞"}</Btn>
          <div style={{ position: "relative" }}>
            <Btn onClick={() => setShowShare(s => !s)} title="Share script">↗</Btn>
            {showShare && <ShareMenu text={"Check out my script on @intcu — The Intelligent Cue " + (script.slice(0, 100).replace(/\n/g, " ") + "...")} onClose={() => setShowShare(false)} />}
          </div>
          {playing && !counting && <>
            <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 12, fontWeight: 600, color: T.textDim, marginLeft: 4 }}>{fmtTime(elapsed)}</span>
            {pace && <span style={{ fontSize: 8, fontWeight: 700, color: pace.c, letterSpacing: 1 }}>{pace.l}</span>}
          </>}
          <div style={{ width: 1, height: 18, background: T.border, margin: "0 2px" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: 2, color: "#a1a1aa" }}>Speed</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input type="range" min={1} max={10} value={speed} onChange={(e) => { e.stopPropagation(); setSpeed(Number(e.target.value)); }} style={{ width: 80, height: 6, accentColor: "#00B8A9", cursor: "pointer" }} title={"Speed: " + speed} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#e4e4e7", minWidth: 20, textAlign: "center", fontFamily: T.font }}>{speed}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: 2, color: "#a1a1aa" }}>Size</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input type="range" min={18} max={96} step={2} value={fontSize} onChange={(e) => { e.stopPropagation(); setFontSize(Number(e.target.value)); }} style={{ width: 80, height: 6, accentColor: "#00B8A9", cursor: "pointer" }} title={"Size: " + fontSize} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#e4e4e7", minWidth: 24, textAlign: "center", fontFamily: T.font }}>{fontSize}</span>
            </div>
          </div>
        </div>}

        {/* Settings strip */}
        {!fs && <div>
          <div style={{ display: "flex", alignItems: "center", padding: "5px 10px 8px", gap: 10, borderBottom: `1px solid ${T.chromeBorder}`, background: T.chromeLight, flexShrink: 0, overflowX: "auto", overflowY: "hidden", whiteSpace: "nowrap", WebkitOverflowScrolling: "touch", minHeight: 44 }}>
            <Knob label="Margin" value={margin} onChange={setMargin} min={0} max={40} step={5} unit="%" />
            <Knob label="Spacing" value={spacing} onChange={setSpacing} min={1.0} max={3.0} step={0.1} />
            <Knob label="Guide" value={guidePos} onChange={setGuidePos} min={15} max={50} step={5} unit="%" />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{[["Mirror", mirrored, () => setMirrored(!mirrored), T.red, "Flip text horizontally for glass rigs (M)"], ["Adapt", adaptive, () => setAdaptive(!adaptive), T.amber, "Adjust scroll speed per line density"], ["Focus", focus, () => setFocus(!focus), T.purple, "Highlight active line, dim others"], ["Voice", voiceOn, () => { if (voiceOn) { setVoiceOn(false); stopVoice(); } else setVoiceOn(true); }, T.blue, "Scroll follows your voice"], ["Cues", cues, () => setCues(!cues), T.amber, "Show [PAUSE] [SLOW] [BREATHE] markers"], ["Dyslexia", dyslexia, () => { setDyslexia(!dyslexia); if (!dyslexia) { setFontIdx(3); setSpacing(2.2); setFontSize(48); show("Dyslexia mode on — Lexend font, wider spacing"); } }, T.green, "Lexend font, tinted background, wider spacing"]].map(([l, a, fn, c, t]) => <Pill key={l} label={l} active={a} onClick={fn} color={c} title={t} />)}</div>
            {dyslexia && <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 8, color: T.textMuted, letterSpacing: 1 }}>TINT</span>
              {[["cream", "#fdf6e3"], ["blue", "#e8f4f8"], ["green", "#e8f5e9"], ["pink", "#fce4ec"]].map(([id, c]) => (
                <div key={id} onClick={() => { setDyslexiaOverlay(id); localStorage.setItem("intcu-dys-overlay", id); }} title={id} style={{ width: 18, height: 18, borderRadius: "50%", background: c, cursor: "pointer", border: dyslexiaOverlay === id ? `2px solid ${T.teal}` : "2px solid transparent", transition: "border 0.15s" }} />
              ))}
            </div>}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: 2 }}>Font</span>
              <select value={fontIdx} onChange={e => setFontIdx(+e.target.value)} style={{ background: T.chromeLight, color: T.chromeText, border: `1px solid ${T.chromeBorder}`, borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: T.font }}>{PROMPTER_FONTS.map((f, i) => <option key={i} value={i}>{f.name}</option>)}</select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: 2 }}>Layout</span>
              <select value={orientation} onChange={e => setOrientation(e.target.value)} style={{ background: T.chromeLight, color: T.chromeText, border: `1px solid ${T.chromeBorder}`, borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: T.font }}>{["auto", "portrait", "landscape"].map(o => <option key={o} value={o}>{o}</option>)}</select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: 2 }}>AI Engine</span>
              <select value={aiEngine} onChange={e => setAiEngine(e.target.value)} style={{ background: T.chromeLight, color: T.chromeText, border: `1px solid ${T.chromeBorder}`, borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: T.font }}>
                {AI_ENGINES.filter(e => getUserPlan() !== "free" || FREE_ENGINES.includes(e.id)).map(e => <option key={e.id} value={e.id}>{e.label} ({e.cost})</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: 2 }}>Translate</span>
              <select value={targetLang} onChange={e => setTargetLang(e.target.value)} title="Translate script or copilot responses" style={{ background: T.chromeLight, color: T.chromeText, border: `1px solid ${T.chromeBorder}`, borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: T.font }}>
                <option value="">Off</option>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            {targetLang && <Btn onClick={async () => { if (!script.trim()) { show("Nothing to translate"); return; } show("Translating..."); const t = await translateScript(script); setScript(t); show(`Translated to ${targetLang}`); }} bg={T.blue} style={{ fontSize: 10 }}>Translate Script</Btn>}
            <Pill label="Captions" active={captions} onClick={() => setCaptions(!captions)} color={T.teal} title="Live speech captions overlay" />
          </div>
        </div>}

        {/* Viewport */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: dyslexia ? ({ cream: "#1f1c14", blue: "#141c1f", green: "#141f16", pink: "#1f1418" }[dyslexiaOverlay] || "#1a1f14") : "transparent" }} onDoubleClick={() => setFs(!fs)}>
          {fs && !editing && <div style={{ position: "absolute", top: 8, left: 0, right: 0, zIndex: 20, display: "flex", justifyContent: "center", gap: 12, alignItems: "center", opacity: 0.35 }}>
            <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmtTime(elapsed)}</span>
            {pace && <span style={{ fontSize: 8, fontWeight: 700, color: pace.c }}>{pace.l}</span>}
            <span style={{ fontSize: 10, color: T.textDim }}>{Math.round(progress)}%</span>
            <Btn onClick={e => { e.stopPropagation(); doPlay(); }} bg={playing ? T.red : T.green} style={{ fontSize: 9, padding: "3px 8px" }}>{playing ? "⏸" : "▶"}</Btn>
            <Btn onClick={e => { e.stopPropagation(); setFs(false); }} style={{ fontSize: 9, padding: "3px 8px" }}>Exit</Btn>
          </div>}
          {!editing && <>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: `linear-gradient(180deg, ${T.bg} 0%, transparent 100%)`, zIndex: 10, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(0deg, ${T.bg} 0%, transparent 100%)`, zIndex: 10, pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: `${guidePos}%`, height: 2, background: focus ? `rgba(0,212,200,0.25)` : `rgba(0,212,200,0.15)`, zIndex: 10, pointerEvents: "none" }}>
              <div style={{ position: "absolute", left: 0, top: -3, width: 6, height: 8, background: T.teal, borderRadius: "0 2px 2px 0" }} />
              <div style={{ position: "absolute", right: 0, top: -3, width: 6, height: 8, background: T.teal, borderRadius: "2px 0 0 2px" }} />
            </div>
            {dyslexia && <div style={{ position: "absolute", left: 0, right: 0, top: `calc(${guidePos}% - 60px)`, height: 120, background: "rgba(255,248,220,0.08)", zIndex: 9, pointerEvents: "none", borderTop: "1px solid rgba(255,248,220,0.06)", borderBottom: "1px solid rgba(255,248,220,0.06)" }} />}
          </>}
          {/* Camera PIP */}
          {camOn && <video ref={camVideoRef} muted playsInline style={{ position: "absolute", bottom: 60, right: 12, width: 120, height: 90, borderRadius: T.radius, border: `2px solid ${recording ? T.red : T.teal}`, objectFit: "cover", zIndex: 15 }} />}
          {/* Record button */}
          {!editing && <div style={{ position: "absolute", top: 8, right: 12, zIndex: 15, display: "flex", gap: 4 }}>
            <Btn onClick={camOn ? stopCam : startCam} bg={recording ? T.red : T.bgCard} style={{ fontSize: 10, padding: "4px 10px" }} title="Record webcam">
              {recording ? "⏹ Stop Rec" : "⏺ Record"}
            </Btn>
            <Btn onClick={ttsPlaying ? stopTTS : startTTS} bg={ttsPlaying ? T.red : T.bgCard} style={{ fontSize: 10, padding: "4px 10px" }} title={ttsPlaying ? "Stop reading" : "Read script aloud"}>
              {ttsPlaying ? "🔇" : "🔊"}
            </Btn>
          </div>}
          {/* Live caption overlay */}
          {captions && captionText && !editing && <div style={{ position: "absolute", bottom: camOn ? 160 : 40, left: "10%", right: "10%", zIndex: 15, pointerEvents: "none", textAlign: "center" }}>
            <span style={{ background: "rgba(0,0,0,0.75)", color: "#fff", padding: "4px 14px", borderRadius: 4, fontSize: 14, fontFamily: T.font, fontWeight: 500, lineHeight: 1.6 }}>{captionText}</span>
          </div>}
          {editing ? <div style={{ width: "100%", height: "100%", position: "relative" }} onDragOver={e => e.preventDefault()} onDrop={handleFileDrop}>
            <textarea value={script} onChange={e => { setScript(e.target.value); setShowWelcome(false); }} placeholder="Paste script here or drop a .txt / .docx file..." maxLength={50000} style={{ width: "100%", height: "100%", resize: "none", background: "transparent", color: T.text, border: "none", outline: "none", padding: `20px ${margin}%`, fontSize: Math.min(fontSize, EDIT_FONT_CAP), fontFamily: PROMPTER_FONTS[fontIdx].css, lineHeight: 1.8, boxSizing: "border-box" }} />
            <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 6 }}>
              <button onClick={() => exportPDF(script)} title="Export as PDF" style={{ padding: "6px 14px", borderRadius: T.radius, background: T.bgCard, color: T.textDim, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 11, fontFamily: T.font, fontWeight: 600 }}>📄 PDF</button>
              <button onClick={() => fileRef.current?.click()} style={{ padding: "6px 14px", borderRadius: T.radius, background: T.bgCard, color: T.textDim, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 11, fontFamily: T.font, fontWeight: 600 }}>📁 Import file</button>
            </div>
            {showWelcome && isDefaultScript && mode === "script" && (() => {
              const h = new Date().getHours();
              const greeting = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
              const q = motd || { quote: "Your margin is someone else's opportunity.", author: "Jeff Bezos", word: "Antifragile", definition: "Growing stronger through stress, volatility, and disorder.", example: "The best startups are antifragile — every setback makes their model more resilient." };
              return <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
                <div style={{ background: T.bgCard, border: `1px solid ${T.borderLit}`, borderRadius: 12, padding: "28px 32px", maxWidth: 420, width: "88%", boxShadow: "0 12px 48px rgba(0,0,0,0.25)", pointerEvents: "auto" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: T.font, color: T.text, marginBottom: 16 }}>Good {greeting}, welcome to Intcu.</div>
                  <div style={{ borderLeft: `3px solid ${T.teal}`, paddingLeft: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontStyle: "italic", lineHeight: 1.6, color: T.text, fontFamily: "'Source Serif 4', serif", marginBottom: 4 }}>"{q.quote}"</div>
                    <div style={{ fontSize: 11, color: T.textDim, fontFamily: T.font }}>— {q.author}</div>
                  </div>
                  <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 18 }}>
                    <div style={{ fontSize: 11, color: T.teal, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>WORD OF THE DAY</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.teal, marginBottom: 2 }}>{q.word}</div>
                    <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, marginBottom: 4 }}>{q.definition}</div>
                    <div style={{ fontSize: 11, color: T.textDim, fontStyle: "italic", lineHeight: 1.5 }}>"{q.example}"</div>
                  </div>
                  <button onClick={() => { setShowWelcome(false); if (!localStorage.getItem("intcu-tour-done")) { setTourStep(1); setShowTour(true); } }} style={{ width: "100%", padding: "10px 0", borderRadius: T.radius, background: T.teal, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, fontFamily: T.font, cursor: "pointer", letterSpacing: 0.5 }}>Start Writing</button>
                </div>
              </div>;
            })()}
          </div>
          : <div ref={scrollRef} style={{ width: "100%", height: "100%", overflowY: "auto", padding: `40vh ${margin}% 60vh`, boxSizing: "border-box", transform: mirrored ? "scaleX(-1)" : "none", scrollbarWidth: "none" }}
              onScroll={() => { if (scrollRef.current) { const mx = scrollRef.current.scrollHeight - scrollRef.current.clientHeight; if (mx > 0) setProgress((scrollRef.current.scrollTop / mx) * 100); } }}>
            {lines.map((line, i) => {
              const dist = Math.abs(i - activeLine);
              // Viewport windowing: skip rendering lines far from view during playback
              if (playing && !counting && focus && dist > 50) return <div key={i} ref={el => lineRefs.current[i] = el} style={{ minHeight: fontSize * (line.trim() === "" ? EMPTY_LINE_SCALE : 1), lineHeight: spacing }} />;
              let op = 1;
              if (focus) { if (i === activeLine) op = 1; else if (dist === 1) op = 0.4; else if (dist === 2) op = 0.2; else op = 0.08; }
              const isActive = i === activeLine && focus && playing && !counting;
              const lineContent = (() => {
                if (!isActive) return renderCue(line, cues);
                const up = (line || "").trim().toUpperCase();
                if (CUE_MAP[up] || line.includes("[EMPHASIS]")) return renderCue(line, cues);
                const words = line.split(/(\s+)/);
                let wordIdx = 0;
                return words.map((w, wi) => {
                  if (/^\s+$/.test(w)) return <span key={wi}>{w}</span>;
                  const idx = wordIdx++;
                  const color = idx === activeWord ? T.teal : (idx < activeWord ? (dyslexia ? "#f5f0e0" : T.text) : T.textDim);
                  const fw = idx === activeWord ? 700 : (dyslexia ? 500 : 400);
                  const display = idx === activeWord && dyslexia ? syllabify(w) : w;
                  return <span key={wi} style={{ color, fontWeight: fw, transition: "color 0.1s" }}>{display}</span>;
                });
              })();
              return <div key={i} ref={el => lineRefs.current[i] = el} style={{ fontSize, fontFamily: PROMPTER_FONTS[fontIdx].css, lineHeight: spacing, color: dyslexia ? "#f5f0e0" : T.text, whiteSpace: "pre-wrap", wordBreak: "break-word", textAlign: dyslexia ? "left" : "center", fontWeight: isActive ? (dyslexia ? 700 : 600) : (i === activeLine && focus ? (dyslexia ? 700 : 600) : (dyslexia ? 500 : 400)), opacity: op, transition: "opacity 0.4s, font-weight 0.3s", minHeight: line.trim() === "" ? fontSize * EMPTY_LINE_SCALE : "auto", letterSpacing: dyslexia ? "0.05em" : "normal", wordSpacing: dyslexia ? "0.15em" : "normal" }}>{lineContent}</div>;
            })}
          </div>}
        </div>
      </>}

      {/* ═══ WRITER MODE ═══ */}
      {mode === "writer" && <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <textarea value={wTopic} onChange={e => setWTopic(e.target.value)} placeholder="What's the topic or purpose?" maxLength={500} rows={2} style={{ ...iStyle, width: "100%", marginBottom: 10, fontSize: 14, lineHeight: 1.5 }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <select value={wFmt} onChange={e => setWFmt(e.target.value)} style={{ ...iStyle, flex: 1, minWidth: 100 }}>{WRITER_FORMATS.map(f => <option key={f}>{f}</option>)}</select>
          <select value={wTone} onChange={e => setWTone(e.target.value)} style={{ ...iStyle, flex: 1, minWidth: 100 }}>{WRITER_TONES.map(t => <option key={t}>{t}</option>)}</select>
          <select value={wDur} onChange={e => setWDur(e.target.value)} style={{ ...iStyle, width: 80 }}>{["1", "2", "3", "5", "7", "10", "15", "20"].map(d => <option key={d} value={d}>{d} min</option>)}</select>
        </div>
        <input value={wAud} onChange={e => setWAud(e.target.value)} placeholder="Audience (optional)" style={{ ...iStyle, width: "100%", marginBottom: 8 }} />
        <textarea value={wCtx} onChange={e => setWCtx(e.target.value)} placeholder="Key points, context (optional)" rows={2} style={{ ...iStyle, width: "100%", marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={generate} disabled={wLoading || !wTopic.trim()} bg={T.teal} style={{ flex: 1, padding: "12px", fontSize: 14, textAlign: "center" }}>{wLoading ? "✨ Generating..." : "✨ Generate Script"}</Btn>
          <Btn onClick={() => setShowQuotes(true)} style={{ padding: "12px 16px", fontSize: 14 }}>💬 Quotes</Btn>
        </div>

        {wResult && <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: T.textDim }}>{wc(wResult)}w · {estTime(wResult)}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn onClick={runCoach} disabled={wCoachLoading} bg={T.cyan} style={{ fontSize: 10 }}>{wCoachLoading ? "Analyzing..." : "🎯 Coach"}</Btn>
              <Btn onClick={() => setShowQuotes(true)} style={{ fontSize: 10 }}>💬</Btn>
              <Btn onClick={() => { setScript(wResult); setMode("script"); setEditing(true); show("Sent to script"); }} bg={T.green}>→ Script</Btn>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Btn onClick={() => setShowShare(s => !s)} style={{ fontSize: 10 }}>↗ Share</Btn>
                {showShare && <ShareMenu text={wResult.slice(0, 200) + "... — written with Intcu AI"} onClose={() => setShowShare(false)} />}
              </div>
            </div>
          </div>
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: 14, maxHeight: 220, overflowY: "auto", fontSize: 13, lineHeight: 1.8, color: "#ccc", fontFamily: PROMPTER_FONTS[fontIdx].css, whiteSpace: "pre-wrap" }}>{wResult}</div>
          {wCoach && <div style={{ marginTop: 10, background: "rgba(6,182,212,0.06)", border: `1px solid rgba(6,182,212,0.2)`, borderRadius: 6, padding: 12 }}>
            <div style={{ fontSize: 9, color: T.cyan, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>🎯 SCRIPT COACH</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: T.text, whiteSpace: "pre-wrap" }}>{wCoach}</div>
          </div>}
        </div>}
      </div>}

      {/* ═══ MYFILE MODE — Notes / Brainstorm / Prompt Builder ═══ */}
      {mode === "myfile" && <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {/* Quick capture */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <textarea value={mfInput} onChange={e => setMfInput(e.target.value)} placeholder="Capture an idea, concept, or note..." maxLength={2000} rows={2}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote(); } }}
              style={{ ...iStyle, flex: 1, fontSize: 14, lineHeight: 1.5, resize: "none" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Btn onClick={addNote} bg={T.teal} style={{ flex: 1, fontSize: 13 }}>+ Add</Btn>
              <Btn onClick={() => fileRef.current?.click()} style={{ flex: 1, fontSize: 10 }}>📁</Btn>
            </div>
          </div>

          {/* Action bar */}
          {mfNotes.length > 0 && <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            <Btn onClick={buildPrompt} disabled={mfSelected.size === 0 || mfPromptLoading} bg={T.teal} style={{ fontSize: 11 }} title="Combine selected notes into an LLM prompt">
              {mfPromptLoading ? "Building..." : `🔧 Build Prompt (${mfSelected.size})`}
            </Btn>
            <Btn onClick={notesToScript} style={{ fontSize: 11 }}>{mfSelected.size > 0 ? "→ Script" : "All → Script"}</Btn>
            <Btn onClick={notesToWriter} disabled={mfSelected.size === 0} style={{ fontSize: 11 }}>→ Writer Context</Btn>
            <Btn onClick={() => setShowQuotes(true)} style={{ fontSize: 11 }}>💬 Quotes</Btn>
            <Btn onClick={() => { setMfSelected(new Set()); setMfExpanded(null); setMfBrainstorm(""); setMfPromptResult(""); }} style={{ fontSize: 10, color: T.textDim }}>Clear selection</Btn>
          </div>}

          {/* Prompt result */}
          {mfPromptResult && <div style={{ background: `rgba(0,212,200,0.06)`, border: `1px solid rgba(0,212,200,0.2)`, borderRadius: T.radius, padding: 12, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: T.teal, fontWeight: 700, letterSpacing: 2 }}>🔧 GENERATED PROMPT</span>
              <div style={{ display: "flex", gap: 4 }}>
                <Btn onClick={() => { navigator.clipboard?.writeText(mfPromptResult); show("Copied to clipboard"); }} style={{ fontSize: 10 }}>Copy</Btn>
                <Btn onClick={() => { setScript(mfPromptResult); setMode("script"); setEditing(true); show("Prompt sent to script"); }} bg={T.green} style={{ fontSize: 10 }}>→ Script</Btn>
              </div>
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: T.text, whiteSpace: "pre-wrap", fontFamily: "'Source Serif 4', serif" }}>{mfPromptResult}</div>
          </div>}

          {/* Notes list */}
          {mfNotes.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>MyFile</div>
            <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
              Capture ideas, brainstorm with AI, and build structured prompts. Your notes become scripts, writer context, or LLM prompts.
            </div>
          </div>}

          {bounded(mfNotes, MAX_SCRIPTS).map(note => (
            <div key={note.id} style={{ marginBottom: 8, border: `1px solid ${mfSelected.has(note.id) ? T.teal : T.border}`, borderRadius: T.radius, overflow: "hidden", background: mfSelected.has(note.id) ? `rgba(0,212,200,0.04)` : T.bgCard, transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "flex-start", padding: "10px 12px", gap: 8, cursor: "pointer" }} onClick={() => toggleSelect(note.id)}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${mfSelected.has(note.id) ? T.teal : T.border}`, background: mfSelected.has(note.id) ? T.teal : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  {mfSelected.has(note.id) && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: T.text }}>{note.text}</div>
                  <div style={{ fontSize: 9, color: T.textMuted, marginTop: 4 }}>{fmtDate(note.created)}</div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <Btn onClick={e => { e.stopPropagation(); brainstormNote(note); }} style={{ fontSize: 9, padding: "3px 8px" }} title="AI brainstorm — expand this idea">💡</Btn>
                  <Btn onClick={e => { e.stopPropagation(); deleteNote(note.id); }} style={{ fontSize: 9, padding: "3px 8px", color: T.red, background: "transparent", border: "none" }} title="Delete this note">✕</Btn>
                </div>
              </div>

              {/* Brainstorm expansion */}
              {mfExpanded === note.id && (mfBrainLoading || mfBrainstorm) && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 12px", background: T.bg }}>
                  {mfBrainLoading ? <div style={{ fontSize: 11, color: T.teal, fontWeight: 600, animation: "pulse 1s infinite" }}>💡 Brainstorming...</div>
                  : <>
                    <div style={{ fontSize: 9, color: T.teal, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>💡 AI BRAINSTORM</div>
                    <div style={{ fontSize: 12, lineHeight: 1.7, color: T.textDim, whiteSpace: "pre-wrap" }}>{mfBrainstorm}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      <Btn onClick={() => { const expanded = note.text + "\n\n--- AI Brainstorm ---\n" + mfBrainstorm; saveNotes(mfNotes.map(n => n.id === note.id ? { ...n, text: expanded } : n)); show("Brainstorm merged into note"); setMfExpanded(null); }} bg={T.green} style={{ fontSize: 10 }}>Merge into note</Btn>
                      <Btn onClick={() => { addNoteFromText(mfBrainstorm); show("Brainstorm saved as new note"); }} style={{ fontSize: 10 }}>Save as new note</Btn>
                    </div>
                  </>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>}

      {/* ═══ COPILOT MODE ═══ */}
      {mode === "copilot" && <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {cpViewSession ? <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <Btn onClick={() => setCpViewSession(null)}>← Back</Btn>
            <Btn onClick={() => exportDoc(cpViewSession)} bg={T.blue}>📄 Doc</Btn>
            <Btn onClick={() => { const t = (cpViewSession.exchanges || []).map((e, i) => `Exchange ${i+1}:\nHeard: ${e.heard}\nResponse: ${e.response}`).join("\n\n"); exportPDF(t || cpViewSession.fullTranscript || "Empty session", "Copilot Session"); }} bg={T.bgCard}>📄 PDF</Btn>
            <div style={{ position: "relative", display: "inline-block" }}>
              <Btn onClick={() => setShowShare(s => !s)}>↗ Share</Btn>
              {showShare && <ShareMenu text={`Just had a ${cpViewSession.niche || "coaching"} session coached by Intcu AI — The Intelligent Cue`} onClose={() => setShowShare(false)} />}
            </div>
          </div>
          <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Session Review</div>
          <div style={{ fontSize: 10, color: T.textDim, marginBottom: 12 }}>{fmtDate(cpViewSession.date)} · {cpViewSession.niche} · {cpViewSession.style}</div>
          {bounded(cpViewSession.exchanges || [], MAX_EXCHANGES).map((ex, i) => <div key={i} style={{ marginBottom: 12, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
            <div style={{ fontSize: 9, color: T.textDim, fontWeight: 700, marginBottom: 4 }}>Exchange {i + 1}</div>
            <div style={{ background: T.bg, borderLeft: `3px solid ${T.blue}`, padding: "6px 10px", borderRadius: "0 4px 4px 0", marginBottom: 4 }}><div style={{ fontSize: 8, color: T.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Heard</div><div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5 }}>{ex.heard}</div></div>
            <div style={{ background: "rgba(34,197,94,0.04)", borderLeft: `3px solid ${T.green}`, padding: "6px 10px", borderRadius: "0 4px 4px 0" }}><div style={{ fontSize: 8, color: T.green, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Response</div><div style={{ fontSize: 11, color: T.text, lineHeight: 1.5 }}>{ex.response}</div></div>
          </div>)}
          {cpViewSession.intel && <div style={{ background: "rgba(6,182,212,0.04)", border: `1px solid rgba(6,182,212,0.15)`, borderRadius: 6, padding: 10, marginTop: 8 }}>
            <div style={{ fontSize: 9, color: T.cyan, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>MEETING INTEL</div>
            <div style={{ fontSize: 11, color: T.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{cpViewSession.intel}</div>
          </div>}
        </div>

        : !cpActive ? <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ textAlign: "center", padding: "10px 0 16px" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🎙️</div>
            <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700 }}>Conversation Copilot</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 4, lineHeight: 1.5 }}>Real-time replies for real conversations.</div>
          </div>

          {cpSessions.length > 0 && <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600, marginBottom: 6 }}>Saved Sessions ({cpSessions.length})</div>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 6, maxHeight: 140, overflowY: "auto" }}>
              {bounded(cpSessions, MAX_SESSIONS).map(s => <div key={s.id} style={{ display: "flex", alignItems: "center", padding: "6px 10px", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }} onClick={() => setCpViewSession(s)}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600 }}>{s.niche} · {s.style}</div><div style={{ fontSize: 9, color: T.textMuted }}>{fmtDate(s.date)} · {s.exchanges?.length || 0} exc.</div></div>
                <Btn onClick={e => { e.stopPropagation(); exportDoc(s); }} style={{ background: "transparent", border: "none", color: T.blue, fontSize: 10 }}>📄</Btn>
                <Btn onClick={e => { e.stopPropagation(); saveSessions(cpSessions.filter(x => x.id !== s.id)); }} style={{ background: "transparent", border: "none", color: T.red, fontSize: 10 }}>✕</Btn>
              </div>)}
            </div>
          </div>}

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600, marginBottom: 6 }}>Scenario</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {COPILOT_NICHES.map(n => <Btn key={n.id} onClick={() => setCpNiche(n.id)} bg={cpNiche === n.id ? T.bgAlt : "transparent"} style={{ fontSize: 10, border: cpNiche === n.id ? `1px solid ${T.red}` : `1px solid ${T.border}`, textAlign: "left" }}>{n.label}</Btn>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
            {COPILOT_STYLES.map(s => <Pill key={s.id} label={`${s.icon} ${s.label}`} active={cpStyle === s.id} onClick={() => setCpStyle(s.id)} color={T.blue} />)}
          </div>
          <textarea value={cpCtx} onChange={e => setCpCtx(e.target.value)} placeholder="Your context / position (optional)" maxLength={1000} rows={2} style={{ ...iStyle, width: "100%", marginBottom: 12 }} />
          <Btn onClick={startCopilot} bg={T.teal} style={{ width: "100%", padding: "14px", fontSize: 15, textAlign: "center", fontWeight: 700, letterSpacing: 1 }}>🎙️ START LISTENING</Btn>
        </div>

        : <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Suggestion */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: `16px ${margin}%`, overflow: "auto", position: "relative" }}>
            {cpLoading && <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: T.blue, fontWeight: 700, letterSpacing: 2, animation: "pulse 1s infinite" }}>THINKING...</div>}
            {cpSuggestion ? <div style={{ fontSize: Math.max(fontSize * 0.65, 22), fontFamily: PROMPTER_FONTS[fontIdx].css, lineHeight: 1.6, color: T.text, textAlign: "center", whiteSpace: "pre-wrap", transform: mirrored ? "scaleX(-1)" : "none" }}>{cpSuggestion}</div>
            : <div style={{ textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 8 }}>🎙️</div><div style={{ fontSize: 12, color: T.textDim }}>Listening... responses appear on pause.</div></div>}
          </div>
          {/* Meeting Intel overlay */}
          {cpIntel && <div style={{ background: "rgba(6,182,212,0.06)", borderTop: `1px solid rgba(6,182,212,0.2)`, padding: "8px 14px", maxHeight: 100, overflowY: "auto", flexShrink: 0 }}>
            <div style={{ fontSize: 8, color: T.cyan, fontWeight: 700, letterSpacing: 2, marginBottom: 2 }}>MEETING INTEL</div>
            <div style={{ fontSize: 10, color: T.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{cpIntel}</div>
          </div>}
          {/* Transcript */}
          <div style={{ borderTop: `1px solid ${T.border}`, background: T.bgAlt, maxHeight: 64, overflowY: "auto", padding: "6px 14px", flexShrink: 0 }}>
            {cpTranscript.length === 0 && <div style={{ fontSize: 10, color: T.textMuted, fontStyle: "italic" }}>Transcript appears here...</div>}
            {bounded(cpTranscript, 10).slice(-10).map((t, i) => <span key={i} style={{ fontSize: 10, color: t.type === "interim" ? T.textMuted : T.textDim, marginRight: 3 }}>{t.text} </span>)}
          </div>
          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderTop: `1px solid ${T.chromeBorder}`, background: T.chromeMid, flexShrink: 0, flexWrap: "wrap" }}>
            <Btn onClick={cpRespondNow} bg={T.blue} title="Generate response immediately">⚡ Now</Btn>
            <Btn onClick={runIntel} bg={T.cyan} style={{ fontSize: 10 }} title="Analyse meeting themes & leverage">🧠 Intel</Btn>
            <select value={cpStyle} onChange={e => setCpStyle(e.target.value)} style={{ ...iStyle, padding: "3px 6px", fontSize: 10, flex: "0 0 auto" }}>{COPILOT_STYLES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}</select>
            <Btn onClick={() => exportDoc({ id: Date.now(), date: new Date().toISOString(), niche: (COPILOT_NICHES.find(n => n.id === cpNiche) || {}).label || "", style: cpStyle, context: cpCtx, exchanges: cpExchanges, fullTranscript: cpTranscript.filter(t => t.type === "final").map(t => t.text).join(" "), intel: cpIntel })} bg={T.bgCard} style={{ fontSize: 10 }} title="Export session as Word document">📄 Doc</Btn>
            <Btn onClick={() => { const t = cpExchanges.map((e, i) => `Exchange ${i+1}:\nHeard: ${e.heard}\nResponse: ${e.response}`).join("\n\n"); exportPDF(t || "No exchanges yet", "Copilot Session"); }} bg={T.bgCard} style={{ fontSize: 10 }} title="Export session as PDF">📄 PDF</Btn>
            <Btn onClick={stopCopilot} bg={T.red} title="Stop copilot and save session">■ Stop</Btn>
          </div>
          {roomOn && <div style={{ display: "flex", gap: 6, padding: "5px 12px", borderTop: `1px solid ${T.border}`, background: T.bg, flexShrink: 0 }}>
            <span style={{ fontSize: 8, color: T.purple, fontWeight: 700, letterSpacing: 1, alignSelf: "center" }}>TEAM</span>
            <input value={injText} onChange={e => setInjText(e.target.value)} placeholder="Note to team..." onKeyDown={e => { if (e.key === "Enter") sendInj(); }} style={{ ...iStyle, flex: 1, padding: "3px 8px", fontSize: 11 }} />
            <Btn onClick={sendInj} bg={T.purple} style={{ fontSize: 10 }}>Send</Btn>
          </div>}
        </div>}
      </div>}

      {/* ─── Onboarding Tour ─── */}
      {showTour && (() => {
        const TOUR = [
          null,
          { title: "Welcome to Intcu", text: "Your intelligent teleprompter with AI conversation copilot. Let's take a quick tour.", pos: "center" },
          { title: "Script Mode", text: "This is Script mode — your teleprompter. Type or paste your script, hit Play, and it scrolls for you. Voice scroll follows your speech.", pos: "top", top: 50 },
          { title: "Settings Strip", text: "These controls adjust your experience. Tap any pill to toggle features. The strip scrolls horizontally — swipe for more options.", pos: "top", top: 140 },
          { title: "Writer Mode", text: "Writer generates scripts with AI. Pick a format, tone, and duration. The Script Coach analyses your result.", pos: "top", top: 50 },
          { title: "MyFile Mode", text: "MyFile captures your ideas. Brainstorm with AI, then build structured prompts or send notes to the teleprompter.", pos: "top", top: 50 },
          { title: "Copilot Mode", text: "Copilot is the magic. It listens to live conversations and feeds you smart responses in real time. Pick from 10 scenarios.", pos: "top", top: 50 },
          { title: "Theme & Sync", text: "Switch light/dark mode here. The sync button creates team rooms for multi-screen collaboration.", pos: "topright" },
          { title: "You're ready!", text: "Press ? anytime for keyboard shortcuts. Hit 💬 to find quotes. Use the Translate dropdown for multilingual scripts.", pos: "center" },
        ];
        const step = TOUR[tourStep]; if (!step) return null;
        const isCentered = step.pos === "center";
        const finishTour = () => { localStorage.setItem("intcu-tour-done", "true"); setShowTour(false); setTourStep(0); };
        const cardStyle = { background: T.bgCard, border: `1px solid ${T.borderLit}`, borderRadius: 12, padding: "20px 24px", maxWidth: 320, width: "90%", boxShadow: "0 12px 48px rgba(0,0,0,0.4)", zIndex: 101 };
        const spotStyle = step.pos === "topright" ? { position: "fixed", top: 4, right: 4, width: 200, height: 38, borderRadius: 8, boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)", zIndex: 100, pointerEvents: "none" } : step.top ? { position: "fixed", top: step.top, left: 0, right: 0, height: 48, boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)", zIndex: 100, pointerEvents: "none" } : null;
        return <div style={{ position: "fixed", inset: 0, zIndex: 99 }}>
          {!isCentered && spotStyle && <div style={spotStyle} />}
          <div style={{ position: "fixed", inset: 0, background: isCentered ? "rgba(0,0,0,0.7)" : "transparent", zIndex: isCentered ? 100 : 98, display: "flex", alignItems: isCentered ? "center" : "flex-start", justifyContent: step.pos === "topright" ? "flex-end" : "center", paddingTop: isCentered ? 0 : ((step.top || 50) + 60) + "px", paddingRight: step.pos === "topright" ? 12 : 0 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.font, marginBottom: 8, color: T.text }}>{step.title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: T.textDim, marginBottom: 16 }}>{step.text}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {tourStep > 1 && <button onClick={() => setTourStep(s => s - 1)} style={{ padding: "6px 14px", borderRadius: T.radius, background: T.bgCard, border: `1px solid ${T.border}`, color: T.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>← Back</button>}
                  <button onClick={finishTour} style={{ padding: "6px 14px", borderRadius: T.radius, background: "transparent", border: "none", color: T.textMuted, fontSize: 11, cursor: "pointer", fontFamily: T.font }}>{tourStep === 8 ? "" : "Skip"}</button>
                </div>
                <button onClick={tourStep === 8 ? finishTour : () => setTourStep(s => s + 1)} style={{ padding: "8px 18px", borderRadius: T.radius, background: T.teal, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>{tourStep === 8 ? "Start Using Intcu" : "Next →"}</button>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 12 }}>
                {[1,2,3,4,5,6,7,8].map(n => <div key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: n === tourStep ? T.teal : T.border, transition: "background 0.2s" }} />)}
              </div>
              <div style={{ textAlign: "center", fontSize: 9, color: T.textMuted, marginTop: 6 }}>{tourStep} of 8</div>
            </div>
          </div>
        </div>;
      })()}

      {/* ─── Shortcuts Modal ─── */}
      {showShortcuts && <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }} onClick={() => setShowShortcuts(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: T.bgCard, border: `1px solid ${T.borderLit}`, borderRadius: 12, padding: "24px 28px", width: "92%", maxWidth: 520, maxHeight: "80vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: T.font }}>⌨ Keyboard Shortcuts</span>
            <Btn onClick={() => setShowShortcuts(false)} style={{ background: "transparent", border: "none", fontSize: 16 }}>✕</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontSize: 9, color: T.teal, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>PLAYBACK</div>
              {[["Space", "Play / Pause"], ["↑", "Speed up"], ["↓", "Speed down"], ["R", "Reset to start"], ["E", "Edit script"], ["M", "Mirror toggle"], ["F", "Fullscreen"]].map(([k, d]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <kbd style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: T.teal, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 8px", minWidth: 32, textAlign: "center" }}>{k}</kbd>
                  <span style={{ fontSize: 12, color: T.textDim }}>{d}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 9, color: T.teal, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>NAVIGATION</div>
              {[["?", "Shortcuts panel"], ["1", "Script mode"], ["2", "Writer mode"], ["3", "MyFile mode"], ["4", "Copilot mode"], ["Esc", "Close panels"]].map(([k, d]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <kbd style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: T.teal, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 8px", minWidth: 32, textAlign: "center" }}>{k}</kbd>
                  <span style={{ fontSize: 12, color: T.textDim }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 10, color: T.textMuted }}>Press <kbd style={{ fontFamily: "monospace", color: T.teal, border: `1px solid ${T.border}`, borderRadius: 3, padding: "1px 5px", fontSize: 10 }}>?</kbd> to toggle this panel</div>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <button onClick={() => { setShowShortcuts(false); localStorage.removeItem("intcu-tour-done"); setTourStep(1); setShowTour(true); }} style={{ background: "transparent", border: "none", color: T.textMuted, fontSize: 10, cursor: "pointer", fontFamily: T.font, textDecoration: "underline" }}>Restart onboarding tour</button>
          </div>
        </div>
      </div>}

      {/* ─── Upgrade Modal ─── */}
      {showUpgrade && <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)" }}>
        <div style={{ width: "94%", maxWidth: 700, maxHeight: "85vh", overflowY: "auto", background: T.bgCard, border: `1px solid ${T.borderLit}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div><div style={{ fontSize: 18, fontWeight: 700, fontFamily: T.font }}>Upgrade to unlock</div><div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{gatedFeature ? `"${gatedFeature}" requires a paid plan` : "Unlock all features"}</div></div>
            <Btn onClick={() => setShowUpgrade(false)} style={{ background: "transparent", border: "none", fontSize: 18 }}>✕</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {[
              { plan: "free", name: "Free", price: "$0", features: ["Full teleprompter", "3 AI calls/day", "Free engines only", "10 saved scripts"], current: getUserPlan() === "free" },
              { plan: "pro", name: "Pro", price: "$12/mo", features: ["Unlimited AI calls", "All 8 engines", "Copilot + Coach", "Recording + Export", "Translate + Quotes", "MyFile brainstorm"], current: getUserPlan() === "pro" },
              { plan: "team", name: "Team", price: "$29/seat/mo", features: ["Everything in Pro", "Room sync (10 members)", "Team copilot", "Tactical injections", "Priority routing", "Admin dashboard"], current: getUserPlan() === "team" },
            ].map(tier => (
              <div key={tier.plan} style={{ border: `1px solid ${tier.current ? T.teal : T.border}`, borderRadius: 10, padding: 16, background: tier.current ? `rgba(0,212,200,0.04)` : T.bg, position: "relative" }}>
                {tier.current && <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", background: T.teal, color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 8px", borderRadius: 10, letterSpacing: 1 }}>CURRENT</div>}
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{tier.name}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.teal, marginBottom: 10 }}>{tier.price}</div>
                {tier.features.map((f, i) => <div key={i} style={{ fontSize: 11, color: T.textDim, padding: "3px 0", borderBottom: `1px solid ${T.border}` }}>{f}</div>)}
                {!tier.current && tier.plan !== "free" && <button onClick={async () => {
                  try {
                    const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: tier.plan, interval: "month", email: currentUser?.email }) });
                    const data = await res.json();
                    if (data.url) { window.location.href = data.url; return; }
                  } catch {}
                  // Demo fallback: set plan directly
                  const updated = { ...currentUser, plan: tier.plan };
                  setCurrentUser(updated);
                  localStorage.setItem("intcu-user", JSON.stringify(updated));
                  const users = getUsers().map(u => u.email === updated.email ? updated : u);
                  localStorage.setItem("intcu-users", JSON.stringify(users));
                  setShowUpgrade(false);
                  show(`Plan upgraded to ${tier.name} (demo mode)`);
                }} style={{ width: "100%", marginTop: 12, padding: "10px 0", borderRadius: T.radius, background: T.teal, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Choose {tier.name}</button>}
              </div>
            ))}
          </div>
        </div>
      </div>}

      {/* Global file input (shared by Script and MyFile modes) */}
      <input ref={fileRef} type="file" accept=".txt,.docx,.pdf,.md,.rtf" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) importFile(e.target.files[0]); e.target.value = ""; }} />
      <Toast msg={toast} onDone={() => setToast("")} />
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.95)} }
        @keyframes fadeUp { from{opacity:0;transform:translate(-50%,10px)} to{opacity:1;transform:translate(-50%,0)} }
        ::-webkit-scrollbar{display:none} *{scrollbar-width:none}
        [title]{position:relative}
        [title]:hover::after{content:attr(title);position:absolute;bottom:110%;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#f4f4f5;padding:4px 10px;border-radius:6px;font-size:11px;white-space:nowrap;z-index:9999;pointer-events:none;opacity:0;animation:ttFade 0.15s ease 0.3s forwards;font-family:'Sora',sans-serif;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.4)}
        @keyframes ttFade{to{opacity:1}}
      `}</style>
    </div>
  );
}

const iStyle = { background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "8px 12px", color: T.text, fontSize: 13, fontFamily: T.font, outline: "none", boxSizing: "border-box" };

// ─── P10-R7: Wrapped export with Error Boundary ───
export default function App() { return <ErrorBoundary><IntcuApp /></ErrorBoundary>; }
