import { api } from "./api";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface Topic {
  id: number;
  name: string;
  description: string;
}

export interface VocabularyWordAPI {
  id: number;
  english_word: string;
  primary_meaning: string;
  part_of_speech: string;
  phonetic: string;
  difficulty_level: string;
  is_active: boolean;
  topics: Topic[];
  meanings: { id: number; meaning_vi: string; part_of_speech: string; display_order: number }[];
  examples: { id: number; sentence_en: string; sentence_vi: string }[];
}

export interface DashboardData {
  summary: {
    words_total: number;
    progress_total: number;
    due_words: number;
    accuracy: number;
    streak_count: number;
    daily_goal: number;
    favorite_words_count: number;
  };
  profile: {
    current_level: string;
    learning_goal: string;
    onboarding_completed: boolean;
    xp_total: number;
    streak_count: number;
    daily_goal: number;
  };
  today: { words_studied: number; words_mastered: number; xp_earned: number };
  progress_by_status: Record<string, number>;
  words_by_level: Record<string, number>;
  weekly_activity: { date: string; words_studied: number; xp_earned: number }[];
  weak_tags: { tag: string; accuracy: number; total: number }[];
  next_recommendation: {
    reason: string;
    lesson: {
      id: number;
      title: string;
      lesson_order: number;
      total_words: number;
      track: { name: string; target_level: string };
    } | null;
    learning_path: { current_level: string; goal: string } | null;
  };
  recent_sessions: {
    id: number;
    mode: string;
    total_questions: number;
    correct_answers: number;
    started_at: string;
    ended_at: string | null;
  }[];
}

export interface LearningTrack {
  id: number;
  name: string;
  slug: string;
  description: string;
  target_level: string;
  track_group: string;
  sort_order: number;
  is_active: boolean;
  lessons: LearningLesson[];
}

export interface LearningLesson {
  id: number;
  title: string;
  description: string;
  lesson_order: number;
  total_words: number;
  duration_minutes: number;
  is_active: boolean;
  track: { id: number; name: string; slug: string; target_level: string };
  user_progress?: {
    learned_words: number;
    mastered_words: number;
    is_completed: boolean;
  };
}

export interface StudySession {
  id: number;
  mode: string;
  total_questions: number;
  correct_answers: number;
  started_at: string;
  ended_at: string | null;
}

export interface StudyWord {
  id: number;
  english_word: string;
  primary_meaning: string;
  part_of_speech: string;
  phonetic: string;
  examples: { sentence_en: string; sentence_vi: string }[];
}

export interface UserLearningPath {
  id: number;
  current_level: string;
  goal: string;
  duration_weeks: number;
  is_active: boolean;
}

export interface ProgressOverview {
  status_counts: Record<string, number>;
  total_words: number;
  accuracy: number;
  streak_count: number;
  xp_total: number;
  weekly_activity: { date: string; words_studied: number; xp_earned: number }[];
  by_level: Record<string, { total: number; learned: number }>;
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ access: string; refresh: string }>("/auth/token/", { username: email, password }),

  register: (username: string, email: string, password: string) =>
    api.post("/auth/register/", { username, email, password }),

  me: () => api.get<{ id: number; username: string; email: string; is_staff: boolean }>("/auth/me/"),

  refresh: (refresh: string) =>
    api.post<{ access: string }>("/auth/token/refresh/", { refresh }),
};

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

export const dashboardService = {
  get: () => api.get<DashboardData>("/dashboard/"),
};

// ─────────────────────────────────────────────
// Vocabulary
// ─────────────────────────────────────────────

export const vocabularyService = {
  getTopics: () => api.get<Topic[]>("/topics/"),

  getWords: (params?: {
    search?: string;
    topic_id?: number;
    difficulty?: string;
    part_of_speech?: string;
    page?: number;
    page_size?: number;
  }) => api.get<{ results: VocabularyWordAPI[]; count: number; next: string | null; previous: string | null }>("/words/", { params }),

  getWord: (id: number) => api.get<VocabularyWordAPI>(`/words/${id}/`),
};

// ─────────────────────────────────────────────
// Favorites
// ─────────────────────────────────────────────

export const favoriteService = {
  getWords: (search?: string) =>
    api.get("/favorites/words/", { params: search ? { search } : {} }),

  addWord: (word_id: number) => api.post("/favorites/words/", { word_id }),

  removeWord: (word_id: number) => api.delete(`/favorites/words/${word_id}/`),
};

// ─────────────────────────────────────────────
// Study (Flashcard SRS)
// ─────────────────────────────────────────────

export const studyService = {
  start: (payload: { mode: string; limit?: number; lesson_id?: number }) =>
    api.post<{ session: StudySession; questions: StudyWord[] }>("/study/start/", payload),

  answer: (
    sessionId: number,
    payload: { word_id: number; is_correct: boolean; response_text?: string; response_time_ms?: number }
  ) => api.post(`/study/sessions/${sessionId}/answer/`, payload),

  history: () => api.get("/study/history/"),
};

// ─────────────────────────────────────────────
// Learning Tracks & Lessons
// ─────────────────────────────────────────────

export const learningService = {
  getTracks: (params?: { group?: string; level?: string }) =>
    api.get<LearningTrack[]>("/learning/tracks/", { params }),

  getTrack: (slug: string) => api.get<LearningTrack>(`/learning/tracks/${slug}/`),

  getLessons: () => api.get<LearningLesson[]>("/learning/lessons/"),

  getLesson: (id: number) => api.get(`/learning/lessons/${id}/`),

  getLearningPath: () => api.get<UserLearningPath>("/learning-path/me/"),

  setupLearningPath: (payload: {
    current_level: string;
    goal: string;
    duration_weeks?: number;
  }) => api.post<UserLearningPath>("/learning-path/setup/", payload),
};

// ─────────────────────────────────────────────
// Quiz
// ─────────────────────────────────────────────

export const quizService = {
  get: (quizId: number) => api.get(`/quizzes/${quizId}/`),

  submit: (
    quizId: number,
    answers: { question_id: number; answer_text?: string; choice_id?: number }[]
  ) => api.post(`/quizzes/${quizId}/submit/`, { answers }),
};

// ─────────────────────────────────────────────
// Progress
// ─────────────────────────────────────────────

export const progressService = {
  getOverview: () => api.get<ProgressOverview>("/progress/overview/"),
  getProfile: () => api.get("/profile/me/"),
};

// ─────────────────────────────────────────────
// Onboarding Placement
// ─────────────────────────────────────────────

export const onboardingService = {
  getQuestions: () => api.get("/onboarding/placement/"),
  submit: (answers: { word_id: number; selected_answer: string }[]) =>
    api.post("/onboarding/placement/", { answers }),
};
