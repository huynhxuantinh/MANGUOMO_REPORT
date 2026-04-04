from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.functions import Lower
from django.utils import timezone


class DifficultyLevel(models.TextChoices):
    A1 = "A1", "A1 - Beginner"
    A2 = "A2", "A2 - Elementary"
    B1 = "B1", "B1 - Intermediate"
    B2 = "B2", "B2 - Upper Intermediate"
    C1 = "C1", "C1 - Advanced"
    C2 = "C2", "C2 - Proficient"


class TrackGroup(models.TextChoices):
    VOCABULARY = "vocabulary", "Vocabulary"
    GRAMMAR = "grammar", "Grammar"
    SKILLS = "skills", "Skills"
    EXAM = "exam", "Exam"


class LearningStatus(models.TextChoices):
    NEW = "new", "New"
    LEARNING = "learning", "Learning"
    REVIEW = "review", "Review"
    MASTERED = "mastered", "Mastered"


class SessionMode(models.TextChoices):
    FLASHCARD = "flashcard", "Flashcard"
    TYPING = "typing", "Typing"
    MULTIPLE_CHOICE = "mcq", "Multiple Choice"
    LISTENING = "listening", "Listening"


class PartOfSpeech(models.TextChoices):
    NOUN = "noun", "Noun"
    VERB = "verb", "Verb"
    ADJECTIVE = "adjective", "Adjective"
    ADVERB = "adverb", "Adverb"
    PREPOSITION = "preposition", "Preposition"
    CONJUNCTION = "conjunction", "Conjunction"
    PRONOUN = "pronoun", "Pronoun"
    INTERJECTION = "interjection", "Interjection"
    PHRASE = "phrase", "Phrase / Idiom"
    OTHER = "other", "Other"


class LearningGoal(models.TextChoices):
    COMMUNICATION = "communication", "Giao tiep"
    EXAM = "exam", "Luyen thi"
    WORK = "work", "Cong viec"
    FOUNDATION = "foundation", "Mat goc"


class QuizQuestionType(models.TextChoices):
    MULTIPLE_CHOICE = "mcq", "Multiple Choice"
    FILL_BLANK = "fill_blank", "Fill in blank"
    MATCHING = "matching", "Matching"
    READING = "reading", "Reading comprehension"
    WRITING = "writing", "Writing"


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    avatar_url = models.URLField(blank=True)
    daily_goal = models.PositiveSmallIntegerField(
        default=10,
        validators=[MinValueValidator(1), MaxValueValidator(200)],
        help_text="Target words per day",
    )
    current_level = models.CharField(
        max_length=2,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.A1,
    )
    learning_goal = models.CharField(
        max_length=20,
        choices=LearningGoal.choices,
        default=LearningGoal.FOUNDATION,
    )
    onboarding_completed = models.BooleanField(default=False)
    streak_count = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "user_profile"

    def __str__(self):
        return f"profile:{self.user_id}"


class Topic(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)
    icon_emoji = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        db_table = "topic"

    def __str__(self):
        return self.name


class VocabularyWord(models.Model):
    english_word = models.CharField(max_length=255, db_index=True)
    primary_meaning = models.CharField(max_length=255)
    pronunciation = models.CharField(max_length=255, blank=True, help_text="IPA")
    part_of_speech = models.CharField(
        max_length=20,
        choices=PartOfSpeech.choices,
        default=PartOfSpeech.OTHER,
    )
    difficulty_level = models.CharField(
        max_length=2,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.A1,
    )
    audio_url = models.URLField(blank=True)
    image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    topics = models.ManyToManyField(
        Topic,
        through="WordTopic",
        related_name="words",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["english_word"]
        db_table = "vocabulary_word"
        indexes = [
            models.Index(fields=["difficulty_level"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["part_of_speech"]),
        ]
        constraints = [
            models.UniqueConstraint(
                Lower("english_word"),
                name="uq_vocabulary_word_lower",
            )
        ]

    def __str__(self):
        return self.english_word


class WordTopic(models.Model):
    word = models.ForeignKey(
        VocabularyWord,
        on_delete=models.CASCADE,
        related_name="word_topics",
    )
    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="word_topics",
    )

    class Meta:
        db_table = "word_topic"
        constraints = [
            models.UniqueConstraint(fields=["word", "topic"], name="uq_word_topic"),
        ]

    def __str__(self):
        return f"{self.word_id}:{self.topic_id}"


class WordMeaning(models.Model):
    word = models.ForeignKey(
        VocabularyWord,
        on_delete=models.CASCADE,
        related_name="meanings",
    )
    part_of_speech = models.CharField(
        max_length=20,
        choices=PartOfSpeech.choices,
        default=PartOfSpeech.OTHER,
    )
    meaning_vi = models.CharField(max_length=255)
    meaning_en = models.CharField(max_length=255, blank=True)
    note = models.TextField(blank=True)
    display_order = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(50)],
    )

    class Meta:
        ordering = ["word", "display_order"]
        db_table = "word_meaning"
        constraints = [
            models.UniqueConstraint(
                fields=["word", "part_of_speech", "display_order"],
                name="uq_word_meaning_pos_order",
            )
        ]

    def __str__(self):
        return f"{self.word_id}:{self.display_order}"


class WordExample(models.Model):
    word = models.ForeignKey(
        VocabularyWord,
        on_delete=models.CASCADE,
        related_name="examples",
    )
    meaning = models.ForeignKey(
        WordMeaning,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="examples",
    )
    sentence_en = models.TextField()
    sentence_vi = models.TextField(blank=True)
    source = models.CharField(max_length=120, blank=True)

    class Meta:
        ordering = ["word", "id"]
        db_table = "word_example"
        constraints = [
            models.UniqueConstraint(
                fields=["word", "sentence_en"],
                name="uq_word_example_sentence",
            )
        ]

    def __str__(self):
        return self.sentence_en[:80]


class StudyDeck(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="study_decks",
    )
    topic = models.ForeignKey(
        Topic,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="decks",
    )
    is_public = models.BooleanField(default=False)
    words = models.ManyToManyField(
        VocabularyWord,
        through="StudyDeckItem",
        related_name="decks",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        db_table = "study_deck"
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "title"],
                name="uq_deck_title_per_owner",
            )
        ]

    def __str__(self):
        return self.title


class StudyDeckItem(models.Model):
    deck = models.ForeignKey(
        StudyDeck,
        on_delete=models.CASCADE,
        related_name="items",
    )
    word = models.ForeignKey(
        VocabularyWord,
        on_delete=models.CASCADE,
        related_name="deck_items",
    )
    display_order = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["deck", "display_order", "id"]
        db_table = "study_deck_item"
        constraints = [
            models.UniqueConstraint(fields=["deck", "word"], name="uq_word_per_deck"),
        ]
        indexes = [
            models.Index(fields=["deck", "display_order"]),
        ]

    def __str__(self):
        return f"{self.deck_id}:{self.word_id}"


class LearningTrack(models.Model):
    slug = models.SlugField(max_length=120, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    track_group = models.CharField(
        max_length=20,
        choices=TrackGroup.choices,
        default=TrackGroup.VOCABULARY,
    )
    target_level = models.CharField(
        max_length=2,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.A2,
    )
    total_words = models.PositiveIntegerField(default=0)
    total_lessons = models.PositiveIntegerField(default=0)
    sort_order = models.PositiveSmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "learning_track"
        ordering = ["sort_order", "id"]
        indexes = [
            models.Index(fields=["sort_order", "is_active"]),
        ]

    def __str__(self):
        return self.title


class LearningLesson(models.Model):
    track = models.ForeignKey(
        LearningTrack,
        on_delete=models.CASCADE,
        related_name="lessons",
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=160)
    lesson_order = models.PositiveIntegerField(default=1)
    estimated_minutes = models.PositiveSmallIntegerField(default=20)
    theory_content = models.TextField(blank=True)
    skill_focus = models.CharField(max_length=50, blank=True)
    total_words = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    words = models.ManyToManyField(
        VocabularyWord,
        through="LearningLessonWord",
        related_name="learning_lessons",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "learning_lesson"
        ordering = ["track", "lesson_order", "id"]
        constraints = [
            models.UniqueConstraint(fields=["track", "slug"], name="uq_track_lesson_slug"),
            models.UniqueConstraint(fields=["track", "lesson_order"], name="uq_track_lesson_order"),
        ]
        indexes = [
            models.Index(fields=["track", "is_active", "lesson_order"]),
        ]

    def __str__(self):
        return self.title


class LessonQuiz(models.Model):
    lesson = models.ForeignKey(
        LearningLesson,
        on_delete=models.CASCADE,
        related_name="quizzes",
    )
    title = models.CharField(max_length=255)
    pass_score = models.PositiveSmallIntegerField(
        default=60,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
    )
    time_limit_seconds = models.PositiveIntegerField(default=600)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "lesson_quiz"
        ordering = ["lesson", "id"]

    def __str__(self):
        return self.title


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(
        LessonQuiz,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    question_type = models.CharField(
        max_length=20,
        choices=QuizQuestionType.choices,
        default=QuizQuestionType.MULTIPLE_CHOICE,
    )
    prompt = models.TextField()
    explanation = models.TextField(blank=True)
    points = models.PositiveSmallIntegerField(default=1)
    question_order = models.PositiveSmallIntegerField(default=1)
    tag = models.CharField(max_length=50, blank=True)
    accepted_answer = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "quiz_question"
        ordering = ["quiz", "question_order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["quiz", "question_order"],
                name="uq_quiz_question_order",
            )
        ]

    def __str__(self):
        return f"{self.quiz_id}:{self.question_order}"


class QuizChoice(models.Model):
    question = models.ForeignKey(
        QuizQuestion,
        on_delete=models.CASCADE,
        related_name="choices",
    )
    content = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    choice_order = models.PositiveSmallIntegerField(default=1)

    class Meta:
        db_table = "quiz_choice"
        ordering = ["question", "choice_order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["question", "choice_order"],
                name="uq_question_choice_order",
            )
        ]

    def __str__(self):
        return f"{self.question_id}:{self.choice_order}"


class QuizAttempt(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="quiz_attempts",
    )
    quiz = models.ForeignKey(
        LessonQuiz,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    passed = models.BooleanField(default=False)
    correct_answers = models.PositiveSmallIntegerField(default=0)
    total_questions = models.PositiveSmallIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "quiz_attempt"
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["user", "quiz"]),
            models.Index(fields=["user", "-started_at"]),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.quiz_id}:{self.score}"


class QuizAnswer(models.Model):
    attempt = models.ForeignKey(
        QuizAttempt,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    question = models.ForeignKey(
        QuizQuestion,
        on_delete=models.CASCADE,
        related_name="submitted_answers",
    )
    selected_choice = models.ForeignKey(
        QuizChoice,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="selected_in_answers",
    )
    text_answer = models.TextField(blank=True)
    is_correct = models.BooleanField(default=False)
    points_awarded = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "quiz_answer"
        constraints = [
            models.UniqueConstraint(
                fields=["attempt", "question"],
                name="uq_attempt_question_answer",
            )
        ]

    def __str__(self):
        return f"{self.attempt_id}:{self.question_id}:{self.is_correct}"


class LearningLessonWord(models.Model):
    lesson = models.ForeignKey(
        LearningLesson,
        on_delete=models.CASCADE,
        related_name="lesson_words",
    )
    word = models.ForeignKey(
        VocabularyWord,
        on_delete=models.CASCADE,
        related_name="lesson_links",
    )
    display_order = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "learning_lesson_word"
        ordering = ["lesson", "display_order", "id"]
        constraints = [
            models.UniqueConstraint(fields=["lesson", "word"], name="uq_lesson_word"),
        ]
        indexes = [
            models.Index(fields=["lesson", "display_order"]),
        ]

    def __str__(self):
        return f"{self.lesson_id}:{self.word_id}"


class UserLessonProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lesson_progresses",
    )
    lesson = models.ForeignKey(
        LearningLesson,
        on_delete=models.CASCADE,
        related_name="user_progresses",
    )
    learned_words = models.PositiveIntegerField(default=0)
    mastered_words = models.PositiveIntegerField(default=0)
    last_studied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_lesson_progress"
        constraints = [
            models.UniqueConstraint(fields=["user", "lesson"], name="uq_user_lesson_progress"),
            models.CheckConstraint(
                condition=models.Q(learned_words__gte=models.F("mastered_words")),
                name="chk_lesson_mastered_lte_learned",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "updated_at"]),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.lesson_id}"


class UserLearningPath(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="learning_path",
    )
    current_level = models.CharField(
        max_length=2,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.A1,
    )
    goal = models.CharField(
        max_length=20,
        choices=LearningGoal.choices,
        default=LearningGoal.FOUNDATION,
    )
    duration_weeks = models.PositiveSmallIntegerField(
        default=8,
        validators=[MinValueValidator(4), MaxValueValidator(12)],
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_learning_path"

    def __str__(self):
        return f"path:{self.user_id}:{self.current_level}:{self.goal}"


class UserFavoriteWord(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorite_words",
    )
    word = models.ForeignKey(
        VocabularyWord,
        on_delete=models.CASCADE,
        related_name="favorited_by_users",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "user_favorite_word"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "word"], name="uq_user_favorite_word"),
        ]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "word"]),
        ]

    def __str__(self):
        return f"favorite:{self.user_id}:{self.word_id}"


class UserFavoriteLesson(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorite_lessons",
    )
    lesson = models.ForeignKey(
        LearningLesson,
        on_delete=models.CASCADE,
        related_name="favorited_by_users",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "user_favorite_lesson"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "lesson"], name="uq_user_favorite_lesson"),
        ]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "lesson"]),
        ]

    def __str__(self):
        return f"favorite-lesson:{self.user_id}:{self.lesson_id}"


class UserWordProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="word_progresses",
    )
    word = models.ForeignKey(
        VocabularyWord,
        on_delete=models.CASCADE,
        related_name="user_progresses",
    )
    status = models.CharField(
        max_length=10,
        choices=LearningStatus.choices,
        default=LearningStatus.NEW,
    )
    ease_factor = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=2.50,
        validators=[MinValueValidator(1.30), MaxValueValidator(5.00)],
    )
    interval_days = models.PositiveIntegerField(default=0)
    repetition = models.PositiveIntegerField(default=0)
    correct_streak = models.PositiveIntegerField(default=0)
    incorrect_streak = models.PositiveIntegerField(default=0)
    due_at = models.DateTimeField(null=True, blank=True, db_index=True)
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["due_at", "id"]
        db_table = "user_word_progress"
        constraints = [
            models.UniqueConstraint(fields=["user", "word"], name="uq_user_word_progress"),
            models.CheckConstraint(
                condition=models.Q(ease_factor__gte=1.30) & models.Q(ease_factor__lte=5.00),
                name="chk_ease_factor_range",
            ),
            models.CheckConstraint(
                condition=models.Q(interval_days__gte=0),
                name="chk_interval_days_nonneg",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["user", "due_at"]),
            models.Index(fields=["status", "due_at"]),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.word_id}:{self.status}"


class DailyActivity(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="daily_activities",
    )
    date = models.DateField(default=timezone.localdate)
    words_studied = models.PositiveSmallIntegerField(default=0)
    words_mastered = models.PositiveSmallIntegerField(default=0)
    xp_earned = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "daily_activity"
        ordering = ["-date"]
        constraints = [
            models.UniqueConstraint(fields=["user", "date"], name="uq_user_daily_activity"),
            models.CheckConstraint(
                condition=models.Q(words_studied__gte=models.F("words_mastered")),
                name="chk_mastered_lte_studied",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "-date"]),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.date}"


class StudySession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="study_sessions",
    )
    mode = models.CharField(max_length=12, choices=SessionMode.choices)
    deck = models.ForeignKey(
        StudyDeck,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sessions",
    )
    lesson = models.ForeignKey(
        "LearningLesson",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sessions",
    )
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    total_questions = models.PositiveSmallIntegerField(default=0)
    correct_answers = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["-started_at"]
        db_table = "study_session"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(ended_at__isnull=True) | models.Q(ended_at__gte=models.F("started_at")),
                name="chk_session_end_after_start",
            ),
            models.CheckConstraint(
                condition=models.Q(correct_answers__lte=models.F("total_questions")),
                name="chk_correct_lte_total",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "-started_at"]),
            models.Index(fields=["user", "mode"]),
        ]

    @property
    def accuracy(self):
        if self.total_questions == 0:
            return None
        return round(self.correct_answers / self.total_questions * 100, 1)

    def __str__(self):
        return f"session:{self.id}:{self.user_id}:{self.mode}"


class StudyAttempt(models.Model):
    session = models.ForeignKey(
        StudySession,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="study_attempts",
    )
    word = models.ForeignKey(
        VocabularyWord,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    is_correct = models.BooleanField(default=False)
    response_text = models.TextField(blank=True)
    response_time_ms = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MaxValueValidator(300000)],
    )
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-answered_at"]
        db_table = "study_attempt"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(response_time_ms__isnull=True)
                | (models.Q(response_time_ms__gt=0) & models.Q(response_time_ms__lte=300000)),
                name="chk_response_time_range",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "-answered_at"]),
            models.Index(fields=["word", "-answered_at"]),
            models.Index(fields=["session", "is_correct"]),
        ]

    def __str__(self):
        return f"attempt:{self.id}:{self.word_id}:{self.is_correct}"
