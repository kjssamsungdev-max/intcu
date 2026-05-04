# Intcu — The Intelligent Cue

**Speak smarter. Respond instantly.**

An AI-powered teleprompter that listens to live conversations and instantly generates natural, context-aware replies you can deliver in real time.

**Domain:** intcu.com
**Stack:** React 18 + Vite 6 + Cloudflare Pages
**Standard:** NASA Power of 10 compliant

## Features

### Script Mode
Auto-scroll teleprompter with adaptive speed, focus highlight, voice scroll, cue markers, mirror mode, portrait/landscape, fullscreen, rehearsal timer with pace tracking.

### AI Writer + Script Coach Agent
Generate scripts by topic, tone, audience, duration. Script Coach AI agent analyzes pacing, hooks, emotional arc, and suggests improvements.

### Conversation Copilot + Meeting Intel Agent
Real-time speech transcription with AI response generation across 10 scenarios: Negotiation, Sales, Interview, Debate, Media, Podcast, Legal, Academic, Pastoral, General. Meeting Intelligence agent tracks themes, sentiment, leverage, risks.

### Multi-Screen Sync + Team Copilot
Room-based sync for multi-screen teleprompter rigs. Team members join with a 6-character code, assign screen positions (L/C/R), share copilot coaching, and inject tactical notes visible on all connected screens.

### Session Recording
Auto-save copilot sessions. Review exchange-by-exchange. Export to Word (.doc) with full transcript and meeting intel.

## Deploy

```bash
cd intcu
npm install
npm run build
npm run deploy
```

### Custom domain setup
1. Cloudflare Dashboard → Pages → intcu → Custom domains
2. Add intcu.com
3. DNS auto-configured if domain is on Cloudflare

### Post-deploy
1. Open in Chrome (best SpeechRecognition support)
2. Allow microphone when prompted
3. Ctrl+Shift+R or incognito to verify latest deploy

## Target Audiences
- Content creators & streamers
- Podcasters & interviewers
- Sales professionals
- Public speakers & executives
- Customer support teams
- Negotiation & pitch teams

## Brand
- **Primary:** Deep Teal #00D4C8
- **Secondary:** Dark Navy #0A2540
- **Typography:** Sora (UI) + Source Serif 4 (prompter)
- **Tone:** Professional, approachable, confident, intelligent
