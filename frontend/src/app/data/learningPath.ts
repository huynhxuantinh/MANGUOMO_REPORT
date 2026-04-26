export interface PathLesson {
  id: string;
  title: string;
  titleVi: string;
  type: "vocabulary" | "grammar" | "reading" | "quiz";
  level: number; // 1-5 difficulty
  categoryId?: string; // for vocabulary/quiz
  grammarId?: string; // for grammar
  duration: number; // in minutes
  xp: number; // experience points
  description: string;
  unlockAfter?: string[]; // lesson ids that must be completed first
}

export interface PathUnit {
  id: string;
  title: string;
  titleVi: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  levelName: string;
  color: string;
  icon: string;
  description: string;
  lessons: PathLesson[];
}

export const learningPath: PathUnit[] = [
  {
    id: "unit-1",
    title: "Absolute Beginner",
    titleVi: "Hoàn toàn mới bắt đầu",
    level: "A1",
    levelName: "Sơ cấp A1",
    color: "green",
    icon: "🌱",
    description: "Bắt đầu hành trình với những từ vựng và ngữ pháp cơ bản nhất",
    lessons: [
      {
        id: "l1-1",
        title: "Food & Dining Vocabulary",
        titleVi: "Từ vựng Ẩm thực",
        type: "vocabulary",
        level: 1,
        categoryId: "food",
        duration: 10,
        xp: 50,
        description: "Học các từ về ẩm thực và nhà hàng",
      },
      {
        id: "l1-2",
        title: "Present Simple Tense",
        titleVi: "Thì hiện tại đơn",
        type: "grammar",
        level: 1,
        grammarId: "present-simple",
        duration: 15,
        xp: 80,
        description: "Học cách dùng thì hiện tại đơn",
        unlockAfter: ["l1-1"],
      },
      {
        id: "l1-3",
        title: "Articles: A, An, The",
        titleVi: "Mạo từ A, An, The",
        type: "grammar",
        level: 1,
        grammarId: "articles",
        duration: 12,
        xp: 70,
        description: "Hiểu cách dùng mạo từ",
        unlockAfter: ["l1-1"],
      },
      {
        id: "l1-4",
        title: "Health Vocabulary",
        titleVi: "Từ vựng Y tế",
        type: "vocabulary",
        level: 1,
        categoryId: "health",
        duration: 10,
        xp: 50,
        description: "Các từ về sức khỏe và y tế",
        unlockAfter: ["l1-2"],
      },
      {
        id: "l1-5",
        title: "Unit 1 Quiz",
        titleVi: "Kiểm tra Unit 1",
        type: "quiz",
        level: 1,
        categoryId: "food",
        duration: 8,
        xp: 100,
        description: "Kiểm tra kiến thức đã học trong Unit 1",
        unlockAfter: ["l1-3", "l1-4"],
      },
    ],
  },
  {
    id: "unit-2",
    title: "Elementary Level",
    titleVi: "Trình độ sơ cấp",
    level: "A2",
    levelName: "Sơ cấp A2",
    color: "blue",
    icon: "📘",
    description: "Mở rộng vốn từ vựng và học các cấu trúc ngữ pháp phổ biến",
    lessons: [
      {
        id: "l2-1",
        title: "Travel Vocabulary",
        titleVi: "Từ vựng Du lịch",
        type: "vocabulary",
        level: 2,
        categoryId: "travel",
        duration: 12,
        xp: 60,
        description: "Từ vựng cần thiết khi đi du lịch",
        unlockAfter: ["l1-5"],
      },
      {
        id: "l2-2",
        title: "Present Continuous",
        titleVi: "Thì hiện tại tiếp diễn",
        type: "grammar",
        level: 2,
        grammarId: "present-continuous",
        duration: 15,
        xp: 90,
        description: "Diễn tả hành động đang xảy ra",
        unlockAfter: ["l2-1"],
      },
      {
        id: "l2-3",
        title: "Education Vocabulary",
        titleVi: "Từ vựng Giáo dục",
        type: "vocabulary",
        level: 2,
        categoryId: "education",
        duration: 10,
        xp: 60,
        description: "Từ vựng trong môi trường học tập",
        unlockAfter: ["l2-1"],
      },
      {
        id: "l2-4",
        title: "Modal Verbs Basics",
        titleVi: "Động từ khuyết thiếu cơ bản",
        type: "grammar",
        level: 2,
        grammarId: "modal-verbs",
        duration: 18,
        xp: 100,
        description: "Học can, could, should, must",
        unlockAfter: ["l2-2"],
      },
      {
        id: "l2-5",
        title: "Unit 2 Quiz",
        titleVi: "Kiểm tra Unit 2",
        type: "quiz",
        level: 2,
        categoryId: "travel",
        duration: 10,
        xp: 120,
        description: "Kiểm tra toàn bộ Unit 2",
        unlockAfter: ["l2-3", "l2-4"],
      },
    ],
  },
  {
    id: "unit-3",
    title: "Intermediate Level",
    titleVi: "Trình độ trung cấp",
    level: "B1",
    levelName: "Trung cấp B1",
    color: "purple",
    icon: "🎓",
    description: "Nâng cao kỹ năng với ngữ pháp phức tạp hơn và từ vựng chuyên môn",
    lessons: [
      {
        id: "l3-1",
        title: "Business Vocabulary",
        titleVi: "Từ vựng Kinh doanh",
        type: "vocabulary",
        level: 3,
        categoryId: "business",
        duration: 15,
        xp: 80,
        description: "Từ vựng trong môi trường công việc",
        unlockAfter: ["l2-5"],
      },
      {
        id: "l3-2",
        title: "Past Simple Tense",
        titleVi: "Thì quá khứ đơn",
        type: "grammar",
        level: 3,
        grammarId: "past-simple",
        duration: 18,
        xp: 100,
        description: "Kể chuyện trong quá khứ",
        unlockAfter: ["l3-1"],
      },
      {
        id: "l3-3",
        title: "Present Perfect",
        titleVi: "Thì hiện tại hoàn thành",
        type: "grammar",
        level: 3,
        grammarId: "present-perfect",
        duration: 20,
        xp: 110,
        description: "Kết nối quá khứ với hiện tại",
        unlockAfter: ["l3-2"],
      },
      {
        id: "l3-4",
        title: "Technology Vocabulary",
        titleVi: "Từ vựng Công nghệ",
        type: "vocabulary",
        level: 3,
        categoryId: "technology",
        duration: 12,
        xp: 80,
        description: "Từ vựng về công nghệ hiện đại",
        unlockAfter: ["l3-1"],
      },
      {
        id: "l3-5",
        title: "Unit 3 Quiz",
        titleVi: "Kiểm tra Unit 3",
        type: "quiz",
        level: 3,
        categoryId: "business",
        duration: 12,
        xp: 150,
        description: "Kiểm tra toàn bộ Unit 3",
        unlockAfter: ["l3-3", "l3-4"],
      },
    ],
  },
  {
    id: "unit-4",
    title: "Upper-Intermediate",
    titleVi: "Trung-cao cấp",
    level: "B2",
    levelName: "Trung-cao cấp B2",
    color: "orange",
    icon: "🏆",
    description: "Làm chủ ngữ pháp nâng cao và các chủ đề học thuật",
    lessons: [
      {
        id: "l4-1",
        title: "Passive Voice",
        titleVi: "Câu bị động",
        type: "grammar",
        level: 4,
        grammarId: "passive-voice",
        duration: 20,
        xp: 120,
        description: "Cấu trúc câu bị động trong các thì",
        unlockAfter: ["l3-5"],
      },
      {
        id: "l4-2",
        title: "Conditional Sentences",
        titleVi: "Câu điều kiện",
        type: "grammar",
        level: 4,
        grammarId: "conditionals",
        duration: 25,
        xp: 140,
        description: "Ba loại câu điều kiện",
        unlockAfter: ["l4-1"],
      },
      {
        id: "l4-3",
        title: "Advanced Business English",
        titleVi: "Tiếng Anh kinh doanh nâng cao",
        type: "vocabulary",
        level: 4,
        categoryId: "business",
        duration: 15,
        xp: 100,
        description: "Từ vựng kinh doanh chuyên sâu",
        unlockAfter: ["l4-1"],
      },
      {
        id: "l4-4",
        title: "Unit 4 Final Quiz",
        titleVi: "Kiểm tra cuối Unit 4",
        type: "quiz",
        level: 4,
        categoryId: "technology",
        duration: 15,
        xp: 200,
        description: "Bài kiểm tra tổng hợp trình độ B2",
        unlockAfter: ["l4-2", "l4-3"],
      },
    ],
  },
];

export function getCompletedLessons(): Set<string> {
  try {
    const stored = localStorage.getItem("elh_completed_lessons");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function markLessonComplete(lessonId: string): void {
  const completed = getCompletedLessons();
  completed.add(lessonId);
  localStorage.setItem("elh_completed_lessons", JSON.stringify(Array.from(completed)));
}

export function isLessonUnlocked(lesson: PathLesson, completedLessons: Set<string>): boolean {
  if (!lesson.unlockAfter || lesson.unlockAfter.length === 0) return true;
  return lesson.unlockAfter.every(id => completedLessons.has(id));
}

export function getTotalXP(): number {
  try {
    const stored = localStorage.getItem("elh_total_xp");
    return stored ? parseInt(stored) : 0;
  } catch {
    return 0;
  }
}

export function addXP(amount: number): number {
  const current = getTotalXP();
  const newTotal = current + amount;
  localStorage.setItem("elh_total_xp", String(newTotal));
  return newTotal;
}
