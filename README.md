# ContextAware Chrome Extension

A hybrid Chrome extension that provides context-aware summarization, explanations, and memory across browser tabs using Chrome's AI APIs (local + cloud).

## Features

- **⚡ Local Summarization**: Fast, on-device processing using Chrome AI Summarization API (Gemini Nano)
- **☁️ Cloud Reasoning**: Deep analysis and reasoning using Chrome Cloud AI API (Gemini 1.5 Pro)
- **📱 Modern UI**: Clean, minimal React interface with TailwindCSS and dark mode support
- **💾 Smart Storage**: Persistent summaries and browsing context using Chrome Storage API
- **🔊 Text-to-Speech**: Optional speech synthesis to read summaries aloud
- **🎯 Context-Aware**: Tracks browsing context per domain and session

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS 3 with dark mode
- **Extension**: Chrome Extension Manifest V3
- **AI**: Chrome AI APIs (Gemini Nano + Gemini 1.5 Pro)

## Project Structure

```
contextaware-extension/
├── public/
│   ├── manifest.json          # Chrome Extension Manifest V3
│   └── icons/                 # Extension icons (16, 32, 48, 128)
│
├── src/
│   ├── background/
│   │   └── background.ts      # Service worker for background tasks
│   │
│   ├── content/
│   │   ├── content.ts         # Content script injected into pages
│   │   └── content.css        # Styles for floating button and sidebar
│   │
│   ├── popup/
│   │   ├── index.html         # Popup HTML
│   │   ├── main.tsx           # Popup entry point
│   │   └── Popup.tsx          # Main popup component
│   │
│   ├── sidebar/
│   │   ├── index.html         # Sidebar HTML
│   │   ├── main.tsx           # Sidebar entry point
│   │   └── Sidebar.tsx        # Main sidebar component
│   │
│   ├── components/
│   │   ├── AIModeBadge.tsx    # Badge showing local/cloud mode
│   │   └── ThemeToggle.tsx    # Light/dark mode toggle
│   │
│   ├── services/
│   │   └── ai.ts              # AI service layer (Chrome AI API wrapper)
│   │
│   ├── utils/
│   │   └── storage.ts         # Chrome Storage API utilities
│   │
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   │
│   └── styles/
│       └── global.css         # Global styles and Tailwind directives
│
├── vite.config.ts             # Vite configuration for Chrome Extension
├── tailwind.config.js         # TailwindCSS configuration
├── tsconfig.json              # TypeScript configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Dependencies and scripts
```

## Component Architecture

### Background Service Worker (`src/background/background.ts`)
- Handles extension lifecycle events
- Coordinates AI processing between local and cloud
- Manages communication between content scripts and UI components
- Handles storage operations

### Content Script (`src/content/content.ts`)
- Injects floating action button on web pages
- Creates and manages sidebar iframe
- Handles text selection for quick summarization
- Communicates with background worker and sidebar

### Popup (`src/popup/Popup.tsx`)
- Main extension popup (opened from toolbar)
- Quick access to summarization features
- Settings management (theme, speech, auto-summarize)
- Displays summaries with copy and speak options

### Sidebar (`src/sidebar/Sidebar.tsx`)
- Injected sidebar for in-page AI interactions
- Shows page context and selected text
- Local and cloud AI controls
- Real-time summary display

### AI Service (`src/services/ai.ts`)
- **Local AI**: `AIService.summarizeLocal()` - Uses Gemini Nano for fast summaries
- **Cloud AI**: `AIService.analyzeCloud()` - Uses Gemini 1.5 Pro for deep analysis
- **Streaming**: `AIService.streamAnalysis()` - Real-time streaming responses
- **TTS**: `AIService.speak()` - Text-to-speech integration

### Storage Manager (`src/utils/storage.ts`)
- **Settings**: User preferences (theme, AI mode, speech, auto-summarize)
- **Summaries**: Cached summaries per URL (last 100)
- **Context**: Browsing context per domain (visits, summaries)

## Getting Started

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the extension:**
   ```bash
   npm run build
   ```

3. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

### Development

Run Vite in watch mode for hot reloading:

```bash
npm run dev
```

After making changes, reload the extension in Chrome:
- Click the refresh icon on `chrome://extensions/`

### Type Checking

```bash
npm run type-check
```

## Chrome AI API Integration

### TODO: Local AI (Gemini Nano)

The Chrome AI Summarization API provides fast, on-device processing. To integrate:

1. **Check availability:**
   ```typescript
   const capabilities = await chrome.ai.summarizer.capabilities();
   if (capabilities.available !== 'no') {
     // Summarizer is available
   }
   ```

2. **Create summarizer:**
   ```typescript
   const summarizer = await chrome.ai.summarizer.create({
     maxLength: 500,
     format: 'plain',
     type: 'key-points'
   });
   ```

3. **Summarize text:**
   ```typescript
   const summary = await summarizer.summarize(text);
   summarizer.destroy();
   ```

**Integration points:**
- `src/services/ai.ts` → `AIService.summarizeLocal()`
- `src/background/background.ts` → `handleLocalSummarization()`

### TODO: Cloud AI (Gemini 1.5 Pro)

The Chrome Cloud AI API provides advanced reasoning capabilities. To integrate:

1. **Check availability:**
   ```typescript
   const capabilities = await chrome.ai.languageModel.capabilities();
   if (capabilities.available !== 'no') {
     // Language model is available
   }
   ```

2. **Create session:**
   ```typescript
   const session = await chrome.ai.languageModel.create({
     systemPrompt: "You are an expert at analyzing web content.",
     temperature: 0.7,
     maxOutputTokens: 1024
   });
   ```

3. **Prompt the model:**
   ```typescript
   const response = await session.prompt(prompt);
   session.destroy();
   ```

4. **Stream responses:**
   ```typescript
   for await (const chunk of session.streamPrompt(prompt)) {
     console.log(chunk);
   }
   ```

**Integration points:**
- `src/services/ai.ts` → `AIService.analyzeCloud()`
- `src/services/ai.ts` → `AIService.streamAnalysis()`
- `src/background/background.ts` → `handleCloudSummarization()`

## Usage

### Quick Summary (Local AI)
1. Click the extension icon or floating button
2. Click "⚡ Quick Summary" for fast local processing
3. View the summary in the popup

### Deep Analysis (Cloud AI)
1. Select text on any webpage (optional)
2. Click "☁️ Deep Analysis" for comprehensive reasoning
3. Get detailed insights powered by Gemini 1.5 Pro

### Text-to-Speech
1. Enable speech in settings (checkbox in footer)
2. Click "🔊 Speak" to hear the summary aloud

### Sidebar Mode
1. Click the floating action button on any page
2. Interact with the AI in the sidebar
3. Get context-aware summaries without leaving the page

## Permissions

The extension requires the following Chrome permissions:

- `storage` - Save summaries and settings
- `activeTab` - Access current tab content
- `scripting` - Inject content scripts
- `tabs` - Query tab information
- `tts` - Text-to-speech synthesis
- `<all_urls>` - Work on all websites

## Development Roadmap

- [x] Project scaffolding and build configuration
- [x] React + TypeScript + TailwindCSS setup
- [x] Popup and sidebar UI components
- [x] Content script with floating button
- [x] Background service worker
- [x] Chrome Storage API integration
- [ ] Chrome AI Summarization API (Gemini Nano)
- [ ] Chrome Cloud AI API (Gemini 1.5 Pro)
- [ ] Streaming responses UI
- [ ] Context history visualization
- [ ] Export summaries (PDF, Markdown)
- [ ] Browser history integration
- [ ] Advanced settings panel

## Contributing

This is a template/scaffold. To continue development:

1. Replace placeholder AI implementations in `src/services/ai.ts`
2. Update background worker handlers with real AI calls
3. Add error handling and retry logic
4. Implement streaming UI for cloud responses
5. Add unit tests for AI service and storage
6. Create extension icons (16x16, 32x32, 48x48, 128x128)

## License

MIT

## Resources

- [Chrome AI APIs Documentation](https://developer.chrome.com/docs/ai)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
# ContextAware
