/**
 * Background Service Worker for ContextAware Extension
 *
 * This service worker handles:
 * - Extension lifecycle events
 * - Communication between content scripts and popup/sidebar
 * - Background AI processing coordination
 * - Storage management
 */

import { StorageManager } from '@/utils/storage';

// Initialize extension on installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('ContextAware installed:', details.reason);

  if (details.reason === 'install') {
    // Set default settings on first install
    StorageManager.setSettings({
      theme: 'light',
      defaultAIMode: 'local',
      enableSpeech: false,
      autoSummarize: false,
    });
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.type) {
    case 'SUMMARIZE_LOCAL':
      handleLocalSummarization(message.data, sendResponse);
      return true; // Indicates async response

    case 'SUMMARIZE_CLOUD':
      handleCloudSummarization(message.data, sendResponse);
      return true;

    case 'GET_CONTEXT':
      handleGetContext(message.data, sendResponse);
      return true;

    case 'SAVE_SUMMARY':
      handleSaveSummary(message.data, sendResponse);
      return true;

    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

/**
 * Handle local summarization using Chrome AI Summarization API (Gemini Nano)
 * TODO: Integrate Chrome AI Summarization API when available
 */
async function handleLocalSummarization(data: { text: string; url?: string }, sendResponse: (response: any) => void) {
  try {
    console.log('Starting local summarization for text length:', data.text.length);

    // TODO: Replace with actual Chrome AI Summarization API call
    // Example structure:
    // const summarizer = await chrome.ai.summarizer.create();
    // const summary = await summarizer.summarize(data.text);

    // Placeholder response
    const summary = `[Local AI Summary] This is a placeholder. Integrate Chrome AI Summarization API here.`;

    sendResponse({
      success: true,
      summary,
      mode: 'local',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Local summarization error:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Handle cloud-based summarization using Gemini 1.5 Pro (Chrome Cloud API)
 * TODO: Integrate Chrome Cloud AI API when available
 */
async function handleCloudSummarization(data: { text: string; url?: string; prompt?: string }, sendResponse: (response: any) => void) {
  try {
    console.log('Starting cloud summarization for text length:', data.text.length);

    // TODO: Replace with actual Chrome Cloud AI API call (Gemini 1.5 Pro)
    // Example structure:
    // const session = await chrome.ai.languageModel.create({
    //   systemPrompt: "You are an expert at analyzing and explaining web content."
    // });
    // const response = await session.prompt(data.prompt || `Summarize this: ${data.text}`);

    // Placeholder response
    const summary = `[Cloud AI Summary] This is a placeholder. Integrate Chrome Cloud AI API (Gemini 1.5 Pro) here.`;

    sendResponse({
      success: true,
      summary,
      mode: 'cloud',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Cloud summarization error:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Retrieve browsing context for the current session or domain
 */
async function handleGetContext(data: { domain?: string }, sendResponse: (response: any) => void) {
  try {
    const context = await StorageManager.getContext(data.domain);
    sendResponse({
      success: true,
      context,
    });
  } catch (error) {
    console.error('Get context error:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Save summary to storage
 */
async function handleSaveSummary(
  data: { url: string; summary: string; mode: 'local' | 'cloud' },
  sendResponse: (response: any) => void
) {
  try {
    await StorageManager.saveSummary(data.url, data.summary, data.mode);
    sendResponse({
      success: true,
    });
  } catch (error) {
    console.error('Save summary error:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Keep service worker alive (Manifest V3 requirement)
chrome.runtime.onStartup.addListener(() => {
  console.log('ContextAware service worker started');
});

export {};
