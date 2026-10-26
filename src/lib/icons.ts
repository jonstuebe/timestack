const CATEGORY_ICONS: Record<string, string> = {
  birthday: '🎂',
  invention: '💡',
  science: '🔬',
  space: '🚀',
  politics: '🏛️',
  war: '⚔️',
  culture: '🎭',
  sport: '🏅',
  business: '💼',
  exploration: '🧭',
  architecture: '🏗️',
  religion: '⛪',
  disaster: '🌋',
  crime: '🔪',
  nature: '🦣',
  food: '🍞',
  music: '🎵',
  film: '🎬',
  death: '🪦',
};

export function categoryIcon(category?: string): string | undefined {
  return category ? CATEGORY_ICONS[category] : undefined;
}
