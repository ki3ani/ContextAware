/**
 * Content Script for ContextAware Extension
 *
 * This script:
 * - Injects a floating action button on web pages
 * - Handles text selection for summarization
 * - Opens the sidebar for AI interactions
 * - Communicates with the background service worker
 */

import './content.css';

let sidebar: HTMLIFrameElement | null = null;
let floatingButton: HTMLButtonElement | null = null;
let isSidebarOpen = false;

/**
 * Initialize the content script
 */
function init() {
  createFloatingButton();
  setupTextSelectionListener();

  // Listen for messages from background or sidebar
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'TOGGLE_SIDEBAR') {
      toggleSidebar();
    }
    sendResponse({ success: true });
  });
}

/**
 * Create the floating action button
 */
function createFloatingButton() {
  // Check if button already exists
  if (document.getElementById('contextaware-fab')) {
    return;
  }

  floatingButton = document.createElement('button');
  floatingButton.id = 'contextaware-fab';
  floatingButton.className = 'contextaware-fab';
  floatingButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  floatingButton.title = 'Open ContextAware';

  floatingButton.addEventListener('click', () => {
    toggleSidebar();
  });

  document.body.appendChild(floatingButton);
}

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
  if (isSidebarOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

/**
 * Open the sidebar
 */
function openSidebar() {
  if (!sidebar) {
    createSidebar();
  }

  if (sidebar) {
    sidebar.style.transform = 'translateX(0)';
    isSidebarOpen = true;

    // Update button state
    if (floatingButton) {
      floatingButton.classList.add('active');
    }

    // Get current page context
    const pageContext = {
      url: window.location.href,
      title: document.title,
      selectedText: window.getSelection()?.toString() || '',
    };

    // Send context to sidebar
    sidebar.contentWindow?.postMessage(
      {
        type: 'PAGE_CONTEXT',
        data: pageContext,
      },
      '*'
    );
  }
}

/**
 * Close the sidebar
 */
function closeSidebar() {
  if (sidebar) {
    sidebar.style.transform = 'translateX(100%)';
    isSidebarOpen = false;

    if (floatingButton) {
      floatingButton.classList.remove('active');
    }
  }
}

/**
 * Create the sidebar iframe
 */
function createSidebar() {
  // Check if sidebar already exists
  if (document.getElementById('contextaware-sidebar')) {
    return;
  }

  sidebar = document.createElement('iframe');
  sidebar.id = 'contextaware-sidebar';
  sidebar.className = 'contextaware-sidebar';
  sidebar.src = chrome.runtime.getURL('src/sidebar/index.html');

  document.body.appendChild(sidebar);

  // Listen for messages from sidebar
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CLOSE_SIDEBAR') {
      closeSidebar();
    } else if (event.data.type === 'SUMMARIZE') {
      handleSummarize(event.data.data);
    }
  });
}

/**
 * Setup text selection listener for quick summarization
 */
function setupTextSelectionListener() {
  document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection()?.toString().trim();

    if (selectedText && selectedText.length > 50) {
      // Show a mini tooltip or update the FAB to indicate selection is ready
      if (floatingButton) {
        floatingButton.classList.add('has-selection');
        floatingButton.title = 'Summarize selected text';
      }
    } else {
      if (floatingButton) {
        floatingButton.classList.remove('has-selection');
        floatingButton.title = 'Open ContextAware';
      }
    }
  });
}

/**
 * Handle summarization request
 */
async function handleSummarize(data: { text: string; mode: 'local' | 'cloud' }) {
  try {
    const messageType = data.mode === 'local' ? 'SUMMARIZE_LOCAL' : 'SUMMARIZE_CLOUD';

    chrome.runtime.sendMessage(
      {
        type: messageType,
        data: {
          text: data.text,
          url: window.location.href,
        },
      },
      (response) => {
        // Send response back to sidebar
        sidebar?.contentWindow?.postMessage(
          {
            type: 'SUMMARIZE_RESPONSE',
            data: response,
          },
          '*'
        );
      }
    );
  } catch (error) {
    console.error('Summarization error:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
