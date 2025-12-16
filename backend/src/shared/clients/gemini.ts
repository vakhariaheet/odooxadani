/**
 * Google Gemini AI Client Wrapper
 * 
 * Type-safe wrapper around the new unified Google Gen AI SDK
 * with common operations for text generation, chat, and multimodal.
 * 
 * @see https://ai.google.dev/gemini-api/docs
 */

import { GoogleGenAI, Chat, Content, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { createLogger } from '../logger';

const logger = createLogger('GeminiClient');

// =============================================================================
// CLIENT INITIALIZATION
// =============================================================================

const createGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env['GEMINI_API_KEY'] || process.env['GOOGLE_AI_API_KEY'];
  
  if (!apiKey) {
    logger.warn('Gemini API key not configured (GEMINI_API_KEY or GOOGLE_AI_API_KEY)');
  }

  return new GoogleGenAI({ apiKey: apiKey || '' });
};

const genAI = createGeminiClient();

// =============================================================================
// TYPES
// =============================================================================

/**
 * Available Gemini Models (as of December 2024)
 * 
 * Gemini 2.5 Series (Latest - Recommended):
 * - gemini-2.5-flash: Latest flagship with thinking capabilities, 1M context
 * - gemini-2.5-flash-lite: Lightweight efficient version
 * 
 * Gemini 2.0 Series:
 * - gemini-2.0-flash: Second gen fast model, 1M context window
 * - gemini-2.0-flash-lite: Cost-optimized small model
 * 
 * Gemini 1.5 Series (Stable):
 * - gemini-1.5-flash: Fast and versatile
 * - gemini-1.5-flash-8b: Smaller, faster variant
 * - gemini-1.5-pro: Highest capability
 */
export type GeminiModel = 
  // Gemini 2.5 Series (Latest - Recommended)
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite'
  | 'gemini-2.5-flash-preview-05-20'
  // Gemini 2.0 Series
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-001'
  | 'gemini-2.0-flash-lite'
  | 'gemini-2.0-flash-lite-001'
  | 'gemini-2.0-flash-exp'
  // Gemini 1.5 Series (Stable)
  | 'gemini-1.5-flash'
  | 'gemini-1.5-flash-001'
  | 'gemini-1.5-flash-002'
  | 'gemini-1.5-flash-8b'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-pro-001'
  | 'gemini-1.5-pro-002';

export interface GenerationConfig {
  temperature?: number;       // 0.0 - 2.0, default 1.0
  topP?: number;              // 0.0 - 1.0
  topK?: number;              // 1 - 100
  maxOutputTokens?: number;   // Max tokens in response
  stopSequences?: string[];   // Stop generation at these sequences
  candidateCount?: number;    // Number of response candidates
  presencePenalty?: number;   // Presence penalty for diversity
  frequencyPenalty?: number;  // Frequency penalty for diversity
}

export type SafetyThreshold = 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH';

export interface SafetySettings {
  harassment?: SafetyThreshold;
  hateSpeech?: SafetyThreshold;
  sexuallyExplicit?: SafetyThreshold;
  dangerousContent?: SafetyThreshold;
}

export interface GenerateOptions {
  model?: GeminiModel;
  config?: GenerationConfig;
  safety?: SafetySettings;
  systemInstruction?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GenerateResult {
  text: string;
  finishReason?: string;
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface StreamChunk {
  text: string;
  isComplete: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const thresholdMap: Record<SafetyThreshold, HarmBlockThreshold> = {
  'BLOCK_NONE': HarmBlockThreshold.BLOCK_NONE,
  'BLOCK_LOW_AND_ABOVE': HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  'BLOCK_MEDIUM_AND_ABOVE': HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  'BLOCK_ONLY_HIGH': HarmBlockThreshold.BLOCK_ONLY_HIGH,
};

const buildSafetySettings = (safety?: SafetySettings) => {
  if (!safety) return undefined;
  
  const settings = [];
  
  if (safety.harassment) {
    settings.push({
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: thresholdMap[safety.harassment],
    });
  }
  if (safety.hateSpeech) {
    settings.push({
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: thresholdMap[safety.hateSpeech],
    });
  }
  if (safety.sexuallyExplicit) {
    settings.push({
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: thresholdMap[safety.sexuallyExplicit],
    });
  }
  if (safety.dangerousContent) {
    settings.push({
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: thresholdMap[safety.dangerousContent],
    });
  }
  
  return settings.length > 0 ? settings : undefined;
};

// =============================================================================
// GEMINI CLIENT CLASS
// =============================================================================

export class Gemini {
  private defaultModel: GeminiModel;
  private defaultConfig?: GenerationConfig;
  private defaultSafety?: SafetySettings;
  private systemInstruction?: string;

  constructor(options?: {
    model?: GeminiModel;
    config?: GenerationConfig;
    safety?: SafetySettings;
    systemInstruction?: string;
  }) {
    // Default to gemini-2.0-flash (recommended for most use cases)
    this.defaultModel = options?.model || 'gemini-2.0-flash';
    this.defaultConfig = options?.config;
    this.defaultSafety = options?.safety;
    this.systemInstruction = options?.systemInstruction;
  }

  /**
   * Build configuration object for API calls
   */
  private buildConfig(options?: GenerateOptions) {
    const config = options?.config || this.defaultConfig;
    const safety = options?.safety || this.defaultSafety;
    const systemInstruction = options?.systemInstruction || this.systemInstruction;

    return {
      ...(config && {
        temperature: config.temperature,
        topP: config.topP,
        topK: config.topK,
        maxOutputTokens: config.maxOutputTokens,
        stopSequences: config.stopSequences,
        candidateCount: config.candidateCount,
        presencePenalty: config.presencePenalty,
        frequencyPenalty: config.frequencyPenalty,
      }),
      safetySettings: buildSafetySettings(safety),
      systemInstruction,
    };
  }

  /**
   * Generate text from a prompt
   */
  async generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult> {
    const model = options?.model || this.defaultModel;
    const config = this.buildConfig(options);

    try {
      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const candidate = response.candidates?.[0];
      const text = response.text || '';

      logger.debug('Gemini generate success', { 
        model,
        promptLength: prompt.length,
        responseLength: text.length,
      });

      return {
        text,
        finishReason: candidate?.finishReason as string | undefined,
        safetyRatings: candidate?.safetyRatings?.map(r => ({
          category: r.category as string,
          probability: r.probability as string,
        })),
        usageMetadata: response.usageMetadata ? {
          promptTokenCount: response.usageMetadata.promptTokenCount || 0,
          candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
          totalTokenCount: response.usageMetadata.totalTokenCount || 0,
        } : undefined,
      };
    } catch (error) {
      logger.error('Gemini generate failed', error);
      throw error;
    }
  }

  /**
   * Generate text with streaming response
   */
  async *generateStream(prompt: string, options?: GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options?.model || this.defaultModel;
    const config = this.buildConfig(options);

    try {
      const response = await genAI.models.generateContentStream({
        model,
        contents: prompt,
        config,
      });

      for await (const chunk of response) {
        const text = chunk.text || '';
        yield {
          text,
          isComplete: false,
        };
      }

      yield {
        text: '',
        isComplete: true,
      };

      logger.debug('Gemini stream complete', { model });
    } catch (error) {
      logger.error('Gemini generateStream failed', error);
      throw error;
    }
  }

  /**
   * Generate text with image input (multimodal)
   */
  async generateWithImage(
    prompt: string,
    imageData: {
      data: string;  // Base64 encoded image data
      mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
    },
    options?: GenerateOptions
  ): Promise<GenerateResult> {
    const model = options?.model || this.defaultModel;
    const config = this.buildConfig(options);

    try {
      const response = await genAI.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: imageData.data,
                  mimeType: imageData.mimeType,
                },
              },
            ],
          },
        ],
        config,
      });

      const candidate = response.candidates?.[0];
      const text = response.text || '';

      logger.debug('Gemini generateWithImage success', { model });

      return {
        text,
        finishReason: candidate?.finishReason as string | undefined,
        safetyRatings: candidate?.safetyRatings?.map(r => ({
          category: r.category as string,
          probability: r.probability as string,
        })),
        usageMetadata: response.usageMetadata ? {
          promptTokenCount: response.usageMetadata.promptTokenCount || 0,
          candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
          totalTokenCount: response.usageMetadata.totalTokenCount || 0,
        } : undefined,
      };
    } catch (error) {
      logger.error('Gemini generateWithImage failed', error);
      throw error;
    }
  }

  /**
   * Start a chat session
   */
  startChat(history?: ChatMessage[], options?: GenerateOptions): GeminiChat {
    const model = options?.model || this.defaultModel;
    const config = this.buildConfig(options);

    const formattedHistory: Content[] | undefined = history?.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = genAI.chats.create({
      model,
      history: formattedHistory,
      config,
    });

    return new GeminiChat(chat);
  }

  /**
   * Count tokens in a text
   */
  async countTokens(text: string, options?: GenerateOptions): Promise<number> {
    const model = options?.model || this.defaultModel;

    try {
      const response = await genAI.models.countTokens({
        model,
        contents: text,
      });
      return response.totalTokens || 0;
    } catch (error) {
      logger.error('Gemini countTokens failed', error);
      throw error;
    }
  }

  /**
   * Generate JSON output (with structured output)
   */
  async generateJSON<T>(
    prompt: string,
    options?: GenerateOptions
  ): Promise<T> {
    const enhancedPrompt = `${prompt}\n\nRespond with valid JSON only. No markdown, no explanation, just the JSON object.`;
    
    const result = await this.generate(enhancedPrompt, options);
    
    try {
      // Clean up response - remove markdown code blocks if present
      let jsonText = result.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }
      
      return JSON.parse(jsonText.trim()) as T;
    } catch (error) {
      logger.error('Gemini generateJSON parse failed', error, { response: result.text });
      throw new Error(`Failed to parse Gemini response as JSON: ${result.text}`);
    }
  }

  /**
   * Generate with thinking mode (for complex reasoning - Gemini 2.5+)
   * 
   * Thinking mode is available on gemini-2.5-flash and newer models.
   * It enables step-by-step reasoning for complex problems.
   */
  async generateWithThinking(
    prompt: string,
    options?: GenerateOptions
  ): Promise<GenerateResult & { thinkingProcess?: string }> {
    // Use gemini-2.5-flash for thinking capabilities
    const model = options?.model || 'gemini-2.5-flash';
    
    const result = await this.generate(prompt, {
      ...options,
      model,
    });

    return result;
  }
}

// =============================================================================
// CHAT SESSION CLASS
// =============================================================================

export class GeminiChat {
  private chat: Chat;

  constructor(chat: Chat) {
    this.chat = chat;
  }

  /**
   * Send a message and get a response
   */
  async send(message: string): Promise<GenerateResult> {
    try {
      const response = await this.chat.sendMessage({ message });
      const candidate = response.candidates?.[0];
      const text = response.text || '';

      logger.debug('GeminiChat send success');

      return {
        text,
        finishReason: candidate?.finishReason as string | undefined,
        safetyRatings: candidate?.safetyRatings?.map(r => ({
          category: r.category as string,
          probability: r.probability as string,
        })),
        usageMetadata: response.usageMetadata ? {
          promptTokenCount: response.usageMetadata.promptTokenCount || 0,
          candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
          totalTokenCount: response.usageMetadata.totalTokenCount || 0,
        } : undefined,
      };
    } catch (error) {
      logger.error('GeminiChat send failed', error);
      throw error;
    }
  }

  /**
   * Send a message with streaming response
   */
  async *sendStream(message: string): AsyncGenerator<StreamChunk> {
    try {
      const response = await this.chat.sendMessageStream({ message });

      for await (const chunk of response) {
        const text = chunk.text || '';
        yield {
          text,
          isComplete: false,
        };
      }

      yield {
        text: '',
        isComplete: true,
      };

      logger.debug('GeminiChat stream complete');
    } catch (error) {
      logger.error('GeminiChat sendStream failed', error);
      throw error;
    }
  }

  /**
   * Get chat history
   */
  getHistory(): ChatMessage[] {
    const history = this.chat.getHistory();
    return (history || []).map((content: Content) => ({
      role: content.role as 'user' | 'model',
      content: (content.parts || []).map((p: { text?: string }) => (p.text || '')).join(''),
    }));
  }
}

// =============================================================================
// DEFAULT INSTANCE & FACTORY
// =============================================================================

// Default instance with gemini-2.0-flash model (recommended)
export const gemini = new Gemini();

/**
 * Create a Gemini instance with custom configuration
 * 
 * @example
 * ```typescript
 * // Use latest model with custom settings
 * const ai = createGemini({
 *   model: 'gemini-2.5-flash',
 *   config: { temperature: 0.7 },
 *   systemInstruction: 'You are a helpful assistant.',
 * });
 * 
 * const result = await ai.generate('Hello!');
 * ```
 */
export const createGemini = (options?: {
  model?: GeminiModel;
  config?: GenerationConfig;
  safety?: SafetySettings;
  systemInstruction?: string;
}): Gemini => {
  return new Gemini(options);
};

export default gemini;
