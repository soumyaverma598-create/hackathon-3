# Translation Guide - PARIVESH 3.0

This guide explains how to add language support (Hindi/English) to new pages and components in the application.

## Overview

The translation system is built with:
- **Zustand store** (`src/store/languageStore.ts`) - Manages current language globally
- **Translation dictionary** (`src/lib/translations.ts`) - Contains all English and Hindi translations
- **Language selector** (`src/components/LanguageSelector.tsx`) - Fixed UI element for language switching
- **Helper functions** - Type-safe functions to get translated text

## How to Add Translations to a New Page

### Step 1: Add translation keys to `src/lib/translations.ts`

Create a new section in the translations object for your page:

```typescript
export const translations = {
  en: {
    // ... existing sections
    myNewPage: {
      title: 'My Page Title',
      description: 'My page description',
      buttonText: 'Click Me',
    }
  },
  hi: {
    // ... existing sections
    myNewPage: {
      title: 'मेरा पेज शीर्षक',
      description: 'मेरा पृष्ठ विवरण',
      buttonText: 'मुझे क्लिक करें',
    }
  }
}
```

### Step 2: Export new getter function in `src/lib/translations.ts`

```typescript
export type MyNewPageTranslationKey = keyof typeof translations.en.myNewPage;

export const getMyNewPageText = (key: MyNewPageTranslationKey, lang: Language = 'en'): string => {
  return translations[lang].myNewPage[key] || translations.en.myNewPage[key];
};
```

### Step 3: Use in your component/page

```tsx
'use client';

import { useLanguageStore } from '@/store/languageStore';
import { getMyNewPageText } from '@/lib/translations';

export default function MyNewPage() {
  const { language } = useLanguageStore();

  return (
    <div>
      <h1>{getMyNewPageText('title', language)}</h1>
      <p>{getMyNewPageText('description', language)}</p>
      <button>{getMyNewPageText('buttonText', language)}</button>
    </div>
  );
}
```

## Available Translation Categories

1. **login** - Login page text
2. **common** - Shared UI elements (buttons, labels, etc.)
3. **roles** - User role names
4. **header** - Header component text
5. **dashboard** - Dashboard pages text

## Examples of Usage

### Example 1: Login Page
```tsx
import { getText } from '@/lib/translations';

<h1>{getText('title', language)}</h1>
```

### Example 2: Header Component
```tsx
import { getHeaderText } from '@/lib/translations';

<span>{getHeaderText('notifications', language)}</span>
```

### Example 3: Admin Dashboard
```tsx
import { getDashboardText } from '@/lib/translations';

<h2>{getDashboardText('adminDashboard', language)}</h2>
```

### Example 4: Common Elements
```tsx
import { getCommonText } from '@/lib/translations';

<button>{getCommonText('save', language)}</button>
```

## Language Selector

The language selector is automatically available on all pages:
- Located at top-left corner
- Allows switching between English (🇬🇧) and हिंदी (🇮🇳)
- Selection is persisted in localStorage
- Affects entire application

## Important Notes

1. **Always import from `@/store/languageStore`** to get the current language
2. **Use TypeScript** - The translation helper functions are type-safe
3. **Consistency** - Use existing translation keys when possible
4. **Fallback** - If translation is missing, defaults to English
5. **Global Availability** - Language selector is available on every page

## Best Practices

1. ✅ Group related translations together in the dictionary
2. ✅ Use descriptive key names
3. ✅ Keep translations concise
4. ✅ Use the same key names for identical text
5. ✅ Test both English and Hindi versions

## Test Your Translations

1. Use the language selector dropdown at top-left
2. Switch between English and Hindi
3. Verify all text changes correctly
4. Check that formatting is preserved

## Support for Additional Languages

To add a new language (e.g., Tamil):

1. Add new language object to `translations`:
```typescript
ta: {
  login: { ... },
  // ... all other sections
}
```

2. Update Language type:
```typescript
export type Language = 'en' | 'hi' | 'ta';
```

3. Update language selector to add new option

## Troubleshooting

**"Cannot find module" error?**
- Ensure you're importing from `@/lib/translations`
- Check TypeScript errors

**Language not changing?**
- Verify you're using `useLanguageStore()` to get current language
- Check that component is client-side (`'use client'`)

**Text not appearing?**
- Check translation key exists in both EN and HI
- Verify key name matches exactly

## Questions?

Refer to these files for examples:
- `src/app/login/page.tsx` - Login page translations
- `src/components/GovHeader.tsx` - Header translations
- `src/app/admin/dashboard/page.tsx` - Dashboard translations
