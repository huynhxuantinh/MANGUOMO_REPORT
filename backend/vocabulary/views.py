from datetime import timedelta

from django.db.models import Count, F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    DailyActivity,
    DifficultyLevel,
    LearningGoal,
    LearningLesson,
    LearningLessonWord,
    LearningTrack,
    LessonQuiz,
    LearningStatus,
    QuizAnswer,
    QuizAttempt,
    QuizQuestion,
    SessionMode,
    StudyAttempt,
    StudyDeckItem,
    StudySession,
    Topic,
    UserFavoriteLesson,
    UserFavoriteWord,
    UserLearningPath,
    UserLessonProgress,
    UserProfile,
    UserWordProgress,
    VocabularyWord,
    WordExample,
    WordMeaning,
)
from .serializers import (
    LearningLessonDetailSerializer,
    LearningLessonSerializer,
    LearningTrackSerializer,
    LessonQuizSerializer,
    QuizAttemptSerializer,
    QuizSubmitInputSerializer,
    StudySessionSerializer,
    StudyWordSerializer,
    TopicSerializer,
    UserFavoriteLessonSerializer,
    UserFavoriteWordSerializer,
    UserLearningPathSerializer,
    UserProfileSerializer,
    VocabularyWordSerializer,
    WordExampleSerializer,
    WordMeaningSerializer,
)


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "vocabulary-api"})


def _normalize_text(value):
    return " ".join((value or "").strip().lower().split())


def _is_correct_answer(response_text, accepted_meanings):
    normalized_response = _normalize_text(response_text)
    if not normalized_response:
        return False
    normalized_meanings = {_normalize_text(item) for item in accepted_meanings if item}
    return normalized_response in normalized_meanings


def _is_correct_text_answer(response_text, accepted_answer):
    normalized_response = _normalize_text(response_text)
    if not normalized_response:
        return False
    raw_answers = [item.strip() for item in str(accepted_answer or "").split("|")]
    normalized_answers = {_normalize_text(item) for item in raw_answers if item}
    return normalized_response in normalized_answers


def _level_from_percentage(score):
    if score >= 85:
        return DifficultyLevel.B2
    if score >= 70:
        return DifficultyLevel.B1
    if score >= 50:
        return DifficultyLevel.A2
    return DifficultyLevel.A1


LEVEL_RANK = {
    DifficultyLevel.A1: 1,
    DifficultyLevel.A2: 2,
    DifficultyLevel.B1: 3,
    DifficultyLevel.B2: 4,
    DifficultyLevel.C1: 5,
    DifficultyLevel.C2: 6,
}


def _goal_track_groups(goal):
    if goal == LearningGoal.EXAM:
        return {"exam"}
    if goal == LearningGoal.COMMUNICATION:
        return {"vocabulary", "skills"}
    if goal == LearningGoal.WORK:
        return {"vocabulary", "skills", "exam"}
    return {"vocabulary", "grammar"}


def _compute_weak_tags(user):
    rows = (
        QuizAnswer.objects.filter(attempt__user=user)
        .exclude(question__tag="")
        .values("question__tag")
        .annotate(total=Count("id"), correct=Count("id", filter=Q(is_correct=True)))
    )
    weak_tags = []
    for row in rows:
        total = row["total"]
        correct = row["correct"]
        accuracy = (correct / total) * 100 if total else 0
        if total >= 3 and accuracy < 60:
            weak_tags.append(
                {
                    "tag": row["question__tag"],
                    "accuracy": round(accuracy, 1),
                    "total": total,
                }
            )
    weak_tags.sort(key=lambda item: item["accuracy"])
    return weak_tags


def _select_next_lesson(user):
    now = timezone.now()
    learning_path = UserLearningPath.objects.filter(user=user, is_active=True).first()

    if learning_path:
        goal_groups = _goal_track_groups(learning_path.goal)
        path_level_rank = LEVEL_RANK.get(learning_path.current_level, 1)
    else:
        goal_groups = {"vocabulary", "grammar", "skills", "exam"}
        path_level_rank = 2

    progress_map = {
        item.lesson_id: item
        for item in UserLessonProgress.objects.filter(user=user).only(
            "lesson_id",
            "learned_words",
            "mastered_words",
        )
    }

    lessons = (
        LearningLesson.objects.filter(is_active=True, track__is_active=True)
        .select_related("track")
        .order_by("track__sort_order", "lesson_order")
    )

    candidate_by_path = None
    for lesson in lessons:
        if lesson.track.track_group not in goal_groups:
            continue
        lesson_rank = LEVEL_RANK.get(lesson.track.target_level, 1)
        if lesson_rank > path_level_rank + 1:
            continue
        progress = progress_map.get(lesson.id)
        if not progress or progress.learned_words < lesson.total_words:
            candidate_by_path = lesson
            break

    due_lesson = (
        LearningLessonWord.objects.filter(
            word__user_progresses__user=user,
            word__user_progresses__due_at__lte=now,
            lesson__is_active=True,
            lesson__track__is_active=True,
        )
        .select_related("lesson__track")
        .order_by("lesson__track__sort_order", "lesson__lesson_order")
        .first()
    )
    if due_lesson:
        due_lesson = due_lesson.lesson

    failed_recent = (
        QuizAttempt.objects.filter(user=user, passed=False)
        .select_related("quiz__lesson__track")
        .order_by("-started_at")
        .first()
    )
    easier_lesson = None
    if failed_recent and failed_recent.quiz and failed_recent.quiz.lesson:
        current_lesson = failed_recent.quiz.lesson
        easier_lesson = (
            LearningLesson.objects.filter(
                track=current_lesson.track,
                lesson_order__lt=current_lesson.lesson_order,
                is_active=True,
            )
            .order_by("-lesson_order")
            .first()
        ) or current_lesson

    fallback = lessons.first()

    if candidate_by_path:
        return candidate_by_path, learning_path, "path"
    if due_lesson:
        return due_lesson, learning_path, "due_review"
    if easier_lesson:
        return easier_lesson, learning_path, "failed_quiz_review"
    return fallback, learning_path, "fallback"


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all().order_by("name")
    serializer_class = TopicSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class VocabularyWordViewSet(viewsets.ModelViewSet):
    queryset = VocabularyWord.objects.prefetch_related("topics").all().order_by("english_word")
    serializer_class = VocabularyWordSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        search = self.request.query_params.get("search")
        difficulty = self.request.query_params.get("difficulty")
        part_of_speech = self.request.query_params.get("part_of_speech")
        is_active = self.request.query_params.get("is_active")
        topic_id = self.request.query_params.get("topic_id")

        if search:
            queryset = queryset.filter(english_word__icontains=search)
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
        if part_of_speech:
            queryset = queryset.filter(part_of_speech=part_of_speech)
        if is_active in {"true", "false"}:
            queryset = queryset.filter(is_active=(is_active == "true"))
        if topic_id:
            queryset = queryset.filter(topics__id=topic_id)

        return queryset.distinct()


class WordMeaningViewSet(viewsets.ModelViewSet):
    queryset = WordMeaning.objects.select_related("word").all().order_by("word_id", "display_order")
    serializer_class = WordMeaningSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        word_id = self.request.query_params.get("word_id")
        if word_id:
            queryset = queryset.filter(word_id=word_id)
        return queryset


class WordExampleViewSet(viewsets.ModelViewSet):
    queryset = WordExample.objects.select_related("word", "meaning").all().order_by("word_id", "id")
    serializer_class = WordExampleSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        word_id = self.request.query_params.get("word_id")
        if word_id:
            queryset = queryset.filter(word_id=word_id)
        return queryset


class LearningTrackListView(APIView):
    def get(self, request):
        tracks = LearningTrack.objects.filter(is_active=True).order_by("sort_order", "id")
        group = request.query_params.get("group")
        level = request.query_params.get("level")
        if group:
            tracks = tracks.filter(track_group=group)
        if level:
            tracks = tracks.filter(target_level=level)

        try:
            lessons_limit = int(request.query_params.get("lessons_limit", 4))
        except (TypeError, ValueError):
            lessons_limit = 4
        lessons_limit = max(1, min(lessons_limit, 20))

        serializer = LearningTrackSerializer(
            tracks,
            many=True,
            context={"user": request.user, "lessons_limit": lessons_limit},
        )
        return Response(serializer.data)


class LearningTrackDetailView(APIView):
    def get(self, request, slug):
        track = get_object_or_404(LearningTrack, slug=slug, is_active=True)
        data = LearningTrackSerializer(
            track,
            context={"user": request.user, "lessons_limit": None},
        ).data
        return Response(data)


class LearningLessonDetailView(APIView):
    def get(self, request, lesson_id):
        lesson = get_object_or_404(
            LearningLesson.objects.select_related("track").prefetch_related("quizzes__questions__choices"),
            id=lesson_id,
            is_active=True,
            track__is_active=True,
        )
        return Response(LearningLessonDetailSerializer(lesson, context={"user": request.user}).data)


class OnboardingPlacementView(APIView):
    def get(self, request):
        words = list(VocabularyWord.objects.filter(is_active=True).order_by("?")[:15])
        all_meanings = list(VocabularyWord.objects.filter(is_active=True).values_list("primary_meaning", flat=True))
        questions = []
        for idx, word in enumerate(words, start=1):
            distractors = [item for item in all_meanings if item != word.primary_meaning][:3]
            options = distractors + [word.primary_meaning]
            options = sorted(set(options), key=lambda x: x)[:4]
            if word.primary_meaning not in options:
                options[-1] = word.primary_meaning
            questions.append(
                {
                    "question_id": idx,
                    "word_id": word.id,
                    "prompt": f"Chon nghia dung cua tu '{word.english_word}'",
                    "options": options,
                }
            )
        return Response({"questions": questions})

    def post(self, request):
        answers = request.data.get("answers", [])
        total = len(answers)
        if total == 0:
            return Response({"detail": "Khong co dap an nao duoc gui."}, status=status.HTTP_400_BAD_REQUEST)

        correct = 0
        for item in answers:
            word_id = item.get("word_id")
            selected = item.get("selected_answer", "")
            if not word_id:
                continue
            word = VocabularyWord.objects.filter(id=word_id, is_active=True).first()
            if word and _normalize_text(selected) == _normalize_text(word.primary_meaning):
                correct += 1

        score = round((correct / total) * 100, 2)
        level = _level_from_percentage(score)

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.current_level = level
        profile.onboarding_completed = True
        profile.save(update_fields=["current_level", "onboarding_completed"])

        return Response(
            {
                "score": score,
                "correct": correct,
                "total": total,
                "level": level,
            }
        )


class LearningPathSetupView(APIView):
    def post(self, request):
        level = request.data.get("current_level")
        goal = request.data.get("goal")
        duration_weeks = request.data.get("duration_weeks", 8)

        if level not in DifficultyLevel.values:
            return Response({"detail": "current_level khong hop le."}, status=status.HTTP_400_BAD_REQUEST)
        if goal not in LearningGoal.values:
            return Response({"detail": "goal khong hop le."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            duration_weeks = int(duration_weeks)
        except (TypeError, ValueError):
            return Response({"detail": "duration_weeks khong hop le."}, status=status.HTTP_400_BAD_REQUEST)
        duration_weeks = max(4, min(duration_weeks, 12))

        path, _ = UserLearningPath.objects.update_or_create(
            user=request.user,
            defaults={
                "current_level": level,
                "goal": goal,
                "duration_weeks": duration_weeks,
                "is_active": True,
            },
        )

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.current_level = level
        profile.learning_goal = goal
        profile.onboarding_completed = True
        profile.save(update_fields=["current_level", "learning_goal", "onboarding_completed"])

        return Response(UserLearningPathSerializer(path).data, status=status.HTTP_201_CREATED)


class LearningPathView(APIView):
    def get(self, request):
        path = UserLearningPath.objects.filter(user=request.user, is_active=True).first()
        if not path:
            return Response({"detail": "Chua co learning path."}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserLearningPathSerializer(path).data)


class UserProfileView(APIView):
    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(UserProfileSerializer(profile).data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserFavoriteWordListCreateView(APIView):
    def get(self, request):
        queryset = (
            UserFavoriteWord.objects.filter(user=request.user)
            .select_related("word")
            .prefetch_related("word__lesson_links__lesson__track")
            .order_by("-created_at")
        )
        search = request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(word__english_word__icontains=search) | Q(word__primary_meaning__icontains=search)
            )
        return Response(UserFavoriteWordSerializer(queryset, many=True).data)

    def post(self, request):
        word_id = request.data.get("word_id")
        if not word_id:
            return Response({"detail": "Thieu word_id."}, status=status.HTTP_400_BAD_REQUEST)
        word = get_object_or_404(VocabularyWord, id=word_id, is_active=True)
        favorite, created = UserFavoriteWord.objects.get_or_create(user=request.user, word=word)
        serializer = UserFavoriteWordSerializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class UserFavoriteWordDeleteView(APIView):
    def delete(self, request, word_id):
        deleted, _ = UserFavoriteWord.objects.filter(user=request.user, word_id=word_id).delete()
        if not deleted:
            return Response({"detail": "Word chua co trong so tay."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserFavoriteLessonListCreateView(APIView):
    def get(self, request):
        queryset = (
            UserFavoriteLesson.objects.filter(user=request.user)
            .select_related("lesson__track")
            .order_by("lesson__track__sort_order", "lesson__lesson_order")
        )
        track = request.query_params.get("track")
        if track:
            queryset = queryset.filter(lesson__track__slug=track)
        return Response(UserFavoriteLessonSerializer(queryset, many=True).data)

    def post(self, request):
        lesson_id = request.data.get("lesson_id")
        if not lesson_id:
            return Response({"detail": "Thieu lesson_id."}, status=status.HTTP_400_BAD_REQUEST)
        lesson = get_object_or_404(LearningLesson, id=lesson_id, is_active=True, track__is_active=True)
        favorite, created = UserFavoriteLesson.objects.get_or_create(user=request.user, lesson=lesson)
        serializer = UserFavoriteLessonSerializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class UserFavoriteLessonDeleteView(APIView):
    def delete(self, request, lesson_id):
        deleted, _ = UserFavoriteLesson.objects.filter(user=request.user, lesson_id=lesson_id).delete()
        if not deleted:
            return Response({"detail": "Lesson chua co trong yeu thich."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DashboardView(APIView):
    def get(self, request):
        now = timezone.now()
        today = timezone.localdate()
        user = request.user

        words_total = VocabularyWord.objects.filter(is_active=True).count()
        progress_qs = UserWordProgress.objects.filter(user=user)
        due_words = progress_qs.filter(due_at__lte=now).count()
        progress_total = progress_qs.count()

        status_counts = {
            item["status"]: item["total"]
            for item in progress_qs.values("status").annotate(total=Count("id"))
        }

        attempts_qs = StudyAttempt.objects.filter(user=user)
        total_attempts = attempts_qs.count()
        correct_attempts = attempts_qs.filter(is_correct=True).count()
        accuracy = round((correct_attempts / total_attempts) * 100, 1) if total_attempts else 0.0

        activity = DailyActivity.objects.filter(user=user, date=today).first()
        profile, _ = UserProfile.objects.get_or_create(user=user)
        favorite_words_count = UserFavoriteWord.objects.filter(user=user).count()
        today_stats = {
            "words_studied": activity.words_studied if activity else 0,
            "words_mastered": activity.words_mastered if activity else 0,
            "xp_earned": activity.xp_earned if activity else 0,
        }

        recent_sessions = StudySession.objects.filter(user=user).order_by("-started_at")[:5]

        by_level = {
            item["difficulty_level"]: item["total"]
            for item in VocabularyWord.objects.filter(is_active=True)
            .values("difficulty_level")
            .annotate(total=Count("id"))
            .order_by("difficulty_level")
        }

        weekly_activities = {
            item.date.isoformat(): item
            for item in DailyActivity.objects.filter(
                user=user,
                date__gte=today - timedelta(days=6),
                date__lte=today,
            )
        }
        seven_days = []
        for offset in range(6, -1, -1):
            date_obj = today - timedelta(days=offset)
            item = weekly_activities.get(date_obj.isoformat())
            seven_days.append(
                {
                    "date": date_obj.isoformat(),
                    "words_studied": item.words_studied if item else 0,
                    "xp_earned": item.xp_earned if item else 0,
                }
            )

        next_lesson, path, reason = _select_next_lesson(user)
        weak_tags = _compute_weak_tags(user)

        return Response(
            {
                "summary": {
                    "words_total": words_total,
                    "progress_total": progress_total,
                    "due_words": due_words,
                    "total_attempts": total_attempts,
                    "correct_attempts": correct_attempts,
                    "accuracy": accuracy,
                    "streak_count": profile.streak_count,
                    "daily_goal": profile.daily_goal,
                    "favorite_words_count": favorite_words_count,
                },
                "profile": UserProfileSerializer(profile).data,
                "today": today_stats,
                "progress_by_status": status_counts,
                "words_by_level": by_level,
                "weekly_activity": seven_days,
                "weak_tags": weak_tags[:3],
                "next_recommendation": {
                    "reason": reason,
                    "learning_path": UserLearningPathSerializer(path).data if path else None,
                    "lesson": LearningLessonSerializer(next_lesson, context={"user": user}).data if next_lesson else None,
                },
                "recent_sessions": StudySessionSerializer(recent_sessions, many=True).data,
            }
        )


class StudyStartView(APIView):
    def post(self, request):
        user = request.user
        now = timezone.now()

        mode = request.data.get("mode", SessionMode.FLASHCARD)
        if mode not in SessionMode.values:
            return Response({"detail": "Mode khong hop le."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            limit = int(request.data.get("limit", 10))
        except (TypeError, ValueError):
            limit = 10
        limit = max(1, min(limit, 30))

        selected_words = []
        selected_word_ids = set()

        lesson = None
        lesson_id = request.data.get("lesson_id")
        if lesson_id:
            lesson = get_object_or_404(LearningLesson, id=lesson_id, is_active=True, track__is_active=True)
            lesson_words = (
                LearningLessonWord.objects.filter(lesson=lesson, word__is_active=True)
                .select_related("word")
                .order_by("display_order")[:limit]
            )
            for link in lesson_words:
                word = link.word
                if word.id not in selected_word_ids:
                    selected_words.append(word)
                    selected_word_ids.add(word.id)

        if not lesson:
            due_progress = (
                UserWordProgress.objects.filter(user=user, due_at__lte=now)
                .select_related("word")
                .order_by("due_at")[:limit]
            )
            for progress in due_progress:
                if progress.word and progress.word.is_active and progress.word_id not in selected_word_ids:
                    selected_words.append(progress.word)
                    selected_word_ids.add(progress.word_id)

        remaining = limit - len(selected_words)

        if not lesson:
            deck_id = request.data.get("deck_id")
            if remaining > 0 and deck_id:
                deck_word_ids = (
                    StudyDeckItem.objects.filter(deck_id=deck_id)
                    .exclude(word_id__in=selected_word_ids)
                    .values_list("word_id", flat=True)
                )
                for word in VocabularyWord.objects.filter(id__in=deck_word_ids, is_active=True)[:remaining]:
                    selected_words.append(word)
                    selected_word_ids.add(word.id)

            remaining = limit - len(selected_words)
            if remaining > 0:
                random_words = (
                    VocabularyWord.objects.filter(is_active=True)
                    .exclude(id__in=selected_word_ids)
                    .order_by("?")[:remaining]
                )
                for word in random_words:
                    selected_words.append(word)
                    selected_word_ids.add(word.id)

        if not selected_words:
            return Response({"detail": "Khong co tu vung de hoc."}, status=status.HTTP_400_BAD_REQUEST)

        session = StudySession.objects.create(
            user=user,
            mode=mode,
            lesson=lesson,
            total_questions=len(selected_words),
            correct_answers=0,
        )

        for word in selected_words:
            UserWordProgress.objects.get_or_create(
                user=user,
                word=word,
                defaults={
                    "status": LearningStatus.NEW,
                    "due_at": now,
                },
            )

        return Response(
            {
                "session": StudySessionSerializer(session).data,
                "questions": StudyWordSerializer(selected_words, many=True).data,
            },
            status=status.HTTP_201_CREATED,
        )


class StudyAnswerView(APIView):
    def post(self, request, session_id):
        user = request.user
        session = get_object_or_404(StudySession, id=session_id, user=user)
        if session.ended_at:
            return Response({"detail": "Session da ket thuc."}, status=status.HTTP_400_BAD_REQUEST)

        word_id = request.data.get("word_id")
        response_text = request.data.get("response_text", "")
        response_time_ms = request.data.get("response_time_ms")
        override_is_correct = request.data.get("is_correct")

        if not word_id:
            return Response({"detail": "Thieu word_id."}, status=status.HTTP_400_BAD_REQUEST)

        word = get_object_or_404(VocabularyWord, id=word_id, is_active=True)

        accepted_meanings = [word.primary_meaning]
        accepted_meanings.extend(word.meanings.values_list("meaning_vi", flat=True))

        if override_is_correct is None:
            is_correct = _is_correct_answer(response_text, accepted_meanings)
        else:
            is_correct = bool(override_is_correct)

        attempt = StudyAttempt.objects.create(
            session=session,
            user=user,
            word=word,
            is_correct=is_correct,
            response_text=response_text or "",
            response_time_ms=response_time_ms if response_time_ms else None,
        )

        progress, _ = UserWordProgress.objects.get_or_create(
            user=user,
            word=word,
            defaults={"status": LearningStatus.NEW, "due_at": timezone.now()},
        )

        now = timezone.now()
        if is_correct:
            progress.repetition += 1
            progress.correct_streak += 1
            progress.incorrect_streak = 0
            progress.ease_factor = min(5.0, float(progress.ease_factor) + 0.1)

            if progress.repetition >= 5:
                progress.status = LearningStatus.MASTERED
            elif progress.repetition >= 2:
                progress.status = LearningStatus.REVIEW
            else:
                progress.status = LearningStatus.LEARNING

            schedule_map = {1: 1, 2: 3, 3: 7, 4: 14, 5: 30}
            progress.interval_days = schedule_map.get(progress.repetition, 30)
        else:
            progress.repetition = 0
            progress.correct_streak = 0
            progress.incorrect_streak += 1
            progress.status = LearningStatus.LEARNING
            progress.interval_days = 1
            progress.ease_factor = max(1.3, float(progress.ease_factor) - 0.2)

        progress.due_at = now + timedelta(days=progress.interval_days)
        progress.last_reviewed_at = now
        progress.save()

        correct_answers = session.attempts.filter(is_correct=True).count()
        answered_count = session.attempts.count()
        session.correct_answers = correct_answers
        if answered_count >= session.total_questions and session.total_questions > 0:
            session.ended_at = now
            session.save(update_fields=["correct_answers", "ended_at"])
        else:
            session.save(update_fields=["correct_answers"])

        today = timezone.localdate()
        activity, _ = DailyActivity.objects.get_or_create(
            user=user,
            date=today,
            defaults={"words_studied": 0, "words_mastered": 0, "xp_earned": 0},
        )

        DailyActivity.objects.filter(pk=activity.pk).update(
            words_studied=F("words_studied") + 1,
            words_mastered=F("words_mastered") + (1 if is_correct and progress.status == LearningStatus.MASTERED else 0),
            xp_earned=F("xp_earned") + (20 if is_correct else 5),
        )
        activity.refresh_from_db()

        if session.lesson_id:
            lesson = session.lesson
            learned_words = (
                StudyAttempt.objects.filter(
                    user=user,
                    session__lesson=lesson,
                )
                .values("word_id")
                .distinct()
                .count()
            )
            mastered_words = (
                UserWordProgress.objects.filter(
                    user=user,
                    status=LearningStatus.MASTERED,
                    word__lesson_links__lesson=lesson,
                )
                .values("word_id")
                .distinct()
                .count()
            )
            UserLessonProgress.objects.update_or_create(
                user=user,
                lesson=lesson,
                defaults={
                    "learned_words": learned_words,
                    "mastered_words": mastered_words,
                    "last_studied_at": now,
                },
            )

        return Response(
            {
                "attempt_id": attempt.id,
                "is_correct": is_correct,
                "accepted_meanings": accepted_meanings,
                "progress": {
                    "status": progress.status,
                    "interval_days": progress.interval_days,
                    "repetition": progress.repetition,
                    "due_at": progress.due_at,
                },
                "session": {
                    "id": session.id,
                    "correct_answers": session.correct_answers,
                    "total_questions": session.total_questions,
                    "ended_at": session.ended_at,
                },
                "today": {
                    "words_studied": activity.words_studied,
                    "words_mastered": activity.words_mastered,
                    "xp_earned": activity.xp_earned,
                },
            }
        )


class StudyHistoryView(APIView):
    def get(self, request):
        sessions = StudySession.objects.filter(user=request.user).order_by("-started_at")[:20]
        return Response(StudySessionSerializer(sessions, many=True).data)


class LearningLessonListView(APIView):
    def get(self, request):
        lessons = LearningLesson.objects.filter(is_active=True, track__is_active=True).order_by("track", "lesson_order")
        track_slug = request.query_params.get("track")
        if track_slug:
            lessons = lessons.filter(track__slug=track_slug)
        serializer = LearningLessonSerializer(lessons, many=True, context={"user": request.user})
        return Response(serializer.data)


class LessonQuizDetailView(APIView):
    def get(self, request, quiz_id):
        quiz = get_object_or_404(
            LessonQuiz.objects.prefetch_related("questions__choices"),
            id=quiz_id,
            is_active=True,
            lesson__is_active=True,
            lesson__track__is_active=True,
        )
        return Response(LessonQuizSerializer(quiz).data)


class LessonQuizSubmitView(APIView):
    def post(self, request, quiz_id):
        quiz = get_object_or_404(
            LessonQuiz.objects.prefetch_related("questions__choices"),
            id=quiz_id,
            is_active=True,
            lesson__is_active=True,
            lesson__track__is_active=True,
        )

        payload = QuizSubmitInputSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        answers = payload.validated_data["answers"]

        question_map = {q.id: q for q in quiz.questions.all()}
        total_possible_points = sum(q.points for q in question_map.values())
        total_questions = len(question_map)

        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            total_questions=total_questions,
        )

        gained_points = 0
        correct_answers = 0

        for answer in answers:
            question = question_map.get(answer["question_id"])
            if not question:
                continue

            selected_choice = None
            text_answer = answer.get("text_answer", "")
            is_correct = False

            if question.question_type == "mcq":
                selected_choice_id = answer.get("selected_choice_id")
                if selected_choice_id:
                    selected_choice = question.choices.filter(id=selected_choice_id).first()
                    is_correct = bool(selected_choice and selected_choice.is_correct)
            else:
                is_correct = _is_correct_text_answer(text_answer, question.accepted_answer)

            points_awarded = question.points if is_correct else 0
            gained_points += points_awarded
            if is_correct:
                correct_answers += 1

            QuizAnswer.objects.create(
                attempt=attempt,
                question=question,
                selected_choice=selected_choice,
                text_answer=text_answer,
                is_correct=is_correct,
                points_awarded=points_awarded,
            )

        score = round((gained_points / total_possible_points) * 100, 2) if total_possible_points else 0.0
        passed = score >= quiz.pass_score

        attempt.score = score
        attempt.passed = passed
        attempt.correct_answers = correct_answers
        attempt.completed_at = timezone.now()
        attempt.save(update_fields=["score", "passed", "correct_answers", "completed_at"])

        lesson = quiz.lesson
        progress, _ = UserLessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={"learned_words": 0, "mastered_words": 0},
        )
        progress.learned_words = max(progress.learned_words, min(lesson.total_words, int(lesson.total_words * (score / 100))))
        if passed:
            progress.mastered_words = max(progress.mastered_words, int(progress.learned_words * 0.7))
        progress.last_studied_at = timezone.now()
        progress.save(update_fields=["learned_words", "mastered_words", "last_studied_at", "updated_at"])

        activity, _ = DailyActivity.objects.get_or_create(
            user=request.user,
            date=timezone.localdate(),
            defaults={"words_studied": 0, "words_mastered": 0, "xp_earned": 0},
        )
        DailyActivity.objects.filter(pk=activity.pk).update(
            xp_earned=F("xp_earned") + (100 if passed else 40),
            words_studied=F("words_studied") + max(1, total_questions // 2),
        )

        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)


class RecommendationNextView(APIView):
    def get(self, request):
        user = request.user
        due_reviews = UserWordProgress.objects.filter(user=user, due_at__lte=timezone.now()).count()
        weak_tags = _compute_weak_tags(user)
        next_lesson, path, reason = _select_next_lesson(user)

        response = {
            "due_review_count": due_reviews,
            "weak_tags": weak_tags[:5],
            "learning_path": UserLearningPathSerializer(path).data if path else None,
            "next_lesson": LearningLessonSerializer(next_lesson, context={"user": user}).data if next_lesson else None,
            "reason": reason,
        }
        return Response(response)


class ProgressOverviewView(APIView):
    def get(self, request):
        user = request.user
        today = timezone.localdate()
        start_date = today - timedelta(days=29)

        activities = (
            DailyActivity.objects.filter(user=user, date__gte=start_date, date__lte=today)
            .order_by("date")
        )
        heatmap = [
            {
                "date": item.date.isoformat(),
                "words_studied": item.words_studied,
                "words_mastered": item.words_mastered,
                "xp_earned": item.xp_earned,
            }
            for item in activities
        ]

        weak_tags = _compute_weak_tags(user)
        recent_attempts = QuizAttempt.objects.filter(user=user).order_by("-started_at")[:10]

        return Response(
            {
                "heatmap": heatmap,
                "weak_tags": weak_tags,
                "recent_quiz_attempts": QuizAttemptSerializer(recent_attempts, many=True).data,
            }
        )
