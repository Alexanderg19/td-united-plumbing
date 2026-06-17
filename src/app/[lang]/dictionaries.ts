import 'server-only'

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((m) => m.default),
  es: () => import('@/dictionaries/es.json').then((m) => m.default),
}

export type Locale = keyof typeof dictionaries
export const locales = Object.keys(dictionaries) as Locale[]
export const hasLocale = (l: string): l is Locale => l in dictionaries
export const getDictionary = (locale: Locale) => dictionaries[locale]()

// Derive prop types from the English JSON so TypeScript catches missing keys
import type en from '@/dictionaries/en.json'
export type Dictionary = typeof en
export type TopBarDict = Dictionary['topBar']
export type NavDict = Dictionary['nav']
export type HeroDict = Dictionary['hero']
export type TrustDict = Dictionary['trust']
export type ServicesDict = Dictionary['services']
export type ServiceAreaDict = Dictionary['serviceArea']
export type CtaDict = Dictionary['cta']
export type FooterDict = Dictionary['footer']
export type FormDict = Dictionary['form']
export type FloatingWaDict = Dictionary['floatingWa']
export type PageHeroDict = Dictionary['pageHero']
export type ContactCardDict = Dictionary['contactCard']
export type InfoSidebarDict = Dictionary['infoSidebar']
