import { useState, useEffect } from 'react';
import { StorageManager } from '@/utils/storage';
import ThemeToggle from '@/components/ThemeToggle';
import AIModeBadge from '@/components/AIModeBadge';

interface Settings {
  theme: 'light' | 'dark';
  defaultAIMode: 'local' | 'cloud';
  enableSpeech: boolean;
  autoSummarize: boolean;
}

function Popup() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    defaultAIMode: 'local',
    enableSpeech: false,
    autoSummarize: false,
  });
  const [currentSummary, setCurrentSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAiMode] = useState<'local' | 'cloud'>('local');

  useEffect(() => {
    loadSettings();
    loadCurrentPageSummary();
  }, []);

  // Apply theme to the document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  async function loadSettings() {
    const loadedSettings = await StorageManager.getSettings();
    if (loadedSettings) {
      setSettings(loadedSettings as Settings);
      setAiMode(loadedSettings.defaultAIMode as 'local' | 'cloud');
    }
  }

  async function loadCurrentPageSummary() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url) {
      const summary = await StorageManager.getSummary(tab.url);
      if (summary) {
        setCurrentSummary(summary.summary);
        setAiMode(summary.mode);
      }
    }
  }

  async function handleSummarize(mode: 'local' | 'cloud') {
    setIsLoading(true);
    setAiMode(mode);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Execute script to get page content
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
          return {
            text: document.body.innerText.slice(0, 5000), // First 5000 chars
            selectedText: window.getSelection()?.toString() || '',
          };
        },
      });

      if (!result?.result) {
        throw new Error('Failed to extract page content');
      }

      const textToSummarize = result.result.selectedText || result.result.text;

      // Send to background for processing
      chrome.runtime.sendMessage(
        {
          type: mode === 'local' ? 'SUMMARIZE_LOCAL' : 'SUMMARIZE_CLOUD',
          data: {
            text: textToSummarize,
            url: tab.url,
          },
        },
        (response) => {
          if (response.success) {
            setCurrentSummary(response.summary);

            // Save to storage
            chrome.runtime.sendMessage({
              type: 'SAVE_SUMMARY',
              data: {
                url: tab.url,
                summary: response.summary,
                mode: mode,
              },
            });
          } else {
            console.error('Summarization failed:', response.error);
            setCurrentSummary(`Error: ${response.error}`);
          }
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setCurrentSummary('Failed to summarize content');
      setIsLoading(false);
    }
  }

  function handleSpeak() {
    if (!currentSummary || !settings.enableSpeech) return;

    chrome.tts.speak(currentSummary, {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
    });
  }

  function toggleTheme() {
    const newTheme: 'light' | 'dark' = settings.theme === 'light' ? 'dark' : 'light';
    const newSettings = { ...settings, theme: newTheme };
    setSettings(newSettings);
    StorageManager.setSettings(newSettings);
  }

  return (
    <div className="w-[400px] h-[600px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">ContextAware</h1>
          <AIModeBadge mode={aiMode} />
        </div>
        <ThemeToggle theme={settings.theme} onToggle={toggleTheme} />
      </div>

      {/* Main Content */}
      <div className="p-4 flex flex-col gap-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSummarize('local')}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && aiMode === 'local' ? (
              <>
                <span className="animate-spin">⚡</span>
                Processing...
              </>
            ) : (
              <>
                <span>⚡</span>
                Quick Summary
              </>
            )}
          </button>

          <button
            onClick={() => handleSummarize('cloud')}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && aiMode === 'cloud' ? (
              <>
                <span className="animate-spin">☁️</span>
                Analyzing...
              </>
            ) : (
              <>
                <span>☁️</span>
                Deep Analysis
              </>
            )}
          </button>
        </div>

        {/* Summary Display */}
        <div className="flex-1 min-h-[300px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-y-auto scrollbar-thin">
          {currentSummary ? (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentSummary}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
              <svg
                className="w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-center text-sm">
                No summary yet.<br />Click a button above to get started!
              </p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        {currentSummary && (
          <div className="flex gap-2">
            <button
              onClick={handleSpeak}
              disabled={!settings.enableSpeech}
              className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={settings.enableSpeech ? 'Read aloud' : 'Enable speech in settings'}
            >
              🔊 Speak
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(currentSummary)}
              className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              📋 Copy
            </button>
          </div>
        )}
      </div>

      {/* Footer / Settings Preview */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSpeech}
                onChange={(e) => {
                  const newSettings = { ...settings, enableSpeech: e.target.checked };
                  setSettings(newSettings);
                  StorageManager.setSettings(newSettings);
                }}
                className="rounded"
              />
              Speech
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSummarize}
                onChange={(e) => {
                  const newSettings = { ...settings, autoSummarize: e.target.checked };
                  setSettings(newSettings);
                  StorageManager.setSettings(newSettings);
                }}
                className="rounded"
              />
              Auto
            </label>
          </div>
          <span>v0.1.0</span>
        </div>
      </div>
    </div>
  );
}

export default Popup;
