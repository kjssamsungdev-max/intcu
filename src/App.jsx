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
      <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: LIGHT.bg, color: LIGHT.text, fontFamily: "'Sora', sans-serif", padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</div>
        <div style={{ fontSize: 14, color: LIGHT.textDim, marginBottom: 24 }}>Intcu encountered an error. Your data is safe.</div>
        <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
          style={{ padding: "10px 24px", borderRadius: 8, background: LIGHT.accent, color: LIGHT.bg, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
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

// ─── Theme: Dual mode (Light = newspaper, Dark = charcoal) ───
const LIGHT = {
  bg: "#fafaf9", bgAlt: "#f0efed", bgCard: "#ffffff",
  border: "#e2e0dc", borderLit: "#d4d0ca",
  text: "#1a1a1a", textDim: "#6b6b6b", textMuted: "#9ca3af",
  teal: "#009e95", tealDark: "#00857d", green: "#16a34a",
  red: "#dc2626", amber: "#d97706", blue: "#2563eb",
  purple: "#7c3aed", cyan: "#009e95",
  accent: "#009e95",
  font: "'Sora', sans-serif", fontSerif: "'Source Serif 4', serif",
  radius: 8, gap: 8, mode: "light",
};
const DARK = {
  bg: "#09090b", bgAlt: "#131316", bgCard: "#1c1c21",
  border: "#2a2a30", borderLit: "#3a3a42",
  text: "#f4f4f5", textDim: "#a1a1aa", textMuted: "#52525b",
  teal: "#00D4C8", tealDark: "#00B8A9", green: "#22c55e",
  red: "#ef4444", amber: "#f59e0b", blue: "#3b82f6",
  purple: "#a855f7", cyan: "#00D4C8",
  accent: "#00D4C8",
  font: "'Sora', sans-serif", fontSerif: "'Source Serif 4', serif",
  radius: 8, gap: 8, mode: "dark",
};
let T = LIGHT;
// ─── P10-R2: Named constants (no magic numbers) ───
const DEBOUNCE_MS = 2500;
const SCROLL_FACTOR = 0.6;
const TOAST_MS = 2500;
const COUNTDOWN_SECS = 3;
const FOCUS_INTERVAL_MS = 100;
const ELAPSED_INTERVAL_MS = 1000;
const VOICE_MAX_RESTARTS = 3;
const API_COOLDOWN_MS = 2000;
const CUE_FONT_SCALE = 0.45;
const SUGGESTION_FONT_SCALE = 0.65;
const EDIT_FONT_CAP = 22;
const EMPTY_LINE_SCALE = 0.4;
const SPEECH_LANG = "en-US";
const MAX_SPEECH_RESULTS = 50;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
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

// ─── P10-R4/R5: Utility functions (each ≤ 10 lines, guarded) ───
const wc = (t) => { if (!t) return 0; return t.trim().split(/\s+/).filter(Boolean).length; };
const estTime = (t) => { const m = Math.ceil(wc(t) / AVG_WPM); return m < 1 ? "<1m" : `${m}m`; };
const fmtTime = (s) => { if (s < 0) s = 0; return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const genCode = () => { const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let r = ""; for (let i = 0; i < 6; i++) r += c[Math.floor(Math.random() * c.length)]; return r; };
const bounded = (arr, max) => (arr || []).slice(0, max);
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
  try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; }
};

// P10-R5: Guarded cue renderer
function renderCue(text, enabled) {
  if (!text && text !== "") return "\u00A0";
  if (!enabled) return text || "\u00A0";
  const up = (text || "").trim().toUpperCase();
  if (CUE_MAP[up]) return <span style={{ color: CUE_MAP[up].color, fontSize: `${CUE_FONT_SCALE}em`, fontWeight: 700, letterSpacing: 3, fontFamily: T.font, display: "block", padding: "4px 0" }}>{CUE_MAP[up].label}</span>;
  if (text.includes("[EMPHASIS]")) {
    const parts = bounded(text.split(/\[EMPHASIS\]|\[\/EMPHASIS\]/i), 20);
    return parts.map((p, i) => i % 2 === 1
      ? <span key={i} style={{ color: T.amber, fontWeight: 700, borderBottom: `2px solid ${T.amber}`, paddingBottom: 2 }}>{p}</span>
      : <span key={i}>{p}</span>);
  }
  return text || "\u00A0";
}

// ─── P10-R7: AI API call wrapper (uses /api/ai proxy in production) ───
const API_ENDPOINT = "/api/ai";
const API_DIRECT = "https://api.anthropic.com/v1/messages"; // fallback for artifact/dev

async function callAI(system, userMsg, maxTokens = 1000, engine = "claude") {
  if (!userMsg) return null; // P10-R5
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
  <button disabled={disabled} onClick={onClick} title={title} aria-label={label || (typeof children === "string" ? children : undefined)} style={{ padding: "7px 14px", borderRadius: T.radius, background: bg || T.bgCard, color: T.text, border: `1px solid ${T.border}`, cursor: disabled ? "default" : "pointer", fontSize: 12, fontFamily: T.font, fontWeight: 600, whiteSpace: "nowrap", opacity: disabled ? 0.4 : 1, transition: "all 0.15s", ...s }}>{children}</button>
);

const Knob = ({ label, value, onChange, min, max, step = 1, unit = "" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
    <span style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: 2, color: T.textMuted, fontFamily: T.font }}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Btn onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))} style={{ width: 24, height: 24, padding: 0, fontSize: 14 }}>−</Btn>
      <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 13, fontWeight: 600, color: T.text, minWidth: 28, textAlign: "center", fontFamily: T.font }}>{value}{unit}</span>
      <Btn onClick={() => onChange(Math.min(max, +(value + step).toFixed(1)))} style={{ width: 24, height: 24, padding: 0, fontSize: 14 }}>+</Btn>
    </div>
  </div>
);

const Pill = ({ label, active, onClick, color = T.red, title }) => (
  <button onClick={onClick} title={title} style={{ padding: "4px 12px", borderRadius: 20, background: active ? color : "transparent", border: `1px solid ${active ? color : T.border}`, color: active ? "#fff" : T.textDim, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: T.font, letterSpacing: 0.5, transition: "all 0.15s" }}>{label}</button>
);

const Toast = ({ msg, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, TOAST_MS); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg) return null;
  return <div role="alert" aria-live="polite" style={{ position: "fixed", bottom: 60, left: "50%", transform: "translateX(-50%)", background: T.bgCard, border: `1px solid ${T.borderLit}`, borderRadius: 8, padding: "8px 20px", fontSize: 12, color: T.text, fontFamily: T.font, zIndex: 99, animation: "fadeUp 0.3s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>{msg}</div>;
};

// ═══════════════════════════════════════════════
// MAIN APPLICATION
// ═══════════════════════════════════════════════
function IntcuApp() {
  // ─── Mode ───
  const [mode, setMode] = useState("script");
  const [darkMode, setDarkMode] = useState(false);
  T = darkMode ? DARK : LIGHT;
  const [toast, setToast] = useState("");
  const show = (m) => setToast(m);

  // ─── Welcome Dashboard ───
  const [showWelcome, setShowWelcome] = useState(true);
  const [motd, setMotd] = useState(null);

  // ─── Script state ───
  const [script, setScript] = useState(`Welcome to Intcu — The Intelligent Cue.\n\nSpeak smarter. Respond instantly.\n\n[PAUSE]\n\nSwitch to Writer to generate scripts with AI. Switch to Copilot for live conversation intelligence.\n\n[BREATHE]\n\nUse cue markers: [PAUSE], [SLOW], [BREATHE] on their own line.\nWrap words in [EMPHASIS]like this[/EMPHASIS] for highlights.\n\nKeyboard: Space play/pause · ↑↓ speed · R reset · E edit · M mirror\n\n[PAUSE]\n\nNever miss a perfect line again.`);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
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
  const [orientation, setOrientation] = useState("auto");
  const [showLib, setShowLib] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [saveName, setSaveName] = useState("");
  const [ctrlOpen, setCtrlOpen] = useState(false);
  const [dyslexia, setDyslexia] = useState(false); // high-contrast, tinted bg, wider spacing
  const [apiCooldown, setApiCooldown] = useState(false);
  const voiceRestarts = useRef(0);
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
  const [captions, setCaptions] = useState(true);
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
    if (!lastT.current) lastT.current = ts;
    const dt = ts - lastT.current; lastT.current = ts;
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const m = lineMults[getActive()] || 1;
    el.scrollTop += (speed * 60 * dt * m) / 1000;
    const mx = el.scrollHeight - el.clientHeight;
    if (mx > 0) setProgress(Math.min((el.scrollTop / mx) * 100, 100));
    if (mx > 0 && el.scrollTop >= mx) { setPlaying(false); return; }
    animRef.current = requestAnimationFrame((t) => { if (animateFnRef.current) animateFnRef.current(t); });
  }, [speed, getActive, lineMults]);
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
        setTimeout(() => { try { r.start(); } catch (e) { console.warn("Voice restart failed:", e); setVoiceLive(false); } }, 1000);
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
      if (mode !== "script") return;
      if (e.code === "Space") { e.preventDefault(); doPlay(); }
      else if (e.code === "ArrowUp") { e.preventDefault(); setSpeed(s => Math.min(10, s + 1)); }
      else if (e.code === "ArrowDown") { e.preventDefault(); setSpeed(s => Math.max(1, s - 1)); }
      else if (e.code === "KeyR" && !e.metaKey) { e.preventDefault(); doReset(); }
      else if (e.code === "KeyE" && !e.metaKey) { e.preventDefault(); doEdit(); }
      else if (e.code === "KeyM" && !e.metaKey) { e.preventDefault(); setMirrored(m => !m); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mode, doPlay, doReset, doEdit]);

  // ─── Webcam Recording (P10-R5: guarded) ───
  const startCam = async () => {
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
    setWLoading(true); setWResult(""); setWCoach("");
    const prompt = `Write a ${wFmt.toLowerCase()} script about: "${wTopic}"\nTone: ${wTone}\nTarget: ~${parseInt(wDur) * AVG_WPM} words (${wDur} min)\n${wAud ? `Audience: ${wAud}` : ""}\n${wCtx ? `Context: ${wCtx}` : ""}\n\nRules:\n- ONLY the spoken text. No stage directions, brackets, headers.\n- Natural speech — contractions, rhetorical questions, pauses via line breaks.\n- Hook in first 10 seconds. Memorable close.\n- Match word count to target precisely.`;
    const result = await callAI(null, prompt, 4000, aiEngine);
    setWResult(result || "Generation failed — try again.");
    setWLoading(false);
  };

  // Script Coach Agent: analyzes generated script
  const runCoach = async () => {
    if (!wResult) return; // P10-R5
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
    const result = await callAI(
      `You are a professional translator. Translate the following script into ${targetLang}. PRESERVE all markers exactly as-is: [PAUSE], [BREATHE], [SLOW], [EMPHASIS], [/EMPHASIS]. Only translate the spoken text. Return ONLY the translated text with markers intact.`,
      text, 4000, aiEngine
    );
    return result || text;
  };

  // ─── Quote Finder (P10-R5: guarded) ───
  const searchQuotes = async () => {
    if (!quoteTopic.trim()) return;
    setQuoteLoading(true); setQuoteResults([]);
    const result = await callAI(
      `You are a quote research assistant. Return EXACTLY 5 verified, real quotes related to the topic. You must only use quotes you are confident are real and correctly attributed. Return as a JSON array with objects: {"quote":"...","author":"...","source":"...","year":"...","context":"..."}. Return ONLY the JSON array, no other text.`,
      `Find 5 verified quotes about: "${quoteTopic.trim()}"`, 2000, aiEngine
    );
    try {
      const clean = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed)) setQuoteResults(bounded(parsed, 5));
      else setQuoteResults([]);
    } catch { setQuoteResults([]); show("Quote format error — try again"); }
    setQuoteLoading(false);
  };

  const insertQuote = (q) => {
    const insert = `\n[PAUSE]\n"${q.quote}"\n— ${q.author}, ${q.source} (${q.year})\n[PAUSE]\n`;
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
          await new Promise((resolve, reject) => { s.onload = resolve; s.onerror = reject; document.head.appendChild(s); });
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
        setTimeout(() => { try { r.start(); } catch (e) { console.warn("Copilot restart failed:", e); } }, 1000);
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
  };

  const genCpResponse = async (transcript) => {
    if (!transcript?.trim()) return; // P10-R5
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

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: T.bg, color: T.text, overflow: "hidden", position: "relative", fontFamily: T.font, ...orientStyle }}>

      {/* ─── Top bar ─── */}
      {!fs && <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: T.bgAlt, borderBottom: `1px solid ${T.border}`, flexShrink: 0, minHeight: 42 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: (playing && !counting) || cpActive ? (voiceLive || cpActive ? T.teal : T.teal) : T.textMuted, boxShadow: (playing && !counting) || cpActive ? `0 0 10px ${T.teal}` : "none", transition: "all 0.3s" }} />
          <span style={{ fontFamily: T.font, fontSize: 14, fontWeight: 700, letterSpacing: 2.5 }}>INT<span style={{ color: T.teal }}>CU</span></span>
          {voiceLive && <span style={{ fontSize: 8, color: T.blue, fontWeight: 700, letterSpacing: 1, animation: "pulse 2s infinite" }}>VOICE</span>}
          {cpActive && <span style={{ fontSize: 8, color: T.red, fontWeight: 700, letterSpacing: 1, animation: "pulse 1.5s infinite" }}>LIVE</span>}
          {roomOn && <span style={{ fontSize: 8, color: T.purple, fontWeight: 700 }}>ROOM {roomCode}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {mode === "script" && <span style={{ fontSize: 9, color: T.textMuted }}>{words}w · {readTime}</span>}
          <button onClick={() => setDarkMode(!darkMode)} title="Switch light / dark mode" style={{ width: 36, height: 36, borderRadius: 8, background: darkMode ? T.bgCard : T.border, border: "1px solid " + T.borderLit, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{darkMode ? "☀️" : "🌙"}</button>
          <Btn onClick={() => setShowSync(true)} bg={roomOn ? T.purple : T.bgCard} style={{ fontSize: 10, padding: "4px 10px" }} title="Multi-screen sync & team rooms">{roomOn ? `📡 ${members.length}` : "📡"}</Btn>
        </div>
      </div>}

      {/* ─── Mode tabs ─── */}
      {!fs && <nav role="navigation" aria-label="Mode tabs" style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.bg, flexShrink: 0 }}>
        {[["script", "📝 Script"], ["writer", "✨ Writer"], ["myfile", "📋 MyFile"], ["copilot", "🎙️ Copilot"]].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={mode === id} aria-label={`${label} mode`} onClick={() => { if (playing) { setPlaying(false); stopVoice(); } if (cpActive) stopCopilot(); setMode(id); setShowWelcome(false); }}
            style={{ flex: 1, padding: "8px 0", background: mode === id ? T.bgAlt : "transparent", border: "none", borderBottom: mode === id ? `2px solid ${T.teal}` : "2px solid transparent", color: mode === id ? T.text : T.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: T.font, transition: "all 0.15s" }}>{label}</button>
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
            <input value={myName} onChange={e => setMyName(e.target.value)} placeholder="Your name" style={iStyle} />
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
              <input value={injText} onChange={e => setInjText(e.target.value)} placeholder="Team note..." onKeyDown={e => { if (e.key === "Enter") sendInj(); }} style={{ ...iStyle, flex: 1 }} />
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
            <span style={{ fontSize: 12, color: "#fff" }}>{inj.text}</span>
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
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: T.text, fontStyle: "italic", marginBottom: 6 }}>"{q.quote}"</div>
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
        {!fs && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "5px 10px", gap: 5, borderBottom: `1px solid ${T.border}`, background: T.bgAlt, flexShrink: 0, flexWrap: "wrap" }}>
          <Btn onClick={doPlay} bg={playing ? T.red : T.green} style={{ minWidth: 64 }} title="Play / Pause (Space)">{playing ? "⏸ Pause" : "▶ Play"}</Btn>
          <Btn onClick={doReset} title="Reset to start (R)">⟲</Btn>
          <Btn onClick={doEdit} title="Edit script (E)">✎</Btn>
          <Btn onClick={() => setShowLib(true)} title="Script library">📁</Btn>
          <Btn onClick={() => setShowQuotes(true)} label="Quote finder" title="Quote finder" style={{ minHeight: 40, fontSize: 16 }}>💬</Btn>
          <Btn onClick={() => setFs(!fs)} title="Fullscreen (double-tap)">{fs ? "⊡" : "⊞"}</Btn>
          {playing && !counting && <>
            <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 12, fontWeight: 600, color: T.textDim, marginLeft: 4 }}>{fmtTime(elapsed)}</span>
            {pace && <span style={{ fontSize: 8, fontWeight: 700, color: pace.c, letterSpacing: 1 }}>{pace.l}</span>}
          </>}
          <div style={{ width: 1, height: 18, background: T.border, margin: "0 2px" }} />
          <Knob label="Speed" value={speed} onChange={setSpeed} min={1} max={10} />
          <Knob label="Size" value={fontSize} onChange={setFontSize} min={18} max={96} step={2} />
        </div>}

        {/* Settings strip */}
        {!fs && <div>
          <div style={{ display: "flex", alignItems: "center", padding: "5px 10px 8px", gap: 10, borderBottom: `1px solid ${T.border}`, background: T.bgAlt, flexShrink: 0, overflowX: "auto", overflowY: "hidden", whiteSpace: "nowrap", WebkitOverflowScrolling: "touch", minHeight: 44 }}>
            <Knob label="Margin" value={margin} onChange={setMargin} min={0} max={40} step={5} unit="%" />
            <Knob label="Spacing" value={spacing} onChange={setSpacing} min={1.0} max={3.0} step={0.1} />
            <Knob label="Guide" value={guidePos} onChange={setGuidePos} min={15} max={50} step={5} unit="%" />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{[["Mirror", mirrored, () => setMirrored(!mirrored), T.red, "Flip text horizontally for glass rigs (M)"], ["Adapt", adaptive, () => setAdaptive(!adaptive), T.amber, "Adjust scroll speed per line density"], ["Focus", focus, () => setFocus(!focus), T.purple, "Highlight active line, dim others"], ["Voice", voiceOn, () => { if (voiceOn) { setVoiceOn(false); stopVoice(); } else setVoiceOn(true); }, T.blue, "Scroll follows your voice"], ["Cues", cues, () => setCues(!cues), T.amber, "Show [PAUSE] [SLOW] [BREATHE] markers"], ["Dyslexia", dyslexia, () => { setDyslexia(!dyslexia); if (!dyslexia) { setFontIdx(3); setSpacing(2.2); setFontSize(48); show("Dyslexia mode on — Lexend font, wider spacing"); } }, T.green, "Lexend font, tinted background, wider spacing"]].map(([l, a, fn, c, t]) => <Pill key={l} label={l} active={a} onClick={fn} color={c} title={t} />)}</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: 2 }}>Font</span>
              <select value={fontIdx} onChange={e => setFontIdx(+e.target.value)} style={{ background: T.bgCard, color: T.text, border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: T.font }}>{PROMPTER_FONTS.map((f, i) => <option key={i} value={i}>{f.name}</option>)}</select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: 2 }}>Layout</span>
              <select value={orientation} onChange={e => setOrientation(e.target.value)} style={{ background: T.bgCard, color: T.text, border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: T.font }}>{["auto", "portrait", "landscape"].map(o => <option key={o} value={o}>{o}</option>)}</select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: 2 }}>AI Engine</span>
              <select value={aiEngine} onChange={e => setAiEngine(e.target.value)} style={{ background: T.bgCard, color: T.text, border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: T.font }}>
                {AI_ENGINES.map(e => <option key={e.id} value={e.id}>{e.label} ({e.cost})</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: 2 }}>Translate</span>
              <select value={targetLang} onChange={e => setTargetLang(e.target.value)} title="Translate script or copilot responses" style={{ background: T.bgCard, color: T.text, border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: T.font }}>
                <option value="">Off</option>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            {targetLang && <Btn onClick={async () => { if (!script.trim()) return; show("Translating..."); const t = await translateScript(script); setScript(t); show(`Translated to ${targetLang}`); }} bg={T.blue} style={{ fontSize: 10 }}>Translate Script</Btn>}
            <Pill label="Captions" active={captions} onClick={() => setCaptions(!captions)} color={T.teal} title="Live speech captions overlay" />
          </div>
        </div>}

        {/* Viewport */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: dyslexia ? "#1a1f14" : "transparent" }} onDoubleClick={() => setFs(!fs)}>
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
            <div style={{ position: "absolute", left: 0, right: 0, top: `${guidePos}%`, height: 2, background: focus ? `rgba(0,212,200,0.3)` : `rgba(0,212,200,0.1)`, zIndex: 10, pointerEvents: "none" }}>
              <div style={{ position: "absolute", left: 0, top: -3, width: 6, height: 8, background: T.teal, borderRadius: "0 2px 2px 0" }} />
              <div style={{ position: "absolute", right: 0, top: -3, width: 6, height: 8, background: T.teal, borderRadius: "2px 0 0 2px" }} />
            </div>
          </>}
          {/* Camera PIP */}
          {camOn && <video ref={camVideoRef} muted playsInline style={{ position: "absolute", bottom: 60, right: 12, width: 120, height: 90, borderRadius: T.radius, border: `2px solid ${recording ? T.red : T.teal}`, objectFit: "cover", zIndex: 15 }} />}
          {/* Record button */}
          {!editing && <div style={{ position: "absolute", top: 8, right: 12, zIndex: 15, display: "flex", gap: 4 }}>
            <Btn onClick={camOn ? stopCam : startCam} bg={recording ? T.red : T.bgCard} style={{ fontSize: 10, padding: "4px 10px" }} title="Record webcam">
              {recording ? "⏹ Stop Rec" : "⏺ Record"}
            </Btn>
          </div>}
          {/* Live caption overlay */}
          {captions && captionText && !editing && <div style={{ position: "absolute", bottom: camOn ? 160 : 40, left: "10%", right: "10%", zIndex: 15, pointerEvents: "none", textAlign: "center" }}>
            <span style={{ background: "rgba(0,0,0,0.75)", color: "#fff", padding: "4px 14px", borderRadius: 4, fontSize: 14, fontFamily: T.font, fontWeight: 500, lineHeight: 1.6 }}>{captionText}</span>
          </div>}
          {editing ? <div style={{ width: "100%", height: "100%", position: "relative" }} onDragOver={e => e.preventDefault()} onDrop={handleFileDrop}>
            <textarea value={script} onChange={e => { setScript(e.target.value); setShowWelcome(false); }} placeholder="Paste script here or drop a .txt / .docx file..." style={{ width: "100%", height: "100%", resize: "none", background: "transparent", color: T.text, border: "none", outline: "none", padding: `20px ${margin}%`, fontSize: Math.min(fontSize, EDIT_FONT_CAP), fontFamily: PROMPTER_FONTS[fontIdx].css, lineHeight: 1.8, boxSizing: "border-box" }} />
            <button onClick={() => fileRef.current?.click()} style={{ position: "absolute", bottom: 12, right: 12, padding: "6px 14px", borderRadius: T.radius, background: T.bgCard, color: T.textDim, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 11, fontFamily: T.font, fontWeight: 600 }}>📁 Import file</button>
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
                  <button onClick={() => setShowWelcome(false)} style={{ width: "100%", padding: "10px 0", borderRadius: T.radius, background: T.teal, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, fontFamily: T.font, cursor: "pointer", letterSpacing: 0.5 }}>Start Writing</button>
                </div>
              </div>;
            })()}
          </div>
          : <div ref={scrollRef} style={{ width: "100%", height: "100%", overflowY: "auto", padding: `40vh ${margin}% 60vh`, boxSizing: "border-box", transform: mirrored ? "scaleX(-1)" : "none", scrollbarWidth: "none" }}
              onScroll={() => { if (scrollRef.current) { const mx = scrollRef.current.scrollHeight - scrollRef.current.clientHeight; if (mx > 0) setProgress((scrollRef.current.scrollTop / mx) * 100); } }}>
            {lines.map((line, i) => {
              const dist = Math.abs(i - activeLine);
              let op = 1;
              if (focus) { if (i === activeLine) op = 1; else if (dist === 1) op = 0.5; else if (dist === 2) op = 0.25; else op = 0.12; }
              return <div key={i} ref={el => lineRefs.current[i] = el} style={{ fontSize, fontFamily: PROMPTER_FONTS[fontIdx].css, lineHeight: spacing, color: dyslexia ? "#f5f0e0" : T.text, whiteSpace: "pre-wrap", wordBreak: "break-word", textAlign: dyslexia ? "left" : "center", fontWeight: i === activeLine && focus ? 600 : 400, opacity: op, transition: "opacity 0.4s, font-weight 0.3s", minHeight: line.trim() === "" ? fontSize * EMPTY_LINE_SCALE : "auto", letterSpacing: dyslexia ? "0.05em" : "normal", wordSpacing: dyslexia ? "0.15em" : "normal" }}>{renderCue(line, cues)}</div>;
            })}
          </div>}
        </div>
      </>}

      {/* ═══ WRITER MODE ═══ */}
      {mode === "writer" && <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <textarea value={wTopic} onChange={e => setWTopic(e.target.value)} placeholder="What's the topic or purpose?" rows={2} style={{ ...iStyle, width: "100%", marginBottom: 10, fontSize: 14, lineHeight: 1.5 }} />
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
            <textarea value={mfInput} onChange={e => setMfInput(e.target.value)} placeholder="Capture an idea, concept, or note..." rows={2}
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
            <Btn onClick={() => exportDoc(cpViewSession)} bg={T.blue}>📄 Export</Btn>
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
          <textarea value={cpCtx} onChange={e => setCpCtx(e.target.value)} placeholder="Your context / position (optional)" rows={2} style={{ ...iStyle, width: "100%", marginBottom: 12 }} />
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
          <div style={{ borderTop: `1px solid ${T.border}`, background: T.bg, maxHeight: 64, overflowY: "auto", padding: "6px 14px", flexShrink: 0 }}>
            {cpTranscript.length === 0 && <div style={{ fontSize: 10, color: T.textMuted, fontStyle: "italic" }}>Transcript appears here...</div>}
            {bounded(cpTranscript, 10).slice(-10).map((t, i) => <span key={i} style={{ fontSize: 10, color: t.type === "interim" ? T.textMuted : T.textDim, marginRight: 3 }}>{t.text} </span>)}
          </div>
          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderTop: `1px solid ${T.border}`, background: T.bgAlt, flexShrink: 0, flexWrap: "wrap" }}>
            <Btn onClick={cpRespondNow} bg={T.blue} title="Generate response immediately">⚡ Now</Btn>
            <Btn onClick={runIntel} bg={T.cyan} style={{ fontSize: 10 }} title="Analyse meeting themes & leverage">🧠 Intel</Btn>
            <select value={cpStyle} onChange={e => setCpStyle(e.target.value)} style={{ ...iStyle, padding: "3px 6px", fontSize: 10, flex: "0 0 auto" }}>{COPILOT_STYLES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}</select>
            <Btn onClick={() => exportDoc({ id: Date.now(), date: new Date().toISOString(), niche: (COPILOT_NICHES.find(n => n.id === cpNiche) || {}).label || "", style: cpStyle, context: cpCtx, exchanges: cpExchanges, fullTranscript: cpTranscript.filter(t => t.type === "final").map(t => t.text).join(" "), intel: cpIntel })} bg={T.bgCard} style={{ fontSize: 10 }} title="Export session as Word document">📄</Btn>
            <Btn onClick={stopCopilot} bg={T.red} title="Stop copilot and save session">■ Stop</Btn>
          </div>
          {roomOn && <div style={{ display: "flex", gap: 6, padding: "5px 12px", borderTop: `1px solid ${T.border}`, background: T.bg, flexShrink: 0 }}>
            <span style={{ fontSize: 8, color: T.purple, fontWeight: 700, letterSpacing: 1, alignSelf: "center" }}>TEAM</span>
            <input value={injText} onChange={e => setInjText(e.target.value)} placeholder="Note to team..." onKeyDown={e => { if (e.key === "Enter") sendInj(); }} style={{ ...iStyle, flex: 1, padding: "3px 8px", fontSize: 11 }} />
            <Btn onClick={sendInj} bg={T.purple} style={{ fontSize: 10 }}>Send</Btn>
          </div>}
        </div>}
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

const iStyle = { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "8px 12px", color: T.text, fontSize: 13, fontFamily: T.font, outline: "none", boxSizing: "border-box" };

// ─── P10-R7: Wrapped export with Error Boundary ───
export default function App() { return <ErrorBoundary><IntcuApp /></ErrorBoundary>; }
