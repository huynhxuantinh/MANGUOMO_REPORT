from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    DashboardView,
    HealthCheckView,
    LearningLessonDetailView,
    LearningLessonListView,
    LearningPathSetupView,
    LearningPathView,
    LearningTrackDetailView,
    LearningTrackListView,
    LessonQuizDetailView,
    LessonQuizSubmitView,
    OnboardingPlacementView,
    ProgressOverviewView,
    RecommendationNextView,
    StudyAnswerView,
    StudyHistoryView,
    StudyStartView,
    UserProfileView,
    UserFavoriteWordDeleteView,
    UserFavoriteLessonDeleteView,
    UserFavoriteLessonListCreateView,
    UserFavoriteWordListCreateView,
    TopicViewSet,
    VocabularyWordViewSet,
    WordExampleViewSet,
    WordMeaningViewSet,
)

router = DefaultRouter()
router.register("topics", TopicViewSet, basename="topics")
router.register("words", VocabularyWordViewSet, basename="words")
router.register("meanings", WordMeaningViewSet, basename="meanings")
router.register("examples", WordExampleViewSet, basename="examples")

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("profile/me/", UserProfileView.as_view(), name="profile-me"),
    path("favorites/words/", UserFavoriteWordListCreateView.as_view(), name="favorite-words"),
    path("favorites/words/<int:word_id>/", UserFavoriteWordDeleteView.as_view(), name="favorite-word-delete"),
    path("favorites/lessons/", UserFavoriteLessonListCreateView.as_view(), name="favorite-lessons"),
    path("favorites/lessons/<int:lesson_id>/", UserFavoriteLessonDeleteView.as_view(), name="favorite-lesson-delete"),
    path("progress/overview/", ProgressOverviewView.as_view(), name="progress-overview"),
    path("recommendations/next/", RecommendationNextView.as_view(), name="recommend-next"),
    path("onboarding/placement/", OnboardingPlacementView.as_view(), name="onboarding-placement"),
    path("learning-path/setup/", LearningPathSetupView.as_view(), name="learning-path-setup"),
    path("learning-path/me/", LearningPathView.as_view(), name="learning-path-me"),
    path("learning/tracks/", LearningTrackListView.as_view(), name="learning-track-list"),
    path("learning/tracks/<slug:slug>/", LearningTrackDetailView.as_view(), name="learning-track-detail"),
    path("learning/lessons/", LearningLessonListView.as_view(), name="learning-lesson-list"),
    path("learning/lessons/<int:lesson_id>/", LearningLessonDetailView.as_view(), name="learning-lesson-detail"),
    path("quizzes/<int:quiz_id>/", LessonQuizDetailView.as_view(), name="lesson-quiz-detail"),
    path("quizzes/<int:quiz_id>/submit/", LessonQuizSubmitView.as_view(), name="lesson-quiz-submit"),
    path("study/start/", StudyStartView.as_view(), name="study-start"),
    path("study/sessions/<int:session_id>/answer/", StudyAnswerView.as_view(), name="study-answer"),
    path("study/history/", StudyHistoryView.as_view(), name="study-history"),
    path("", include(router.urls)),
]
