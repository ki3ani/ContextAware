# Development Guide

This guide will help you continue development of the ContextAware Chrome Extension.

## Quick Start

```bash
# Install dependencies
npm install

# Start development mode (watch mode)
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

## Development Workflow

### 1. Making Changes

When developing the extension:

1. Run `npm run dev` to start Vite in watch mode
2. Make changes to source files
3. Vite will automatically rebuild
4. Reload the extension in Chrome (`chrome://extensions/` → click reload)

### 2. Testing Changes

After each build:
- **Background script**: Check console at `chrome://extensions/` (click "service worker")
- **Content script**: Open DevTools on any webpage and check console
- **Popup**: Right-click extension icon → "Inspect popup"
- **Sidebar**: Right-click inside sidebar → "Inspect"

## Next Steps: Integrating Chrome AI APIs

### Step 1: Enable Chrome AI Origin Trial

1. Visit [Chrome Origin Trials](https://developer.chrome.com/origintrials/)
2. Sign up for the Chrome AI APIs origin trial
3. Add the trial token to your manifest.json:
   ```json
   "trial_tokens": ["YOUR_ORIGIN_TRIAL_TOKEN_HERE"]
   ```

### Step 2: Implement Local AI (Gemini Nano)

Open `src/services/ai.ts` and update `summarizeLocal()`:

```typescript
static async summarizeLocal(request: SummarizeRequest): Promise<SummarizeResponse> {
  try {
    // Check if API is available
    const capabilities = await chrome.ai.summarizer.capabilities();
    if (capabilities.available === 'no') {
      return {
        success: false,
        error: 'Summarization API not available'
      };
    }

    // Download model if needed
    if (capabilities.available === 'after-download') {
      // Show download progress UI
      console.log('Downloading Gemini Nano model...');
    }

    // Create summarizer
    const summarizer = await chrome.ai.summarizer.create({
      maxLength: 500,
      format: 'plain',
      type: 'key-points'
    });

    // Summarize
    const summary = await summarizer.summarize(request.text);

    // Clean up
    summarizer.destroy();

    return {
      success: true,
      summary,
      mode: 'local',
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Local summarization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### Step 3: Implement Cloud AI (Gemini 1.5 Pro)

Update `analyzeCloud()` in `src/services/ai.ts`:

```typescript
static async analyzeCloud(request: SummarizeRequest): Promise<SummarizeResponse> {
  try {
    // Check availability
    const capabilities = await chrome.ai.languageModel.capabilities();
    if (capabilities.available === 'no') {
      return {
        success: false,
        error: 'Language model API not available'
      };
    }

    // Create session
    const session = await chrome.ai.languageModel.create({
      systemPrompt:
        "You are an expert at analyzing and explaining web content. " +
        "Provide clear, concise, and insightful analysis with key takeaways.",
      temperature: 0.7,
      maxOutputTokens: 1024
    });

    // Create prompt
    const prompt = request.prompt ||
      `Analyze the following content and provide a comprehensive summary with key insights:\n\n${request.text}`;

    // Get response
    const response = await session.prompt(prompt);

    // Clean up
    session.destroy();

    return {
      success: true,
      summary: response,
      mode: 'cloud',
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Cloud analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### Step 4: Implement Streaming (Optional)

For real-time responses, update `streamAnalysis()`:

```typescript
static async *streamAnalysis(request: SummarizeRequest): AsyncGenerator<string> {
  const session = await chrome.ai.languageModel.create({
    systemPrompt: "You are an expert at analyzing web content.",
    temperature: 0.7
  });

  const prompt = request.prompt || `Analyze: ${request.text}`;

  for await (const chunk of session.streamPrompt(prompt)) {
    yield chunk;
  }

  session.destroy();
}
```

Then update the UI to consume the stream:

```typescript
// In Popup.tsx or Sidebar.tsx
async function handleStreamingSummarize() {
  setCurrentSummary('');
  setIsLoading(true);

  try {
    for await (const chunk of AIService.streamAnalysis({ text: pageText })) {
      setCurrentSummary(prev => prev + chunk);
    }
  } catch (error) {
    console.error('Streaming error:', error);
  } finally {
    setIsLoading(false);
  }
}
```

## Architecture Deep Dive

### Message Flow

```
Content Script (content.ts)
    ↓ postMessage
Sidebar UI (Sidebar.tsx)
    ↓ chrome.runtime.sendMessage
Background Worker (background.ts)
    ↓ calls
AI Service (ai.ts)
    ↓ calls
Chrome AI APIs
```

### Storage Schema

```typescript
// chrome.storage.sync
{
  "contextaware_settings": {
    theme: "light" | "dark",
    defaultAIMode: "local" | "cloud",
    enableSpeech: boolean,
    autoSummarize: boolean
  }
}

// chrome.storage.local
{
  "contextaware_summaries": {
    [url: string]: {
      url: string,
      summary: string,
      mode: "local" | "cloud",
      timestamp: number
    }
  },
  "contextaware_context": {
    [domain: string]: {
      domain: string,
      visits: number,
      lastVisit: number,
      summaries: Summary[]
    }
  }
}
```

## Adding New Features

### Example: Add Translation Feature

1. **Update types** (`src/types/index.ts`):
   ```typescript
   export interface TranslateRequest {
     text: string;
     targetLanguage: string;
   }
   ```

2. **Add to AI service** (`src/services/ai.ts`):
   ```typescript
   static async translate(request: TranslateRequest): Promise<string> {
     // Implementation
   }
   ```

3. **Add UI button** in `Popup.tsx` or `Sidebar.tsx`:
   ```tsx
   <button onClick={handleTranslate}>
     🌐 Translate
   </button>
   ```

4. **Update background worker** (`src/background/background.ts`):
   ```typescript
   case 'TRANSLATE':
     handleTranslation(message.data, sendResponse);
     return true;
   ```

## Debugging Tips

### Background Worker Console
```javascript
// In background.ts
console.log('[Background]', 'Your debug message');
```
View at: `chrome://extensions/` → Click "service worker"

### Content Script Console
```javascript
// In content.ts
console.log('[Content]', 'Your debug message');
```
View at: DevTools on any webpage

### React Components
Use React DevTools extension to inspect component state and props.

### Storage Debugging
```javascript
// View all storage
chrome.storage.sync.get(null, (data) => console.log('Sync:', data));
chrome.storage.local.get(null, (data) => console.log('Local:', data));

// Clear storage
chrome.storage.local.clear();
chrome.storage.sync.clear();
```

## Common Issues

### Issue: Extension not updating
**Solution**: Click reload button on `chrome://extensions/`

### Issue: Type errors in Chrome APIs
**Solution**: Ensure `@types/chrome` is installed and up to date

### Issue: Content script not injecting
**Solution**: Check `matches` pattern in manifest.json and ensure content script is being built

### Issue: Sidebar not appearing
**Solution**:
1. Check browser console for errors
2. Verify sidebar URL in manifest.json `web_accessible_resources`
3. Check z-index in content.css

### Issue: Storage not persisting
**Solution**: Check Chrome permissions in manifest.json

## Building for Production

1. **Update version** in `package.json` and `manifest.json`

2. **Build**:
   ```bash
   npm run build
   ```

3. **Test the build**:
   - Load `dist/` folder in Chrome
   - Test all features
   - Check for console errors

4. **Package for distribution**:
   ```bash
   cd dist
   zip -r ../contextaware-v0.1.0.zip .
   ```

5. **Publish to Chrome Web Store**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload the ZIP file
   - Fill in store listing details
   - Submit for review

## Resources

- [Chrome AI API Documentation](https://developer.chrome.com/docs/ai)
- [Chrome Extension Samples](https://github.com/GoogleChrome/chrome-extensions-samples)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Content Scripts Guide](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

## Getting Help

- Chrome Extension API: [Stack Overflow](https://stackoverflow.com/questions/tagged/google-chrome-extension)
- Chrome AI APIs: [Chrome for Developers](https://developer.chrome.com/docs/ai)
- React: [React Community](https://react.dev/community)

Happy coding! 🚀
