/**
 * AI Service for ContextAware Extension
 *
 * This module provides a unified interface for interacting with Chrome's AI APIs:
 * - Summarizer API: Chrome AI Summarization API (Gemini Nano) for fast, on-device summarization
 * - Prompt API: Chrome AI Prompt API (Gemini Nano) for deeper reasoning and analysis
 *
 * Both APIs are available in Chrome 138+ stable.
 * Learn more: https://developer.chrome.com/docs/ai/built-in-apis
 */

import type { SummarizeRequest, SummarizeResponse } from '@/types';

export class AIService {
  /**
   * Check if local AI (Summarizer API with Gemini Nano) is available
   */
  static async isLocalAIAvailable(): Promise<boolean> {
    try {
      if (!('ai' in self) || !('summarizer' in (self as any).ai)) {
        console.warn('[AI Service] Summarizer API not available in this browser');
        return false;
      }

      const capabilities = await (self as any).ai.summarizer.capabilities();
      console.log('[AI Service] Summarizer capabilities:', capabilities);

      return capabilities.available !== 'no';
    } catch (error) {
      console.error('[AI Service] Error checking local AI availability:', error);
      return false;
    }
  }

  /**
   * Check if Prompt API (Gemini Nano) is available
   */
  static async isCloudAIAvailable(): Promise<boolean> {
    try {
      if (!('ai' in self) || !('languageModel' in (self as any).ai)) {
        console.warn('[AI Service] Prompt API not available in this browser');
        return false;
      }

      const capabilities = await (self as any).ai.languageModel.capabilities();
      console.log('[AI Service] Prompt API capabilities:', capabilities);

      return capabilities.available !== 'no';
    } catch (error) {
      console.error('[AI Service] Error checking Prompt API availability:', error);
      return false;
    }
  }

  /**
   * Summarize text using Summarizer API (Gemini Nano - on-device)
   */
  static async summarizeLocal(request: SummarizeRequest): Promise<SummarizeResponse> {
    try {
      console.log('[AI Service] Starting local summarization...', {
        textLength: request.text.length,
        url: request.url,
      });

      // Check if API is available
      const isAvailable = await this.isLocalAIAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Summarizer API is not available. Please enable it in chrome://flags',
        };
      }

      // Check capabilities and handle model download if needed
      const capabilities = await (self as any).ai.summarizer.capabilities();
      if (capabilities.available === 'after-download') {
        console.log('[AI Service] Model download required for Summarizer API');
        // You could show a UI notification here
      }

      // Create summarizer instance
      const summarizer = await (self as any).ai.summarizer.create({
        type: 'key-points',
        format: 'plain',
        length: 'medium',
      });

      console.log('[AI Service] Summarizer created, generating summary...');

      // Generate summary
      const summary = await summarizer.summarize(request.text);

      // Clean up
      summarizer.destroy();

      console.log('[AI Service] Local summarization completed');

      return {
        success: true,
        summary,
        mode: 'local',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('[AI Service] Local summarization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Analyze text using Prompt API (Gemini Nano - deeper analysis)
   */
  static async analyzeCloud(request: SummarizeRequest): Promise<SummarizeResponse> {
    try {
      console.log('[AI Service] Starting deep analysis...', {
        textLength: request.text.length,
        url: request.url,
        hasCustomPrompt: !!request.prompt,
      });

      // Check if API is available
      const isAvailable = await this.isCloudAIAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Prompt API is not available. Please enable it in chrome://flags',
        };
      }

      // Check capabilities and handle model download if needed
      const capabilities = await (self as any).ai.languageModel.capabilities();
      if (capabilities.available === 'after-download') {
        console.log('[AI Service] Model download required for Prompt API');
        // You could show a UI notification here
      }

      // Create language model session
      const session = await (self as any).ai.languageModel.create({
        systemPrompt:
          'You are an expert at analyzing and explaining web content. ' +
          'Provide clear, concise, and insightful analysis with key takeaways. ' +
          'Format your response in a readable way with bullet points where appropriate.',
      });

      console.log('[AI Service] Prompt API session created, analyzing...');

      // Create the prompt
      const prompt =
        request.prompt ||
        `Analyze the following web content and provide a comprehensive summary with key insights and main takeaways:\n\n${request.text.slice(0, 4000)}`;

      // Get analysis
      const analysis = await session.prompt(prompt);

      // Clean up
      session.destroy();

      console.log('[AI Service] Deep analysis completed');

      return {
        success: true,
        summary: analysis,
        mode: 'cloud',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('[AI Service] Deep analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Stream analysis from Prompt API (for real-time responses)
   */
  static async *streamAnalysis(request: SummarizeRequest): AsyncGenerator<string> {
    try {
      // Check if API is available
      const isAvailable = await this.isCloudAIAvailable();
      if (!isAvailable) {
        throw new Error('Prompt API is not available');
      }

      // Create language model session
      const session = await (self as any).ai.languageModel.create({
        systemPrompt: 'You are an expert at analyzing web content.',
      });

      const prompt =
        request.prompt || `Analyze this content:\n\n${request.text.slice(0, 4000)}`;

      console.log('[AI Service] Starting streaming analysis...');

      // Stream the response
      const stream = session.promptStreaming(prompt);

      for await (const chunk of stream) {
        yield chunk;
      }

      // Clean up
      session.destroy();

      console.log('[AI Service] Streaming completed');
    } catch (error) {
      console.error('[AI Service] Streaming error:', error);
      throw error;
    }
  }

  /**
   * Read summary aloud using Chrome TTS API
   */
  static async speak(text: string, options?: chrome.tts.SpeakOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.tts.speak(text, {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        ...options,
        onEvent: (event: chrome.tts.TtsEvent) => {
          if (event.type === 'end') {
            resolve();
          } else if (event.type === 'error') {
            reject(new Error('TTS error'));
          }
        },
      });
    });
  }

  /**
   * Stop any ongoing speech
   */
  static stopSpeaking(): void {
    chrome.tts.stop();
  }

}
