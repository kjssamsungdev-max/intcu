# INTCU — Claude Code Handoff v2

## Domain: intcu.com | Stack: Vite 6 + React 18 + CF Pages + Functions + KV + D1

---

## 1. DEPLOY SEQUENCE

```bash
cd intcu
npm install
npm run build

# Create KV for room sync
wrangler kv namespace create INTCU_ROOMS

# Create D1 for users/subscriptions
wrangler d1 create intcu-db
wrangler d1 execute intcu-db --command "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, plan TEXT DEFAULT 'free', stripe_id TEXT, api_calls_today INTEGER DEFAULT 0, last_reset TEXT, created TEXT);"
wrangler d1 execute intcu-db --command "CREATE TABLE IF NOT EXISTS usage (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, engine TEXT, tokens_in INTEGER, tokens_out INTEGER, ts TEXT);"

# Deploy
npm run deploy
```

Update wrangler.toml with IDs from above, then redeploy.

---

## 2. ENVIRONMENT VARIABLES (Cloudflare Dashboard → Pages → intcu → Settings)

### Required
| Variable | Source | Notes |
|---|---|---|
| ANTHROPIC_API_KEY | console.anthropic.com | Claude Sonnet — primary engine |

### Optional (add as budget allows — proxy auto-falls back to Claude)
| Variable | Source | Free tier |
|---|---|---|
| DEEPSEEK_API_KEY | platform.deepseek.com | 5M tokens free, no CC required |
| GROK_API_KEY | docs.x.ai | $25 free credits |
| GEMINI_API_KEY | aistudio.google.com | Generous free tier |
| OPENAI_API_KEY | platform.openai.com | Pay-as-you-go |
| MINIMAX_API_KEY | platform.minimaxi.com | Free credits |
| MISTRAL_API_KEY | console.mistral.ai | Free tier available |
| GROQ_API_KEY | console.groq.com | Free tier, very fast |
| STRIPE_SECRET_KEY | dashboard.stripe.com | For billing |
| STRIPE_WEBHOOK_SECRET | dashboard.stripe.com | For subscription events |

### Priority order for free launch
1. ANTHROPIC_API_KEY (must have)
2. GROQ_API_KEY (free, fast — good free tier engine)
3. DEEPSEEK_API_KEY (near-free — best value engine)
4. GEMINI_API_KEY (free tier — Google backing)
5. GROK_API_KEY ($25 free credits)
6. Others as needed

---

## 3. AI ENGINE PRICING (per 1M tokens, as of May 2026)

| Engine | Input | Output | Free tier | Best for |
|---|---|---|---|---|
| DeepSeek V4 | $0.14 | $0.28 | 5M tokens | High-volume copilot (cheapest) |
| Grok 4.1 Fast | $0.20 | $0.50 | $25 credits | Real-time X data access |
| Groq (Llama 4) | $0.11 | $0.34 | Free tier | Fastest inference speed |
| Gemini Flash | $0.50 | $3.00 | Free tier | Multimodal, Google ecosystem |
| GPT-5 mini | $0.25 | $2.00 | Pay-as-you-go | Reliable, mature ecosystem |
| MiniMax M2.7 | $0.14 | varies | Credits | Coding-focused tasks |
| Mistral Large | $0.50 | $1.50 | Free tier | European data residency |
| Claude Sonnet | $3.00 | $15.00 | Pay-as-you-go | Highest coaching quality |

### Cost per copilot session (~500 tokens in, ~200 out per exchange, 10 exchanges)
| Engine | Cost per session | Pro user (20 sessions/mo) |
|---|---|---|
| DeepSeek | $0.001 | $0.02/mo |
| Groq | $0.001 | $0.02/mo |
| Grok | $0.002 | $0.04/mo |
| Gemini | $0.009 | $0.18/mo |
| GPT-5 mini | $0.005 | $0.10/mo |
| Claude | $0.045 | $0.90/mo |

Intcu Pro at $12/mo with Claude costs ~$0.90 in API = 92% gross margin.
With DeepSeek: ~$0.02 = 99.8% gross margin.

---

## 4. PRICING TIERS & USAGE GATES

### Tier definitions
```
FREE ("Cue")
├── Full teleprompter (all script mode features)
├── File import (.docx, .txt)
├── Offline mode
├── 3 AI calls/day (writer + coach only)
├── 10 saved scripts
├── Free engines only: DeepSeek, Grok, Groq, Gemini
├── NO copilot
├── NO team/sync
├── NO recording
└── NO MyFile brainstorm

PRO ($12/mo | $99/yr)
├── Everything in Free
├── Unlimited AI calls
├── All 8 engines (user picks)
├── Full copilot (all 10 scenarios)
├── Meeting Intel agent
├── Script Coach agent
├── Webcam recording
├── Live captions
├── MyFile brainstorm + prompt builder
├── Session export (.doc)
├── Unlimited scripts
└── Single user

TEAM ($29/seat/mo | $249/seat/yr)
├── Everything in Pro
├── Room sync (multi-screen L/C/R)
├── Team copilot (shared AI coaching)
├── Tactical injections
├── Up to 10 members/room
├── Shared session library
├── Priority engine routing
└── Admin dashboard

ENTERPRISE (custom)
├── Everything in Team
├── Unlimited seats
├── Custom niche scenarios
├── SSO + SAML
├── Dedicated AI endpoint
├── White-label
├── SLA + onboarding
└── Data residency options
```

### Implementation: Usage gate system
Add to App.jsx — check tier before gated features:

```javascript
// Usage tracking in localStorage (synced to D1 on auth)
const FREE_DAILY_LIMIT = 3;
const FREE_SCRIPT_LIMIT = 10;

const checkGate = (feature) => {
  const plan = localStorage.getItem('intcu-plan') || 'free';
  const gates = {
    copilot: ['pro', 'team', 'enterprise'],
    team_sync: ['team', 'enterprise'],
    recording: ['pro', 'team', 'enterprise'],
    myfile_brainstorm: ['pro', 'team', 'enterprise'],
    unlimited_ai: ['pro', 'team', 'enterprise'],
    all_engines: ['pro', 'team', 'enterprise'],
    session_export: ['pro', 'team', 'enterprise'],
  };
  if (!gates[feature]) return true; // ungated
  return gates[feature].includes(plan);
};

const checkDailyLimit = () => {
  const plan = localStorage.getItem('intcu-plan') || 'free';
  if (plan !== 'free') return true;
  const today = new Date().toDateString();
  const data = JSON.parse(localStorage.getItem('intcu-usage') || '{}');
  if (data.date !== today) { data.date = today; data.count = 0; }
  if (data.count >= FREE_DAILY_LIMIT) return false;
  data.count++;
  localStorage.setItem('intcu-usage', JSON.stringify(data));
  return true;
};
```

### Gate UI patterns
- Gated tabs show lock icon + "Pro" badge
- Tapping gated feature shows upgrade modal with pricing
- Free engine selector only shows free-tier engines
- Daily limit shows "3/3 used today — upgrade for unlimited"

---

## 5. STRIPE INTEGRATION

### Products to create in Stripe Dashboard
```
Product: Intcu Pro
├── Price: $12/mo (price_xxxxx)
└── Price: $99/yr (price_xxxxx)

Product: Intcu Team
├── Price: $29/seat/mo (price_xxxxx)
└── Price: $249/seat/yr (price_xxxxx)
```

### Checkout flow (Pages Function)
Create `functions/api/checkout.js`:
```javascript
// POST /api/checkout { plan: "pro", interval: "month" }
// Returns Stripe Checkout session URL
// On success, Stripe webhook updates D1 user record
```

Create `functions/api/webhook.js`:
```javascript
// POST /api/webhook (Stripe webhook endpoint)
// Handles: checkout.session.completed, customer.subscription.updated/deleted
// Updates D1 users table with plan status
```

### Auth flow (minimal)
Create `functions/api/auth.js`:
```javascript
// POST /api/auth { email, action: "login" | "register" }
// Sends magic link email via Resend/SendGrid
// Returns JWT token stored in localStorage
// Token checked on gated API calls
```

---

## 6. CUSTOM DOMAIN

Cloudflare Dashboard → Pages → intcu → Custom domains → Add intcu.com
DNS auto-configures if domain is on Cloudflare.

---

## 7. POST-DEPLOY VERIFICATION

```
1. intcu.com loads (Ctrl+Shift+R)
2. Script mode → Play → scroll works
3. Writer → generate → AI responds
4. Copilot → Start Listening → mic works → transcript appears → AI responds
5. Switch engine to DeepSeek → generate → different model responds
6. Sync → Create Room → second tab → Join → scroll syncs
7. Dyslexia → toggle → Lexend font + tinted bg
8. Import → drop .docx → text extracted
9. MyFile → add note → brainstorm → build prompt
10. Record → camera pip appears → stop → .webm downloads
```

---

## 8. REMAINING CC TASKS (priority order)

1. **Usage gates** — implement checkGate() and checkDailyLimit() as described above
2. **Stripe checkout** — create checkout.js and webhook.js Pages Functions
3. **Auth** — magic link email auth, JWT in localStorage
4. **Word-by-word tracking** — split lines into word spans, highlight current word at guide position
5. **Accessibility** — aria-labels on all buttons, role attributes, tabIndex, aria-live regions
6. **Error boundary** — React ErrorBoundary wrapper component
7. **Upgrade modal** — pricing cards, Stripe checkout redirect, plan comparison

---

## FILE STRUCTURE (14 files)
```
intcu/
├── index.html                    # Entry + SEO + PWA + SW registration
├── package.json                  # Vite + React, deploy script
├── vite.config.js                # Terser minify
├── wrangler.toml                 # CF Pages + KV binding
├── .gitignore
├── README.md                     # Brand docs
├── CC_HANDOFF.md                 # This file
├── public/
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker (offline)
├── functions/api/
│   ├── ai.js                     # AI proxy — 8 engines, rate limited
│   └── room.js                   # Room sync KV relay
└── src/
    ├── main.jsx                  # React entry
    └── App.jsx                   # Full app (1300 lines, NASA P10)
```
