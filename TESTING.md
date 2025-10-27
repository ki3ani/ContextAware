# Testing ContextAware Extension

## ✅ Build Complete!

Your extension is built and ready to test. Here's how to load it in Chrome:

---

## 📦 Load Extension in Chrome

### Step 1: Open Chrome Extensions Page
1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Or click: **Menu (⋮) → Extensions → Manage Extensions**

### Step 2: Enable Developer Mode
1. Toggle **"Developer mode"** ON (top-right corner)
2. You should now see additional buttons appear

### Step 3: Load the Extension
1. Click **"Load unpacked"** button
2. Navigate to your project folder
3. Select the **`dist`** folder
4. Click **"Select Folder"**

### Step 4: Verify Installation
You should see:
- ✅ **ContextAware** extension card with purple gradient "CA" icon
- ✅ Extension icon in your Chrome toolbar
- ✅ No errors in the extension card

---

## 🧪 Testing the Extension

### Test 1: Extension Popup
1. **Click the ContextAware icon** in your toolbar
2. You should see:
   - Purple/blue header with "ContextAware" title
   - ⚡ "Quick Summary" button (blue)
   - ☁️ "Deep Analysis" button (purple)
   - Dark mode toggle (moon/sun icon)
   - Empty summary area with icon

3. **Click "⚡ Quick Summary"**
   - Button should show loading state
   - After ~1 second, you'll see a placeholder summary
   - Summary will say it's a placeholder for Gemini Nano
   - ⚡ Local badge should appear in header

4. **Click "☁️ Deep Analysis"**
   - Button should show loading state
   - After ~2 seconds, you'll see a different placeholder summary
   - Summary will mention Gemini 1.5 Pro
   - ☁️ Cloud badge should appear in header

5. **Test Copy Button**
   - Click "📋 Copy" below the summary
   - Paste somewhere to verify it copied

6. **Test Dark Mode**
   - Click the moon icon (top-right)
   - UI should switch to dark theme
   - Click sun icon to switch back

### Test 2: Floating Action Button
1. **Open any website** (e.g., wikipedia.org/wiki/Artificial_intelligence)
2. Look for a **purple gradient circular button** in bottom-right corner
3. **Hover over it** - should scale up slightly
4. **Click the button** - sidebar should slide in from the right

### Test 3: Sidebar
1. With sidebar open, you should see:
   - Header with "ContextAware" and close button (X)
   - Current page info (title and URL)
   - ⚡ Local Summary and ☁️ Deep Analysis buttons
   - Tips footer at the bottom

2. **Select some text** on the page
   - Sidebar should show "Selected: [your text]..." in yellow box

3. **Click "⚡ Local Summary"**
   - Loading spinner appears
   - Placeholder summary appears after 1 second
   - Shows local AI badge

4. **Click "☁️ Deep Analysis"**
   - Loading spinner appears
   - Different placeholder summary after 2 seconds
   - Shows cloud AI badge

5. **Test Copy in Sidebar**
   - Click "📋 Copy" button
   - Summary should be copied to clipboard

6. **Close Sidebar**
   - Click X button in top-right
   - Sidebar should slide out
   - Floating button should return to normal state

### Test 4: Text Selection Highlight
1. On any webpage, **select text** (more than 50 characters)
2. The floating action button should:
   - Change to pink/red gradient
   - Show pulsing animation
   - Title should say "Summarize selected text"

3. **Deselect the text**
   - Button should return to purple gradient
   - Animation should stop

---

## 🔍 Debugging

### Check Background Script Console
1. Go to `chrome://extensions/`
2. Find ContextAware card
3. Click **"service worker"** link
4. DevTools will open showing background script console
5. You should see logs like:
   - "ContextAware installed: install"
   - "Background received message: ..."

### Check Content Script Console
1. Open any webpage
2. Press **F12** (or right-click → Inspect)
3. Go to **Console** tab
4. Look for ContextAware messages
5. Should see initialization logs

### Check Popup Console
1. **Right-click the extension icon**
2. Select **"Inspect popup"**
3. DevTools opens for the popup
4. Check Console for errors
5. Use React DevTools if installed

### Check Sidebar Console
1. With sidebar open on a page
2. **Right-click inside the sidebar**
3. Select **"Inspect"**
4. DevTools opens in separate window
5. Check Console tab

---

## 🎨 What You Should See

### Icons
- **16x16**: Toolbar icon (small)
- **48x48**: Extensions page
- **128x128**: Chrome Web Store (future)
- All show purple gradient with "CA" text

### Colors
- **Primary Blue**: `#0ea5e9` (Quick Summary button)
- **Purple**: `#a855f7` (Deep Analysis button)
- **Gradient**: Purple (#667eea) → Blue (#764ba2)
- **Dark Mode**: Gray-900 background

### Animations
- ✨ Fade-in for UI elements
- 🎯 Slide-in for sidebar
- 💫 Scale on button hover
- 🔄 Pulse on text selection

---

## ⚠️ Known Limitations (Placeholders)

Since the Chrome AI APIs aren't integrated yet:

1. **Summaries are fake** - Shows placeholder text instead of real AI summaries
2. **Processing is simulated** - Uses setTimeout instead of real API calls
3. **No model download** - Real extension will download Gemini Nano
4. **No streaming** - Cloud responses appear all at once
5. **Storage works** - Summaries ARE saved/loaded from Chrome Storage

---

## 📝 What's Actually Working

✅ **Full UI**: Popup, sidebar, floating button
✅ **Dark mode**: Theme switching and persistence
✅ **Chrome Storage**: Settings and summaries saved
✅ **Content script injection**: Works on all websites
✅ **Message passing**: Background ↔ Content ↔ UI
✅ **Text selection detection**: Highlights FAB
✅ **Responsive design**: Works on different screen sizes
✅ **TTS ready**: Chrome Speech Synthesis integrated

❌ **AI APIs**: Placeholder only (needs integration)
❌ **Real summaries**: Not implemented yet
❌ **Streaming**: Not implemented yet

---

## 🐛 Common Issues

### Extension won't load
- Make sure you're loading the `dist/` folder, not the root folder
- Check for errors on `chrome://extensions/`
- Try running `npm run build` again

### Floating button not appearing
- Check browser console for errors
- Verify content script is injecting (F12 → Console)
- Try refreshing the page

### Popup is blank
- Right-click icon → Inspect popup
- Check console for errors
- Verify HTML files are in dist/src/popup/

### Sidebar not opening
- Check that floating button exists first
- Open browser console for errors
- Verify sidebar HTML is in dist/src/sidebar/

### Dark mode not working
- Check localStorage in DevTools
- Verify TailwindCSS is loading
- Inspect element to see if 'dark' class is applied

---

## 🎯 Next Steps (Phase 2)

After testing the scaffold:

1. **Research Chrome AI APIs**
   - Check if available in Chrome Canary
   - Sign up for origin trial if needed

2. **Integrate Local AI (Gemini Nano)**
   - Replace `src/services/ai.ts:summarizeLocal()`
   - Test with real summarization

3. **Integrate Cloud AI (Gemini 1.5 Pro)**
   - Replace `src/services/ai.ts:analyzeCloud()`
   - Add streaming support

4. **Enhanced Features**
   - History view
   - Export summaries
   - Keyboard shortcuts
   - Better error handling

---

## 📞 Need Help?

If something isn't working:

1. Check the console for errors
2. Verify build completed without errors
3. Make sure you're using latest Chrome version
4. Try disabling other extensions
5. Clear Chrome cache and reload extension

---

**Happy Testing! 🚀**
