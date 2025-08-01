from django.urls import path
from .views import (
    SurveyListCreateView, SurveyDetailView, SurveyQuestionListCreateView,
    SurveyResponseListView, survey_stats, create_survey, add_question
)

urlpatterns = [
    path('', SurveyListCreateView.as_view(), name='survey-list-create'),
    path('<int:pk>/', SurveyDetailView.as_view(), name='survey-detail'),
    path('<int:survey_id>/questions/', SurveyQuestionListCreateView.as_view(), name='survey-question-list-create'),
    path('<int:survey_id>/responses/', SurveyResponseListView.as_view(), name='survey-response-list'),
    path('stats/', survey_stats, name='survey-stats'),
    path('create/', create_survey, name='create-survey'),
    path('questions/add/', add_question, name='add-question'),
]
