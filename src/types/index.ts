/**
 * Shared TypeScript types for ContextAware Extension
 */

export type AIMode = 'local' | 'cloud';

export type Theme = 'light' | 'dark';

export interface Message {
  type: string;
  data?: any;
}

export interface SummarizeRequest {
  text: string;
  url?: string;
  prompt?: string;
}

export interface SummarizeResponse {
  success: boolean;
  summary?: string;
  mode?: AIMode;
  timestamp?: number;
  error?: string;
}

export interface PageContext {
  url: string;
  title: string;
  selectedText?: string;
  fullText?: string;
}

/**
 * Chrome AI API Types (Placeholder)
 * TODO: Update these when Chrome AI APIs are finalized
 */

// Gemini Nano - Local Summarization API
export interface ChromeAISummarizer {
  summarize(text: string, options?: SummarizeOptions): Promise<string>;
  destroy(): void;
}

export interface SummarizeOptions {
  maxLength?: number;
  format?: 'plain' | 'markdown';
  type?: 'key-points' | 'paragraph' | 'headline';
}

// Gemini 1.5 Pro - Cloud Language Model API
export interface ChromeAILanguageModel {
  prompt(text: string): Promise<string>;
  streamPrompt(text: string): AsyncGenerator<string>;
  destroy(): void;
}

export interface LanguageModelOptions {
  systemPrompt?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Chrome AI API namespaces (Expected structure)
 */
declare global {
  interface Window {
    chrome: typeof chrome;
  }

  namespace chrome {
    namespace ai {
      // Summarization API (Gemini Nano)
      namespace summarizer {
        function create(options?: SummarizeOptions): Promise<ChromeAISummarizer>;
        function capabilities(): Promise<{
          available: 'no' | 'readily' | 'after-download';
          defaultMaxLength: number;
        }>;
      }

      // Language Model API (Gemini 1.5 Pro)
      namespace languageModel {
        function create(options?: LanguageModelOptions): Promise<ChromeAILanguageModel>;
        function capabilities(): Promise<{
          available: 'no' | 'readily' | 'after-download';
          defaultTemperature: number;
          defaultMaxOutputTokens: number;
        }>;
      }
    }
  }
}

export {};
