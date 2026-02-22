import type { UserProfile, SessionResult } from '@/types'

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  check: (profile: UserProfile, latestResult?: SessionResult) => boolean
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_training',
    name: 'Первый урок',
    description: 'Пройти первую тренировку',
    icon: '📖',
    check: (p) => p.history.length >= 1,
  },
  {
    id: 'five_trainings',
    name: 'Прилежный ученик',
    description: 'Пройти 5 тренировок',
    icon: '📚',
    check: (p) => p.history.length >= 5,
  },
  {
    id: 'ten_trainings',
    name: 'Знаток магии',
    description: 'Пройти 10 тренировок',
    icon: '🎓',
    check: (p) => p.history.length >= 10,
  },
  {
    id: 'perfect_session',
    name: 'Безупречное заклинание',
    description: 'Ответить на все вопросы правильно',
    icon: '💎',
    check: (_, r) => !!r && r.correctAnswers === r.totalQuestions,
  },
  {
    id: 'streak_5',
    name: 'Серия из 5',
    description: '5 правильных ответов подряд',
    icon: '🔥',
    check: (p) => p.progress.bestStreak >= 5,
  },
  {
    id: 'streak_10',
    name: 'Непобедимая серия',
    description: '10 правильных ответов подряд',
    icon: '⚡',
    check: (p) => p.progress.bestStreak >= 10,
  },
  {
    id: 'streak_20',
    name: 'Великий маг',
    description: '20 правильных ответов подряд',
    icon: '🌟',
    check: (p) => p.progress.bestStreak >= 20,
  },
  {
    id: 'stars_50',
    name: '50 звёзд',
    description: 'Собрать 50 магических звёзд',
    icon: '⭐',
    check: (p) => p.progress.totalStars >= 50,
  },
  {
    id: 'stars_100',
    name: '100 звёзд',
    description: 'Собрать 100 магических звёзд',
    icon: '🌠',
    check: (p) => p.progress.totalStars >= 100,
  },
  {
    id: 'stars_500',
    name: 'Звёздный дождь',
    description: 'Собрать 500 магических звёзд',
    icon: '✨',
    check: (p) => p.progress.totalStars >= 500,
  },
  {
    id: 'multiplication_master',
    name: 'Мастер умножения',
    description: '5 тренировок умножения с точностью > 80%',
    icon: '✖️',
    check: (p) => {
      const multSessions = p.history.filter(
        (s) => s.config.operations.length === 1 && s.config.operations[0] === 'multiplication'
      )
      const goodSessions = multSessions.filter(
        (s) => s.correctAnswers / s.totalQuestions > 0.8
      )
      return goodSessions.length >= 5
    },
  },
  {
    id: 'division_master',
    name: 'Мастер деления',
    description: '5 тренировок деления с точностью > 80%',
    icon: '➗',
    check: (p) => {
      const divSessions = p.history.filter(
        (s) => s.config.operations.length === 1 && s.config.operations[0] === 'division'
      )
      const goodSessions = divSessions.filter(
        (s) => s.correctAnswers / s.totalQuestions > 0.8
      )
      return goodSessions.length >= 5
    },
  },
  {
    id: 'hard_mode',
    name: 'Смелый маг',
    description: 'Пройти тренировку на тяжёлом уровне',
    icon: '💪',
    check: (p) => p.history.some((s) => s.config.difficulty === 'hard' || s.config.difficulty === 'very_hard'),
  },
  {
    id: 'mixed_master',
    name: 'Универсал',
    description: 'Пройти смешанную тренировку (3+ операции)',
    icon: '🎯',
    check: (p) => p.history.some((s) => s.config.operations.length >= 3),
  },
]

export const LEVEL_NAMES = [
  'Маг-новичок',
  'Маг-ученик',
  'Маг-подмастерье',
  'Маг-мастер',
  'Старший маг',
  'Великий маг',
  'Архимаг',
  'Легенда магии',
]

export function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)]
}

export function getStarsForNextLevel(level: number): number {
  return level * 50
}

export function checkNewAchievements(
  profile: UserProfile,
  latestResult?: SessionResult
): string[] {
  const existingIds = new Set(profile.progress.achievements)
  const newAchievements: string[] = []

  for (const achievement of ACHIEVEMENTS) {
    if (!existingIds.has(achievement.id) && achievement.check(profile, latestResult)) {
      newAchievements.push(achievement.id)
    }
  }

  return newAchievements
}

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
