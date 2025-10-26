/**
 * Storage Manager for ContextAware Extension
 *
 * Provides a clean interface to Chrome Storage API for managing:
 * - User settings and preferences
 * - Page summaries and context
 * - Recent browsing history context
 */

export interface Settings {
  theme: 'light' | 'dark';
  defaultAIMode: 'local' | 'cloud';
  enableSpeech: boolean;
  autoSummarize: boolean;
}

export interface Summary {
  url: string;
  summary: string;
  mode: 'local' | 'cloud';
  timestamp: number;
}

export interface BrowsingContext {
  domain: string;
  visits: number;
  lastVisit: number;
  summaries: Summary[];
}

const STORAGE_KEYS = {
  SETTINGS: 'contextaware_settings',
  SUMMARIES: 'contextaware_summaries',
  CONTEXT: 'contextaware_context',
} as const;

export class StorageManager {
  /**
   * Get user settings
   */
  static async getSettings(): Promise<Settings | null> {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
      return result[STORAGE_KEYS.SETTINGS] || null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }

  /**
   * Save user settings
   */
  static async setSettings(settings: Partial<Settings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: newSettings });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  /**
   * Get summary for a specific URL
   */
  static async getSummary(url: string): Promise<Summary | null> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SUMMARIES);
      const summaries: Record<string, Summary> = result[STORAGE_KEYS.SUMMARIES] || {};
      return summaries[url] || null;
    } catch (error) {
      console.error('Error getting summary:', error);
      return null;
    }
  }

  /**
   * Save summary for a URL
   */
  static async saveSummary(url: string, summary: string, mode: 'local' | 'cloud'): Promise<void> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SUMMARIES);
      const summaries: Record<string, Summary> = result[STORAGE_KEYS.SUMMARIES] || {};

      summaries[url] = {
        url,
        summary,
        mode,
        timestamp: Date.now(),
      };

      // Keep only last 100 summaries
      const entries = Object.entries(summaries);
      if (entries.length > 100) {
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        const trimmedSummaries = Object.fromEntries(entries.slice(0, 100));
        await chrome.storage.local.set({ [STORAGE_KEYS.SUMMARIES]: trimmedSummaries });
      } else {
        await chrome.storage.local.set({ [STORAGE_KEYS.SUMMARIES]: summaries });
      }
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  }

  /**
   * Get all summaries
   */
  static async getAllSummaries(): Promise<Summary[]> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SUMMARIES);
      const summaries: Record<string, Summary> = result[STORAGE_KEYS.SUMMARIES] || {};
      return Object.values(summaries).sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting all summaries:', error);
      return [];
    }
  }

  /**
   * Get browsing context for a domain
   */
  static async getContext(domain?: string): Promise<BrowsingContext[]> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.CONTEXT);
      const contexts: Record<string, BrowsingContext> = result[STORAGE_KEYS.CONTEXT] || {};

      if (domain) {
        return contexts[domain] ? [contexts[domain]] : [];
      }

      return Object.values(contexts).sort((a, b) => b.lastVisit - a.lastVisit);
    } catch (error) {
      console.error('Error getting context:', error);
      return [];
    }
  }

  /**
   * Update browsing context for a domain
   */
  static async updateContext(domain: string, summary?: Summary): Promise<void> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.CONTEXT);
      const contexts: Record<string, BrowsingContext> = result[STORAGE_KEYS.CONTEXT] || {};

      if (!contexts[domain]) {
        contexts[domain] = {
          domain,
          visits: 0,
          lastVisit: Date.now(),
          summaries: [],
        };
      }

      contexts[domain].visits += 1;
      contexts[domain].lastVisit = Date.now();

      if (summary) {
        contexts[domain].summaries.push(summary);
        // Keep only last 10 summaries per domain
        if (contexts[domain].summaries.length > 10) {
          contexts[domain].summaries = contexts[domain].summaries.slice(-10);
        }
      }

      await chrome.storage.local.set({ [STORAGE_KEYS.CONTEXT]: contexts });
    } catch (error) {
      console.error('Error updating context:', error);
    }
  }

  /**
   * Clear all data (useful for testing or reset)
   */
  static async clearAll(): Promise<void> {
    try {
      await chrome.storage.local.clear();
      await chrome.storage.sync.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
