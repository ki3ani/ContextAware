import { useState, useEffect } from 'react';
import AIModeBadge from '@/components/AIModeBadge';

interface PageContext {
  url: string;
  title: string;
  selectedText: string;
}

function Sidebar() {
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAiMode] = useState<'local' | 'cloud'>('local');

  useEffect(() => {
    // Listen for messages from content script
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function handleMessage(event: MessageEvent) {
    const { type, data } = event.data;

    switch (type) {
      case 'PAGE_CONTEXT':
        setPageContext(data);
        break;

      case 'SUMMARIZE_RESPONSE':
        setIsLoading(false);
        if (data.success) {
          setSummary(data.summary);
          setAiMode(data.mode);
        } else {
          setSummary(`Error: ${data.error}`);
        }
        break;
    }
  }

  function handleSummarize(mode: 'local' | 'cloud') {
    if (!pageContext) return;

    setIsLoading(true);
    setAiMode(mode);

    const textToSummarize = pageContext.selectedText || 'Full page content';

    // Send message to content script
    window.parent.postMessage(
      {
        type: 'SUMMARIZE',
        data: {
          text: textToSummarize,
          mode: mode,
        },
      },
      '*'
    );
  }

  function handleClose() {
    window.parent.postMessage({ type: 'CLOSE_SIDEBAR' }, '*');
  }

  return (
    <div className="w-full h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">ContextAware</h2>
          <AIModeBadge mode={aiMode} />
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          title="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Page Info */}
      {pageContext && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-sm truncate">{pageContext.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{pageContext.url}</p>
          {pageContext.selectedText && (
            <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs">
              <strong>Selected:</strong> {pageContext.selectedText.slice(0, 100)}...
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 flex gap-2">
        <button
          onClick={() => handleSummarize('local')}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && aiMode === 'local' ? (
            <>
              <span className="animate-spin">⚡</span>
              Processing...
            </>
          ) : (
            <>
              <span>⚡</span>
              Local Summary
            </>
          )}
        </button>

        <button
          onClick={() => handleSummarize('cloud')}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
        {summary ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Summary</h4>
              <button
                onClick={() => navigator.clipboard.writeText(summary)}
                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
              >
                📋 Copy
              </button>
            </div>
            <div className="prose dark:prose-invert prose-sm max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <p className="text-center text-sm px-4">
              Select text on the page or click a button above to get an AI-powered summary
            </p>
          </div>
        )}
      </div>

      {/* Footer with tips */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>💡 Tip:</strong> Select text before clicking for focused summaries</p>
          <p><strong>⚡ Local:</strong> Fast, on-device processing (Gemini Nano)</p>
          <p><strong>☁️ Cloud:</strong> Deep reasoning (Gemini 1.5 Pro)</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
