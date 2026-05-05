# Intcu Embed SDK

Embed the AI teleprompter and conversation copilot on any website with a single script tag.

## Quick Start

```html
<script src="https://intcu.com/sdk/intcu-sdk.js"></script>
<script>
  Intcu.init({
    mode: "copilot",
    position: "bottom-right",
    theme: "dark",
  });
</script>
```

That's it. A floating teal button appears. Click it to open the Intcu panel.

## Live Demo

Visit [intcu.com/sdk/demo.html](https://intcu.com/sdk/demo.html) to see the SDK in action.

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | string | `"copilot"` | `"copilot"`, `"script"`, or `"brainstorm"` |
| `position` | string | `"bottom-right"` | `"bottom-right"`, `"bottom-left"`, `"top-right"`, `"top-left"`, or `"inline"` |
| `theme` | string | `"dark"` | `"light"` or `"dark"` |
| `niche` | string | `"general"` | Copilot scenario: general, negotiate, sales, interview, debate, media, podcast, legal, academic, pastoral |
| `style` | string | `"brief"` | Response style: brief, detailed, diplomatic, assertive, socratic |
| `width` | string | `"400px"` | Panel width (CSS value) |
| `height` | string | `"600px"` | Panel height (CSS value) |
| `container` | string | `null` | CSS selector for inline mode (e.g. `"#my-container"`) |
| `collapsed` | bool | `true` | Start collapsed (button only) or open |
| `brandColor` | string | `"#00D4C8"` | Accent color for the floating button |
| `onSuggestion` | function | `null` | Callback when AI generates a response |
| `onTranscript` | function | `null` | Callback when speech is transcribed |
| `onReady` | function | `null` | Callback when iframe finishes loading |

---

## Methods

### `Intcu.init(config)`
Initialize the SDK. Call once per page. Pass configuration options.

### `Intcu.open()`
Open the panel (floating mode only).

### `Intcu.close()`
Close the panel (floating mode only).

### `Intcu.toggle()`
Toggle panel open/closed.

### `Intcu.destroy()`
Remove all Intcu elements from the DOM and clean up listeners.

### `Intcu.setMode(mode)`
Switch mode: `"copilot"`, `"script"`, or `"brainstorm"`.

### `Intcu.setNiche(niche)`
Change copilot scenario (e.g. `"sales"`, `"negotiate"`).

### `Intcu.setScript(text)`
Load text into the teleprompter script editor.

### `Intcu.sendInjection(text)`
Send a tactical injection (team note) into the active session.

---

## Events (Callbacks)

```javascript
Intcu.init({
  onSuggestion: function (text) {
    // AI generated a response for the user to say
    console.log("Say this:", text);
  },
  onTranscript: function (text) {
    // Speech was transcribed from the microphone
    console.log("Heard:", text);
  },
  onReady: function () {
    // Intcu iframe has loaded and is ready
    console.log("Intcu ready");
  },
});
```

---

## Integration Examples

### Negwin — AI Negotiation Platform

Embed Intcu's copilot in negotiation mode alongside deal pages:

```html
<script src="https://intcu.com/sdk/intcu-sdk.js"></script>
<script>
  Intcu.init({
    mode: "copilot",
    position: "bottom-right",
    theme: "dark",
    niche: "negotiate",
    style: "assertive",
    collapsed: true,
    onSuggestion: function (text) {
      // Show suggestion in Negwin's deal sidebar
      document.getElementById("negwin-ai-tip").textContent = text;
    },
  });

  // When user enters a deal room, set context
  Intcu.sendInjection("Deal value: $2.4M. Counterparty: Acme Corp. Our floor: $1.8M.");
</script>
```

### FoodyLuv — Restaurant & Food Platform

Embed inline teleprompter for restaurant owners recording menu videos:

```html
<div id="video-script-helper" style="width:100%;height:500px;"></div>

<script src="https://intcu.com/sdk/intcu-sdk.js"></script>
<script>
  Intcu.init({
    mode: "script",
    position: "inline",
    container: "#video-script-helper",
    width: "100%",
    height: "100%",
    theme: "light",
    onReady: function () {
      // Pre-load a menu description script
      Intcu.setScript(
        "Welcome to our restaurant!\n\n[PAUSE]\n\n" +
        "Today I want to tell you about our signature dish...\n\n" +
        "[BREATHE]\n\n" +
        "It starts with locally sourced ingredients..."
      );
    },
  });
</script>
```

### Generic SaaS — Customer Support Copilot

Help support agents respond to live chats:

```html
<script src="https://intcu.com/sdk/intcu-sdk.js"></script>
<script>
  Intcu.init({
    mode: "copilot",
    position: "bottom-left",
    theme: "dark",
    niche: "general",
    style: "diplomatic",
    width: "360px",
    height: "500px",
    onSuggestion: function (text) {
      // Auto-fill the chat reply box
      document.querySelector(".chat-reply-input").value = text;
    },
  });
</script>
```

---

## Inline vs Floating

**Floating** (default): Adds a button + expandable panel. Best for tools that run alongside the main page.

**Inline**: Embeds directly in a container. Best for dedicated pages where the teleprompter is the main content.

```javascript
// Floating
Intcu.init({ position: "bottom-right" });

// Inline
Intcu.init({ position: "inline", container: "#my-div", width: "100%", height: "600px" });
```

---

## Size

The SDK is a single file, ~5KB uncompressed, zero dependencies. It loads Intcu via iframe — no heavy bundle in your page.

---

## Support

- Website: [intcu.com](https://intcu.com)
- Issues: [github.com/kjssamsungdev-max/intcu](https://github.com/kjssamsungdev-max/intcu)
