export interface QuizResult {
  id: string;
  categoryId: string;
  categoryName: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
}

export interface DailyActivity {
  date: string;
  wordsLearned: number;
  quizzesTaken: number;
  correctAnswers: number;
  totalAnswers: number;
}

export interface UserProgress {
  learnedWords: Set<string>;
  masteredWords: Set<string>;
  categoryProgress: Record<string, {
    learned: number;
    total: number;
  }>;
  quizResults: QuizResult[];
  dailyActivity: DailyActivity[];
  studyStreak: number;
  lastStudyDate: string;
}

const STORAGE_KEY = 'vocabulary_progress';

export function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        learnedWords: new Set(parsed.learnedWords || []),
        masteredWords: new Set(parsed.masteredWords || []),
        categoryProgress: parsed.categoryProgress || {},
        quizResults: parsed.quizResults || [],
        dailyActivity: parsed.dailyActivity || [],
        studyStreak: parsed.studyStreak || 0,
        lastStudyDate: parsed.lastStudyDate || '',
      };
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }

  return {
    learnedWords: new Set(),
    masteredWords: new Set(),
    categoryProgress: {},
    quizResults: [],
    dailyActivity: [],
    studyStreak: 0,
    lastStudyDate: '',
  };
}

export function saveProgress(progress: UserProgress): void {
  try {
    const toStore = {
      learnedWords: Array.from(progress.learnedWords),
      masteredWords: Array.from(progress.masteredWords),
      categoryProgress: progress.categoryProgress,
      quizResults: progress.quizResults,
      dailyActivity: progress.dailyActivity,
      studyStreak: progress.studyStreak,
      lastStudyDate: progress.lastStudyDate,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

function addDailyActivity(
  progress: UserProgress,
  wordsLearned: number,
  quizzesTaken: number,
  correctAnswers: number,
  totalAnswers: number
): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  const activities = [...(progress.dailyActivity || [])];
  const todayIndex = activities.findIndex(a => a.date === today);

  if (todayIndex >= 0) {
    activities[todayIndex] = {
      ...activities[todayIndex],
      wordsLearned: activities[todayIndex].wordsLearned + wordsLearned,
      quizzesTaken: activities[todayIndex].quizzesTaken + quizzesTaken,
      correctAnswers: activities[todayIndex].correctAnswers + correctAnswers,
      totalAnswers: activities[todayIndex].totalAnswers + totalAnswers,
    };
  } else {
    activities.push({ date: today, wordsLearned, quizzesTaken, correctAnswers, totalAnswers });
  }

  const recent = activities.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  return { ...progress, dailyActivity: recent };
}

function refreshStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  if (progress.lastStudyDate === today) return progress;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = progress.lastStudyDate === yesterday ? (progress.studyStreak || 0) + 1 : 1;
  return { ...progress, studyStreak: newStreak, lastStudyDate: today };
}

export function markWordAsLearned(wordId: string, progress: UserProgress): UserProgress {
  const isNew = !progress.learnedWords.has(wordId);
  const newProgress = { ...progress, learnedWords: new Set(progress.learnedWords) };
  newProgress.learnedWords.add(wordId);
  const withActivity = isNew ? addDailyActivity(newProgress, 1, 0, 0, 0) : newProgress;
  const withStreak = refreshStreak(withActivity);
  saveProgress(withStreak);
  return withStreak;
}

export function markWordAsMastered(wordId: string, progress: UserProgress): UserProgress {
  const isNew = !progress.masteredWords.has(wordId);
  const newProgress = {
    ...progress,
    learnedWords: new Set(progress.learnedWords),
    masteredWords: new Set(progress.masteredWords),
  };
  newProgress.learnedWords.add(wordId);
  newProgress.masteredWords.add(wordId);
  const withActivity = isNew ? addDailyActivity(newProgress, 1, 0, 0, 0) : newProgress;
  const withStreak = refreshStreak(withActivity);
  saveProgress(withStreak);
  return withStreak;
}

export function saveQuizResult(
  progress: UserProgress,
  result: Omit<QuizResult, 'id' | 'date'>
): UserProgress {
  const newResult: QuizResult = {
    ...result,
    id: `quiz-${Date.now()}`,
    date: new Date().toISOString(),
  };
  const newProgress = { ...progress, quizResults: [newResult, ...progress.quizResults] };
  const withActivity = addDailyActivity(newProgress, 0, 1, result.score, result.total);
  const withStreak = refreshStreak(withActivity);
  saveProgress(withStreak);
  return withStreak;
}
