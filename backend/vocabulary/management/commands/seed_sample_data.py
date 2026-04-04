from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from vocabulary.models import (
    DailyActivity,
    DifficultyLevel,
    LearningGoal,
    LearningLesson,
    LearningLessonWord,
    LearningStatus,
    LearningTrack,
    LessonQuiz,
    PartOfSpeech,
    QuizAnswer,
    QuizAttempt,
    QuizChoice,
    QuizQuestion,
    QuizQuestionType,
    SessionMode,
    StudyAttempt,
    StudyDeck,
    StudyDeckItem,
    StudySession,
    Topic,
    TrackGroup,
    UserFavoriteWord,
    UserFavoriteLesson,
    UserLearningPath,
    UserLessonProgress,
    UserProfile,
    UserWordProgress,
    VocabularyWord,
    WordExample,
    WordMeaning,
)


SAMPLE_TOPICS = [
    {"name": "Family", "slug": "family", "description": "Words about family members and relationships"},
    {"name": "School", "slug": "school", "description": "Words for school life and education"},
    {"name": "Work", "slug": "work", "description": "Words used at work and office"},
    {"name": "Travel", "slug": "travel", "description": "Words for transportation and travel plans"},
    {"name": "Health", "slug": "health", "description": "Words for body, fitness, and medical topics"},
    {"name": "Technology", "slug": "technology", "description": "Words for internet, devices, and software"},
]


BASE_WORDS = [
    ("achievement", "thanh tuu", PartOfSpeech.NOUN, DifficultyLevel.B1),
    ("schedule", "lich trinh", PartOfSpeech.NOUN, DifficultyLevel.A2),
    ("improve", "cai thien", PartOfSpeech.VERB, DifficultyLevel.A2),
    ("destination", "diem den", PartOfSpeech.NOUN, DifficultyLevel.B1),
    ("efficient", "hieu qua", PartOfSpeech.ADJECTIVE, DifficultyLevel.B1),
    ("device", "thiet bi", PartOfSpeech.NOUN, DifficultyLevel.A2),
    ("confident", "tu tin", PartOfSpeech.ADJECTIVE, DifficultyLevel.B1),
    ("deadline", "han chot", PartOfSpeech.NOUN, DifficultyLevel.B1),
    ("research", "nghien cuu", PartOfSpeech.NOUN, DifficultyLevel.B2),
    ("commute", "di lam", PartOfSpeech.VERB, DifficultyLevel.B1),
    ("booking", "dat cho", PartOfSpeech.NOUN, DifficultyLevel.A2),
    ("update", "cap nhat", PartOfSpeech.VERB, DifficultyLevel.A2),
    ("article", "bai bao", PartOfSpeech.NOUN, DifficultyLevel.A2),
    ("summary", "tom tat", PartOfSpeech.NOUN, DifficultyLevel.B1),
    ("present", "thuyet trinh", PartOfSpeech.VERB, DifficultyLevel.B1),
]


TRACK_BLUEPRINTS = [
    {
        "slug": "vocabulary-core",
        "title": "Tu vung thong dung 5000 tu",
        "description": "Hoc tu vung theo cap do tu de den trung cap",
        "track_group": TrackGroup.VOCABULARY,
        "target_level": DifficultyLevel.A2,
        "total_words": 5000,
        "total_lessons": 358,
        "sort_order": 1,
        "lessons": [
            ("voca-4981-5000", "VOCA 4981 - 5000", 90, 20, "vocabulary", "Hoc nhom tu vung thong dung cho giao tiep."),
            ("voca-4966-4980", "VOCA 4966 - 4980", 90, 20, "vocabulary", "Tap trung vao tu vung mo rong va vi du ngan."),
            ("voca-4951-4965", "VOCA 4951 - 4965", 90, 20, "vocabulary", "Ket hop nghe phat am va dat cau co ban."),
            ("voca-4936-4950", "VOCA 4936 - 4950", 90, 20, "vocabulary", "On tap nhanh voi mini quiz sau bai hoc."),
        ],
    },
    {
        "slug": "topic-vocabulary",
        "title": "Tu vung theo chu de 250 chu de",
        "description": "Tu vung theo boi canh su dung hang ngay",
        "track_group": TrackGroup.VOCABULARY,
        "target_level": DifficultyLevel.A2,
        "total_words": 2500,
        "total_lessons": 250,
        "sort_order": 2,
        "lessons": [
            ("topic-colors", "Chu de 1: Mau sac", 20, 18, "vocabulary", "Nhung tu vung mo ta mau sac thong dung."),
            ("topic-vegetables", "Chu de 2: Rau qua", 20, 18, "vocabulary", "Tu vung khi di cho va no i ve mon an."),
            ("topic-fruits", "Chu de 3: Trai cay", 20, 18, "vocabulary", "Tu vung ve trai cay va mo ta mui vi."),
            ("topic-bathroom", "Chu de 4: Nha tam", 20, 18, "vocabulary", "Tu vung sinh hoat hang ngay trong gia dinh."),
        ],
    },
    {
        "slug": "grammar-core",
        "title": "Ngu phap co ban den trung cap",
        "description": "On to be, thi co ban, cau dieu kien, bi dong",
        "track_group": TrackGroup.GRAMMAR,
        "target_level": DifficultyLevel.B1,
        "total_words": 0,
        "total_lessons": 80,
        "sort_order": 3,
        "lessons": [
            ("grammar-to-be", "Grammar 1: To be", 12, 15, "grammar", "Cong thuc va cach dung dong tu to be."),
            ("grammar-present-simple", "Grammar 2: Hien tai don", 12, 15, "grammar", "Cach dung thi hien tai don va dau hieu nhan biet."),
            ("grammar-present-perfect", "Grammar 3: Hien tai hoan thanh", 12, 20, "grammar", "So sanh hien tai don va hien tai hoan thanh."),
            ("grammar-conditional", "Grammar 4: Cau dieu kien", 12, 20, "grammar", "Dieu kien loai 1, 2, 3 va bai tap ap dung."),
        ],
    },
    {
        "slug": "skills-reading-writing",
        "title": "Ky nang Reading va Writing",
        "description": "Luyen doc hieu va viet cau theo mau",
        "track_group": TrackGroup.SKILLS,
        "target_level": DifficultyLevel.B1,
        "total_words": 0,
        "total_lessons": 40,
        "sort_order": 4,
        "lessons": [
            ("reading-main-idea", "Reading 1: Main Idea", 15, 25, "reading", "Doc doan ngan va chon y chinh cua doan van."),
            ("reading-detail", "Reading 2: Detail Question", 15, 25, "reading", "Tim thong tin chi tiet va suy luan tu van ban."),
            ("writing-sentence", "Writing 1: Build Sentences", 15, 20, "writing", "Sap xep tu thanh cau dung ngu phap."),
            ("writing-paragraph", "Writing 2: Short Paragraph", 15, 25, "writing", "Viet doan ngan theo cau truc mo ta su kien."),
        ],
    },
    {
        "slug": "toeic-foundation",
        "title": "TOEIC Foundation Track",
        "description": "Tu vung va dang bai co ban cho TOEIC",
        "track_group": TrackGroup.EXAM,
        "target_level": DifficultyLevel.B1,
        "total_words": 600,
        "total_lessons": 51,
        "sort_order": 5,
        "lessons": [
            ("toeic-contract", "TOEIC 1: Contract", 12, 20, "toeic", "Tu vung hop dong va dieu khoan co ban."),
            ("toeic-marketing", "TOEIC 2: Marketing", 12, 20, "toeic", "Tu vung ve marketing va quang cao."),
            ("toeic-warranties", "TOEIC 3: Warranties", 12, 20, "toeic", "Tu vung bao hanh, doi tra, dich vu khach hang."),
            ("toeic-business-plan", "TOEIC 4: Business Plan", 12, 20, "toeic", "Noi dung ke hoach kinh doanh co ban."),
        ],
    },
    {
        "slug": "ielts-foundation",
        "title": "IELTS Foundation Track",
        "description": "Bo tu vung va bai tap nen tang cho IELTS",
        "track_group": TrackGroup.EXAM,
        "target_level": DifficultyLevel.B2,
        "total_words": 900,
        "total_lessons": 89,
        "sort_order": 6,
        "lessons": [
            ("ielts-891-900", "IELTS 891-900", 60, 25, "ielts", "Tu vung chu de hoc thuat va giao duc."),
            ("ielts-881-890", "IELTS 881-890", 60, 25, "ielts", "Tu vung moi truong va cong nghe."),
            ("ielts-871-880", "IELTS 871-880", 60, 25, "ielts", "Tu vung kinh te va xa hoi."),
            ("ielts-861-870", "IELTS 861-870", 60, 25, "ielts", "Tu vung cho writing task 2 co ban."),
        ],
    },
]


class Command(BaseCommand):
    help = "Seed sample data for English Learning Hub: tracks, lessons, quizzes, progress, and demo user."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing sample data before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["clear"]:
            self._clear_data()

        user = self._seed_user()
        topics_by_name = self._seed_topics()
        words = self._seed_words(topics_by_name)
        quizzes = self._seed_learning_tracks(user, words)
        self._seed_deck_and_word_progress(user, words)
        self._seed_learning_path(user)
        self._seed_favorites(user, words)
        self._seed_favorite_lessons(user)
        self._seed_daily_activities(user)
        self._seed_quiz_attempt_history(user, quizzes)
        self._seed_study_session(user, words)

        self.stdout.write(self.style.SUCCESS("Seed complete."))
        self.stdout.write(f"- User: {user.username} / Demo12345!")
        self.stdout.write(f"- Topics: {Topic.objects.count()}")
        self.stdout.write(f"- Words: {VocabularyWord.objects.count()}")
        self.stdout.write(f"- Tracks: {LearningTrack.objects.count()}")
        self.stdout.write(f"- Lessons: {LearningLesson.objects.count()}")
        self.stdout.write(f"- Quizzes: {LessonQuiz.objects.count()}")
        self.stdout.write(f"- Quiz questions: {QuizQuestion.objects.count()}")

    def _clear_data(self):
        self.stdout.write(self.style.WARNING("Clearing old sample data..."))
        QuizAnswer.objects.all().delete()
        QuizAttempt.objects.all().delete()
        QuizChoice.objects.all().delete()
        QuizQuestion.objects.all().delete()
        LessonQuiz.objects.all().delete()
        StudyAttempt.objects.all().delete()
        StudySession.objects.all().delete()
        DailyActivity.objects.all().delete()
        UserFavoriteWord.objects.all().delete()
        UserFavoriteLesson.objects.all().delete()
        UserLearningPath.objects.all().delete()
        UserLessonProgress.objects.all().delete()
        UserWordProgress.objects.all().delete()
        LearningLessonWord.objects.all().delete()
        LearningLesson.objects.all().delete()
        LearningTrack.objects.all().delete()
        StudyDeckItem.objects.all().delete()
        StudyDeck.objects.all().delete()
        WordExample.objects.all().delete()
        WordMeaning.objects.all().delete()
        VocabularyWord.objects.all().delete()
        Topic.objects.all().delete()

    def _seed_user(self):
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username="demo_user",
            defaults={
                "email": "demo@example.com",
                "first_name": "Demo",
                "last_name": "User",
            },
        )
        user.set_password("Demo12345!")
        user.save(update_fields=["password"])

        UserProfile.objects.update_or_create(
            user=user,
            defaults={
                "daily_goal": 20,
                "current_level": DifficultyLevel.A2,
                "learning_goal": LearningGoal.FOUNDATION,
                "onboarding_completed": True,
                "streak_count": 6,
                "last_active_date": timezone.localdate(),
            },
        )
        return user

    def _seed_topics(self):
        topics_by_name = {}
        for topic_data in SAMPLE_TOPICS:
            topic, _ = Topic.objects.update_or_create(
                slug=topic_data["slug"],
                defaults={
                    "name": topic_data["name"],
                    "description": topic_data["description"],
                },
            )
            topics_by_name[topic.name] = topic
        return topics_by_name

    def _seed_words(self, topics_by_name):
        words = []

        for idx, (english_word, meaning_vi, pos, level) in enumerate(BASE_WORDS, start=1):
            word = self._upsert_word(
                english_word=english_word,
                primary_meaning=meaning_vi,
                part_of_speech=pos,
                difficulty_level=level,
                pronunciation=f"/sample-{idx}/",
            )
            words.append(word)

        for idx in range(1, 221):
            english_word = f"core_word_{idx:03d}"
            meaning_vi = f"nghia_mau_{idx:03d}"
            level = [DifficultyLevel.A1, DifficultyLevel.A2, DifficultyLevel.B1, DifficultyLevel.B2][idx % 4]
            pos = [PartOfSpeech.NOUN, PartOfSpeech.VERB, PartOfSpeech.ADJECTIVE, PartOfSpeech.ADVERB][idx % 4]
            word = self._upsert_word(
                english_word=english_word,
                primary_meaning=meaning_vi,
                part_of_speech=pos,
                difficulty_level=level,
                pronunciation=f"/generated-{idx}/",
            )
            words.append(word)

        topic_names = list(topics_by_name.keys())
        for idx, word in enumerate(words):
            related = [
                topics_by_name[topic_names[idx % len(topic_names)]],
                topics_by_name[topic_names[(idx + 2) % len(topic_names)]],
            ]
            word.topics.set(related)

        return words

    def _upsert_word(self, english_word, primary_meaning, part_of_speech, difficulty_level, pronunciation):
        word, _ = VocabularyWord.objects.update_or_create(
            english_word=english_word,
            defaults={
                "primary_meaning": primary_meaning,
                "pronunciation": pronunciation,
                "part_of_speech": part_of_speech,
                "difficulty_level": difficulty_level,
                "is_active": True,
            },
        )

        WordMeaning.objects.filter(word=word).delete()
        meaning = WordMeaning.objects.create(
            word=word,
            part_of_speech=part_of_speech,
            meaning_vi=primary_meaning,
            meaning_en=english_word,
            display_order=1,
        )

        WordExample.objects.filter(word=word).delete()
        WordExample.objects.create(
            word=word,
            meaning=meaning,
            sentence_en=f"I can use the word {english_word} in a simple sentence.",
            sentence_vi=f"Toi co the dung tu {primary_meaning} trong mot cau ngan.",
            source="seed",
        )
        return word

    def _seed_learning_tracks(self, user, words):
        quizzes = []
        cursor = 0

        for track_data in TRACK_BLUEPRINTS:
            track, _ = LearningTrack.objects.update_or_create(
                slug=track_data["slug"],
                defaults={
                    "title": track_data["title"],
                    "description": track_data["description"],
                    "track_group": track_data["track_group"],
                    "target_level": track_data["target_level"],
                    "total_words": track_data["total_words"],
                    "total_lessons": track_data["total_lessons"],
                    "sort_order": track_data["sort_order"],
                    "is_active": True,
                },
            )

            for order, lesson_data in enumerate(track_data["lessons"], start=1):
                slug, title, total_words, estimated_minutes, skill_focus, theory_content = lesson_data
                lesson, _ = LearningLesson.objects.update_or_create(
                    track=track,
                    slug=slug,
                    defaults={
                        "title": title,
                        "lesson_order": order,
                        "estimated_minutes": estimated_minutes,
                        "theory_content": theory_content,
                        "skill_focus": skill_focus,
                        "total_words": total_words,
                        "is_active": True,
                    },
                )

                if total_words > 0:
                    lesson_words = []
                    sample_count = min(15, max(8, total_words // 4))
                    for _ in range(sample_count):
                        lesson_words.append(words[cursor % len(words)])
                        cursor += 1
                else:
                    lesson_words = [words[(cursor + idx) % len(words)] for idx in range(12)]
                    cursor += 12

                LearningLessonWord.objects.filter(lesson=lesson).delete()
                for display_order, word in enumerate(lesson_words, start=1):
                    LearningLessonWord.objects.create(
                        lesson=lesson,
                        word=word,
                        display_order=display_order,
                    )

                UserLessonProgress.objects.update_or_create(
                    user=user,
                    lesson=lesson,
                    defaults={
                        "learned_words": 0,
                        "mastered_words": 0,
                        "last_studied_at": None,
                    },
                )

                quiz = self._seed_lesson_quiz(lesson, lesson_words)
                quizzes.append(quiz)

        return quizzes

    def _seed_lesson_quiz(self, lesson, lesson_words):
        quiz, _ = LessonQuiz.objects.update_or_create(
            lesson=lesson,
            title=f"Quiz: {lesson.title}",
            defaults={
                "pass_score": 60,
                "time_limit_seconds": 600,
                "is_active": True,
            },
        )

        QuizQuestion.objects.filter(quiz=quiz).delete()

        tag = lesson.skill_focus or lesson.track.track_group
        max_mcq = min(4, len(lesson_words))

        for index in range(max_mcq):
            correct_word = lesson_words[index]
            distractors = []
            pointer = index + 1
            while len(distractors) < 3 and pointer < len(lesson_words):
                candidate = lesson_words[pointer].primary_meaning
                if candidate != correct_word.primary_meaning and candidate not in distractors:
                    distractors.append(candidate)
                pointer += 1
            while len(distractors) < 3:
                distractors.append(f"lua_chon_nhieu_{index}_{len(distractors)}")

            question = QuizQuestion.objects.create(
                quiz=quiz,
                question_type=QuizQuestionType.MULTIPLE_CHOICE,
                prompt=f"Chon nghia dung cua tu '{correct_word.english_word}'",
                explanation=f"Nghia dung cua tu nay la '{correct_word.primary_meaning}'.",
                points=1,
                question_order=index + 1,
                tag=tag,
                accepted_answer="",
            )

            options = distractors + [correct_word.primary_meaning]
            for choice_order, content in enumerate(options, start=1):
                QuizChoice.objects.create(
                    question=question,
                    content=content,
                    is_correct=(content == correct_word.primary_meaning),
                    choice_order=choice_order,
                )

        fill_word = lesson_words[-1]
        QuizQuestion.objects.create(
            quiz=quiz,
            question_type=QuizQuestionType.FILL_BLANK,
            prompt=f"Dien tu tieng Anh cho nghia: '{fill_word.primary_meaning}'",
            explanation=f"Tu dung la '{fill_word.english_word}'.",
            points=1,
            question_order=max_mcq + 1,
            tag=tag,
            accepted_answer=fill_word.english_word,
        )

        cloze_word = lesson_words[0]
        cloze_prompt = (
            "Dien tu con thieu vao doan van sau:\n"
            "\"My teacher gave us a new keyword in class today. "
            "The best word to complete this sentence is ______.\""
        )
        QuizQuestion.objects.create(
            quiz=quiz,
            question_type=QuizQuestionType.FILL_BLANK,
            prompt=cloze_prompt,
            explanation=(
                f"Tu phu hop trong doan van la '{cloze_word.english_word}'. "
                "Ban can dua vao ngu canh cau de chon dung tu."
            ),
            points=2,
            question_order=max_mcq + 2,
            tag="reading" if lesson.skill_focus == "reading" else "vocabulary",
            accepted_answer=cloze_word.english_word,
        )

        return quiz

    def _seed_deck_and_word_progress(self, user, words):
        deck, _ = StudyDeck.objects.get_or_create(
            owner=user,
            title="Starter 30 Words",
            defaults={
                "description": "Starter deck for quick practice",
                "is_public": True,
            },
        )
        StudyDeckItem.objects.filter(deck=deck).delete()
        for idx, word in enumerate(words[:30], start=1):
            StudyDeckItem.objects.create(deck=deck, word=word, display_order=idx)

        now = timezone.now()
        for idx, word in enumerate(words[:45], start=1):
            status = LearningStatus.LEARNING
            if idx % 9 == 0:
                status = LearningStatus.MASTERED
            elif idx % 3 == 0:
                status = LearningStatus.REVIEW

            UserWordProgress.objects.update_or_create(
                user=user,
                word=word,
                defaults={
                    "status": status,
                    "interval_days": 1 + (idx % 7),
                    "repetition": idx % 6,
                    "correct_streak": max(0, (idx % 6) - 1),
                    "incorrect_streak": 0 if idx % 4 else 1,
                    "due_at": now + timedelta(days=(idx % 4) - 1),
                    "last_reviewed_at": now - timedelta(hours=idx % 12),
                },
            )

    def _seed_learning_path(self, user):
        UserLearningPath.objects.update_or_create(
            user=user,
            defaults={
                "current_level": DifficultyLevel.A2,
                "goal": LearningGoal.FOUNDATION,
                "duration_weeks": 8,
                "is_active": True,
            },
        )

    def _seed_favorites(self, user, words):
        UserFavoriteWord.objects.filter(user=user).delete()
        for word in words[:18]:
            UserFavoriteWord.objects.create(user=user, word=word)

    def _seed_favorite_lessons(self, user):
        UserFavoriteLesson.objects.filter(user=user).delete()
        lessons = LearningLesson.objects.filter(is_active=True, track__is_active=True).order_by("track__sort_order", "lesson_order")[:8]
        for lesson in lessons:
            UserFavoriteLesson.objects.create(user=user, lesson=lesson)

    def _seed_daily_activities(self, user):
        today = timezone.localdate()
        for offset in range(0, 30):
            date_obj = today - timedelta(days=offset)
            studied = (offset * 3) % 24
            mastered = min(studied // 3, studied)
            xp = studied * 8
            DailyActivity.objects.update_or_create(
                user=user,
                date=date_obj,
                defaults={
                    "words_studied": studied,
                    "words_mastered": mastered,
                    "xp_earned": xp,
                },
            )

    def _seed_quiz_attempt_history(self, user, quizzes):
        if not quizzes:
            return

        for index, quiz in enumerate(quizzes[:8], start=1):
            started_at = timezone.now() - timedelta(days=index)
            attempt = QuizAttempt.objects.create(
                user=user,
                quiz=quiz,
                total_questions=quiz.questions.count(),
                completed_at=started_at + timedelta(minutes=8),
            )
            attempt.started_at = started_at
            attempt.save(update_fields=["started_at"])

            correct_answers = 0
            gained_points = 0
            total_points = sum(question.points for question in quiz.questions.all())

            for question in quiz.questions.all():
                selected_choice = None
                text_answer = ""

                should_be_wrong = (index % 3 == 0 and question.tag in {"grammar", "writing"}) or (
                    index % 4 == 0 and question.tag == "reading"
                )
                is_correct = not should_be_wrong

                if question.question_type == QuizQuestionType.MULTIPLE_CHOICE:
                    if is_correct:
                        selected_choice = question.choices.filter(is_correct=True).first()
                    else:
                        selected_choice = question.choices.filter(is_correct=False).first()
                else:
                    text_answer = question.accepted_answer if is_correct else "wrong_text"

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

            score = round((gained_points / total_points) * 100, 2) if total_points else 0
            attempt.score = score
            attempt.correct_answers = correct_answers
            attempt.passed = score >= quiz.pass_score
            attempt.save(update_fields=["score", "correct_answers", "passed"])

    def _seed_study_session(self, user, words):
        session = StudySession.objects.create(
            user=user,
            mode=SessionMode.FLASHCARD,
            total_questions=6,
            correct_answers=4,
        )
        session.ended_at = session.started_at + timedelta(minutes=5)
        session.save(update_fields=["ended_at"])

        for idx, word in enumerate(words[:6], start=1):
            StudyAttempt.objects.create(
                session=session,
                user=user,
                word=word,
                is_correct=(idx % 3 != 0),
                response_text=word.primary_meaning if idx % 3 != 0 else "wrong answer",
                response_time_ms=2200 + idx * 250,
            )
