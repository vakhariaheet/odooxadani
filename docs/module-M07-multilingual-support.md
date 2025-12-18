# Module M07: Multilingual Support & Translation

## Overview

**Estimated Time:** 1 hour  
**Complexity:** Medium  
**Type:** Full-stack  
**Risk Level:** Medium (AI translation accuracy)  
**Dependencies:** F02 (Content Library - translates content metadata)

## Problem Context

Students and teachers speak different regional languages. UI must support English, Hindi, and at least 3 regional languages (Marathi, Tamil, Bengali). Dynamic content (class descriptions, content titles) needs translation via Gemini AI.

## Technical Requirements

### Backend Tasks

- [ ] **Handler: translate.ts** - POST /api/translate
  - Body: `{ text, fromLang, toLang }`
  - Use Gemini AI for translation
  - Import: `gemini` from `shared/clients/gemini`
  - Cache translations in DynamoDB to reduce API calls
  - **CRITICAL:** Use gemini wrapper, never import Google AI SDK directly

- [ ] **Handler: getSupportedLanguages.ts** - GET /api/languages
  - Return list of supported languages with metadata
  - Response: `[{ code: 'en', name: 'English', nativeName: 'English' }]`

- [ ] **Service Layer: TranslationService.ts**
  - `translateText(text, fromLang, toLang)` - Call Gemini AI
  - `getCachedTranslation(text, toLang)` - Check DynamoDB cache
  - `cacheTranslation(text, translatedText, toLang)` - Store in DB

- [ ] **Types:**

  ```typescript
  export interface TranslationRequest {
    text: string;
    fromLang: string; // 'en', 'hi', 'mr', 'ta', 'bn'
    toLang: string;
  }

  export interface Language {
    code: string; // ISO 639-1
    name: string; // English name
    nativeName: string; // Native name
    rtl: boolean; // Right-to-left
  }
  ```

### Frontend Tasks

- [ ] **Setup i18next:**
  - Install `i18next`, `react-i18next`
  - Create translation files: `locales/en.json`, `locales/hi.json`, etc.
  - Configure language detector (browser language fallback)

- [ ] **Component: LanguageSelector.tsx** - Dropdown to change language
  - shadcn/ui Select component
  - List of supported languages
  - Changes i18next language on selection
  - Persists preference in localStorage

- [ ] **Translation Files:** `client/src/locales/`
  - `en.json` - English strings
  - `hi.json` - Hindi strings
  - `mr.json` - Marathi strings
  - `ta.json` - Tamil strings
  - `bn.json` - Bengali strings
  - Structure:
    ```json
    {
      "common": {
        "login": "Login",
        "logout": "Logout",
        "submit": "Submit"
      },
      "dashboard": {
        "welcome": "Welcome",
        "myClasses": "My Classes"
      }
    }
    ```

- [ ] **Hook: useTranslation** (from i18next)
  - Use in components: `const { t } = useTranslation();`
  - Usage: `<h1>{t('dashboard.welcome')}</h1>`

- [ ] **Dynamic Content Translation:**
  - Fetch translation from API for user-generated content
  - Cache translated content in React Query
  - Fallback to original language if translation fails

### External Services

### Gemini AI (Google)

- **Purpose:** Translate dynamic content (class titles, descriptions)
- **Setup:**
  1. Get API key from Google AI Studio (free tier)
  2. Add `GEMINI_API_KEY` to .env
  3. Use existing gemini client wrapper
- **Code Pattern:**

  ```typescript
  import { gemini } from '../../../shared/clients/gemini';

  const translatedText = await gemini.generateText({
    prompt: `Translate the following from ${fromLang} to ${toLang}: "${text}"`,
    model: 'gemini-1.5-flash',
  });
  ```

### Database Schema

```
# Translation Cache
PK: TRANSLATION#<sourceText_hash>
SK: LANG#<toLang>
sourceText: string
translatedText: string
fromLang: string
toLang: string
translatedAt: string
TTL: timestamp + 2592000 (30 days)
```

## Implementation Guide

### Step 1: Backend Translation API

1. Implement translation handler with Gemini AI
2. Add caching layer in DynamoDB
3. Test translation accuracy with sample texts

### Step 2: Frontend i18next Setup

1. Install i18next packages
2. Create translation JSON files for 5 languages
3. Configure i18n with language detector
4. Wrap App component with I18nextProvider
5. Add LanguageSelector to app header

### Step 3: Translate UI Components

1. Replace hardcoded strings with `t()` function calls
2. Test language switching works
3. Verify RTL layout for future Arabic support

## Acceptance Criteria

- [ ] UI supports English, Hindi, Marathi, Tamil, Bengali
- [ ] Language selector in app header changes language
- [ ] Language preference persists across sessions
- [ ] Dynamic content (class titles) translates via AI
- [ ] Translation results cached to reduce API calls
- [ ] Graceful fallback to English if translation fails
- [ ] Demo Ready: Switch language → UI updates in real-time

## Testing Checklist

- [ ] Test translation API with different language pairs
- [ ] Verify cache retrieval faster than AI call
- [ ] Test i18next language switching
- [ ] Check all static text translated
- [ ] Test on mobile browser

## Troubleshooting

1. **Translation API fails**
   - Check Gemini API key valid
   - Verify API quota not exceeded
   - Fallback to cached or original text

2. **Language not switching**
   - Check i18next configuration
   - Verify translation files loaded
   - Check language code matches (en, hi, not en-US)

## Related Modules

- **Depends On:** F02 (translates content metadata)
- **Enhances:** All modules (provides multilingual UI)
