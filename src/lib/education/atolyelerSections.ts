export type CourseLevelBand = '17-12-kyu' | '11-6-kyu' | '5kyu-1dan';

export interface AtolyelerSection {
  id: string;
  title: string;
  subtitle: string;
  intro: string;
  levelBand: CourseLevelBand;
}

/** Web (Agora 3.1) src/data/workshopCatalog.js WORKSHOP_SECTIONS ile birebir. */
export const ATOLYELER_SECTIONS: AtolyelerSection[] = [
  {
    id: 'temel-taslar',
    title: 'Temel Taşlar',
    subtitle: '17 – 12 Kyu',
    intro: 'Taş yerleştirme, bağlantı ve basit şekiller üzerinden sağlam bir temel kurun.',
    levelBand: '17-12-kyu',
  },
  {
    id: 'gelisim',
    title: 'Gelişim',
    subtitle: '11 – 6 Kyu',
    intro: 'Orta oyun çatışmaları, taktik derinlik ve oyun yönü kararları.',
    levelBand: '11-6-kyu',
  },
  {
    id: 'aydinlanma',
    title: 'Aydınlanma',
    subtitle: '5 Kyu – 1 Dan',
    intro: 'İleri açılış, joseki varyasyonları ve yüksek seviye okuma.',
    levelBand: '5kyu-1dan',
  },
];

export function coursesInLevelBand<T extends { levelBand?: string }>(
  courses: T[],
  band: CourseLevelBand
): T[] {
  return courses.filter((c) => (c.levelBand ?? '17-12-kyu') === band);
}
