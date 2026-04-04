from django.utils.text import slugify
from rest_framework import serializers

from .models import (
    LessonQuiz,
    LearningLesson,
    LearningTrack,
    QuizAnswer,
    QuizAttempt,
    QuizChoice,
    QuizQuestion,
    StudySession,
    UserFavoriteLesson,
    UserFavoriteWord,
    UserLearningPath,
    UserProfile,
    UserLessonProgress,
    VocabularyWord,
    WordExample,
    WordMeaning,
    Topic,
)


class TopicSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Topic
        fields = ["id", "name", "slug", "description", "icon_emoji", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        name = attrs.get("name", getattr(self.instance, "name", ""))
        slug = attrs.get("slug")

        if not slug:
            base_slug = slugify(name) or "topic"
            slug_candidate = base_slug
            counter = 1
            queryset = Topic.objects.all()
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            while queryset.filter(slug=slug_candidate).exists():
                counter += 1
                slug_candidate = f"{base_slug}-{counter}"
            attrs["slug"] = slug_candidate
        return attrs


class VocabularyWordSerializer(serializers.ModelSerializer):
    topic_ids = serializers.PrimaryKeyRelatedField(
        source="topics",
        queryset=Topic.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = VocabularyWord
        fields = [
            "id",
            "english_word",
            "primary_meaning",
            "pronunciation",
            "part_of_speech",
            "difficulty_level",
            "audio_url",
            "image_url",
            "is_active",
            "topic_ids",
            "topics",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "topics"]

    def validate_english_word(self, value):
        normalized = (value or "").strip()
        if not normalized:
            raise serializers.ValidationError("English word khong duoc de trong.")

        queryset = VocabularyWord.objects.filter(english_word__iexact=normalized)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Tu vung nay da ton tai (khong phan biet hoa thuong).")
        return normalized


class WordMeaningSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordMeaning
        fields = [
            "id",
            "word",
            "part_of_speech",
            "meaning_vi",
            "meaning_en",
            "note",
            "display_order",
        ]
        read_only_fields = ["id"]


class WordExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordExample
        fields = [
            "id",
            "word",
            "meaning",
            "sentence_en",
            "sentence_vi",
            "source",
        ]
        read_only_fields = ["id"]


class StudyWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = VocabularyWord
        fields = [
            "id",
            "english_word",
            "primary_meaning",
            "pronunciation",
            "part_of_speech",
            "difficulty_level",
        ]


class StudySessionSerializer(serializers.ModelSerializer):
    accuracy = serializers.SerializerMethodField()

    class Meta:
        model = StudySession
        fields = [
            "id",
            "mode",
            "lesson_id",
            "started_at",
            "ended_at",
            "total_questions",
            "correct_answers",
            "accuracy",
        ]

    def get_accuracy(self, obj):
        if obj.total_questions == 0:
            return 0.0
        return round((obj.correct_answers / obj.total_questions) * 100, 1)


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "username",
            "email",
            "avatar_url",
            "daily_goal",
            "current_level",
            "learning_goal",
            "onboarding_completed",
            "streak_count",
            "last_active_date",
        ]
        read_only_fields = [
            "username",
            "email",
            "onboarding_completed",
            "streak_count",
            "last_active_date",
        ]


class UserFavoriteWordSerializer(serializers.ModelSerializer):
    word_id = serializers.IntegerField(source="word.id", read_only=True)
    english_word = serializers.CharField(source="word.english_word", read_only=True)
    primary_meaning = serializers.CharField(source="word.primary_meaning", read_only=True)
    part_of_speech = serializers.CharField(source="word.part_of_speech", read_only=True)
    difficulty_level = serializers.CharField(source="word.difficulty_level", read_only=True)
    lesson_id = serializers.SerializerMethodField()
    lesson_title = serializers.SerializerMethodField()
    lesson_total_words = serializers.SerializerMethodField()
    track_slug = serializers.SerializerMethodField()
    track_title = serializers.SerializerMethodField()

    class Meta:
        model = UserFavoriteWord
        fields = [
            "word_id",
            "english_word",
            "primary_meaning",
            "part_of_speech",
            "difficulty_level",
            "lesson_id",
            "lesson_title",
            "lesson_total_words",
            "track_slug",
            "track_title",
            "created_at",
        ]

    def _get_primary_lesson(self, obj):
        if not hasattr(self, "_lesson_cache"):
            self._lesson_cache = {}

        if obj.word_id in self._lesson_cache:
            return self._lesson_cache[obj.word_id]

        lesson_links = list(obj.word.lesson_links.all())
        lesson_links.sort(key=lambda link: (link.lesson.track.sort_order, link.lesson.lesson_order))
        lesson = lesson_links[0].lesson if lesson_links else None
        self._lesson_cache[obj.word_id] = lesson
        return lesson

    def get_lesson_id(self, obj):
        lesson = self._get_primary_lesson(obj)
        return lesson.id if lesson else None

    def get_lesson_title(self, obj):
        lesson = self._get_primary_lesson(obj)
        return lesson.title if lesson else ""

    def get_lesson_total_words(self, obj):
        lesson = self._get_primary_lesson(obj)
        return lesson.total_words if lesson else 0

    def get_track_slug(self, obj):
        lesson = self._get_primary_lesson(obj)
        return lesson.track.slug if lesson else ""

    def get_track_title(self, obj):
        lesson = self._get_primary_lesson(obj)
        return lesson.track.title if lesson else ""


class UserFavoriteLessonSerializer(serializers.ModelSerializer):
    lesson_id = serializers.IntegerField(source="lesson.id", read_only=True)
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)
    lesson_total_words = serializers.IntegerField(source="lesson.total_words", read_only=True)
    lesson_order = serializers.IntegerField(source="lesson.lesson_order", read_only=True)
    track_slug = serializers.CharField(source="lesson.track.slug", read_only=True)
    track_title = serializers.CharField(source="lesson.track.title", read_only=True)

    class Meta:
        model = UserFavoriteLesson
        fields = [
            "lesson_id",
            "lesson_title",
            "lesson_total_words",
            "lesson_order",
            "track_slug",
            "track_title",
            "created_at",
        ]


class LearningLessonSerializer(serializers.ModelSerializer):
    track_slug = serializers.CharField(source="track.slug", read_only=True)
    track_title = serializers.CharField(source="track.title", read_only=True)
    learned_words = serializers.SerializerMethodField()
    mastered_words = serializers.SerializerMethodField()

    class Meta:
        model = LearningLesson
        fields = [
            "id",
            "track_id",
            "track_slug",
            "track_title",
            "title",
            "slug",
            "lesson_order",
            "estimated_minutes",
            "skill_focus",
            "total_words",
            "learned_words",
            "mastered_words",
        ]

    def _get_user_progress(self, obj):
        user = self.context.get("user")
        if not user or not user.is_authenticated:
            return None
        return UserLessonProgress.objects.filter(user=user, lesson=obj).first()

    def get_learned_words(self, obj):
        progress = self._get_user_progress(obj)
        return progress.learned_words if progress else 0

    def get_mastered_words(self, obj):
        progress = self._get_user_progress(obj)
        return progress.mastered_words if progress else 0


class LearningTrackSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()
    learned_words = serializers.SerializerMethodField()
    mastered_words = serializers.SerializerMethodField()

    class Meta:
        model = LearningTrack
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "track_group",
            "target_level",
            "total_words",
            "total_lessons",
            "learned_words",
            "mastered_words",
            "lessons",
        ]

    def get_lessons(self, obj):
        limit = self.context.get("lessons_limit", 4)
        queryset = obj.lessons.filter(is_active=True).order_by("lesson_order")
        if limit:
            queryset = queryset[:limit]
        return LearningLessonSerializer(queryset, many=True, context=self.context).data

    def _get_progress_map(self, obj):
        if not hasattr(self, "_progress_cache"):
            self._progress_cache = {}

        if obj.id in self._progress_cache:
            return self._progress_cache[obj.id]

        user = self.context.get("user")
        if not user or not user.is_authenticated:
            result = {"learned_words": 0, "mastered_words": 0}
            self._progress_cache[obj.id] = result
            return result

        progress_rows = UserLessonProgress.objects.filter(user=user, lesson__track=obj).values(
            "learned_words",
            "mastered_words",
        )
        learned = sum(item["learned_words"] for item in progress_rows)
        mastered = sum(item["mastered_words"] for item in progress_rows)
        result = {"learned_words": learned, "mastered_words": mastered}
        self._progress_cache[obj.id] = result
        return result

    def get_learned_words(self, obj):
        return self._get_progress_map(obj)["learned_words"]

    def get_mastered_words(self, obj):
        return self._get_progress_map(obj)["mastered_words"]


class QuizChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizChoice
        fields = ["id", "content", "choice_order"]


class QuizQuestionSerializer(serializers.ModelSerializer):
    choices = QuizChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = [
            "id",
            "question_type",
            "prompt",
            "points",
            "question_order",
            "tag",
            "choices",
        ]


class LessonQuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = LessonQuiz
        fields = [
            "id",
            "title",
            "pass_score",
            "time_limit_seconds",
            "questions",
        ]


class LearningLessonDetailSerializer(serializers.ModelSerializer):
    track_slug = serializers.CharField(source="track.slug", read_only=True)
    track_title = serializers.CharField(source="track.title", read_only=True)
    quizzes = LessonQuizSerializer(many=True, read_only=True)
    key_words = serializers.SerializerMethodField()
    learned_words = serializers.SerializerMethodField()
    mastered_words = serializers.SerializerMethodField()

    class Meta:
        model = LearningLesson
        fields = [
            "id",
            "track_id",
            "track_slug",
            "track_title",
            "title",
            "slug",
            "lesson_order",
            "estimated_minutes",
            "theory_content",
            "skill_focus",
            "total_words",
            "key_words",
            "learned_words",
            "mastered_words",
            "quizzes",
        ]

    def _get_user_progress(self, obj):
        user = self.context.get("user")
        if not user or not user.is_authenticated:
            return None
        return UserLessonProgress.objects.filter(user=user, lesson=obj).first()

    def get_learned_words(self, obj):
        progress = self._get_user_progress(obj)
        return progress.learned_words if progress else 0

    def get_mastered_words(self, obj):
        progress = self._get_user_progress(obj)
        return progress.mastered_words if progress else 0

    def get_key_words(self, obj):
        links = obj.lesson_words.select_related("word").order_by("display_order")[:20]
        return [
            {
                "id": link.word.id,
                "english_word": link.word.english_word,
                "primary_meaning": link.word.primary_meaning,
                "part_of_speech": link.word.part_of_speech,
                "difficulty_level": link.word.difficulty_level,
                "pronunciation": link.word.pronunciation,
            }
            for link in links
        ]


class QuizSubmissionAnswerInputSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_choice_id = serializers.IntegerField(required=False, allow_null=True)
    text_answer = serializers.CharField(required=False, allow_blank=True)


class QuizSubmitInputSerializer(serializers.Serializer):
    answers = QuizSubmissionAnswerInputSerializer(many=True)


class QuizAnswerResultSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField(source="question.id", read_only=True)
    question_prompt = serializers.CharField(source="question.prompt", read_only=True)
    explanation = serializers.CharField(source="question.explanation", read_only=True)

    class Meta:
        model = QuizAnswer
        fields = [
            "question_id",
            "question_prompt",
            "is_correct",
            "points_awarded",
            "explanation",
        ]


class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = QuizAnswerResultSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "quiz",
            "score",
            "passed",
            "correct_answers",
            "total_questions",
            "started_at",
            "completed_at",
            "answers",
        ]


class UserLearningPathSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLearningPath
        fields = [
            "current_level",
            "goal",
            "duration_weeks",
            "is_active",
            "created_at",
            "updated_at",
        ]
