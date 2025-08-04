import { translations as arTranslations } from './ar';
import { translations as enTranslations } from './en';

export const translations = {
  ar: arTranslations,
  en: enTranslations
};

export type Language = 'ar' | 'en';
export type TranslationKey = keyof typeof arTranslations | keyof typeof enTranslations;
