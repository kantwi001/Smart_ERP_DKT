from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count
from .models import Survey, SurveyQuestion, SurveyResponse, SurveyAnswer
from .serializers import SurveySerializer, SurveyQuestionSerializer, SurveyResponseSerializer

class SurveyListCreateView(generics.ListCreateAPIView):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Survey.objects.filter(created_by=self.request.user).order_by('-created_at')

class SurveyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    permission_classes = [permissions.IsAuthenticated]

class SurveyQuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = SurveyQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        survey_id = self.kwargs.get('survey_id')
        return SurveyQuestion.objects.filter(survey_id=survey_id)

class SurveyResponseListView(generics.ListAPIView):
    serializer_class = SurveyResponseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        survey_id = self.kwargs.get('survey_id')
        return SurveyResponse.objects.filter(survey_id=survey_id).order_by('-submitted_at')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def survey_stats(request):
    """Get survey statistics for dashboard"""
    user_surveys = Survey.objects.filter(created_by=request.user)
    total_surveys = user_surveys.count()
    published_surveys = user_surveys.filter(status='published').count()
    total_responses = SurveyResponse.objects.filter(survey__created_by=request.user).count()
    
    # Survey status distribution
    status_stats = user_surveys.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Recent activity
    recent_surveys = user_surveys.order_by('-created_at')[:5].values(
        'id', 'title', 'status', 'created_at'
    )
    
    recent_responses = SurveyResponse.objects.filter(
        survey__created_by=request.user
    ).select_related('survey').order_by('-submitted_at')[:10].values(
        'id', 'survey__title', 'respondent_email', 'submitted_at', 'is_complete'
    )
    
    return Response({
        'total_surveys': total_surveys,
        'published_surveys': published_surveys,
        'draft_surveys': user_surveys.filter(status='draft').count(),
        'total_responses': total_responses,
        'status_distribution': list(status_stats),
        'recent_surveys': list(recent_surveys),
        'recent_responses': list(recent_responses)
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_survey(request):
    """Create a new survey"""
    serializer = SurveySerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        survey = serializer.save()
        return Response({
            'message': 'Survey created successfully',
            'survey': SurveySerializer(survey).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_question(request):
    """Add a question to a survey"""
    serializer = SurveyQuestionSerializer(data=request.data)
    if serializer.is_valid():
        question = serializer.save()
        return Response({
            'message': 'Question added successfully',
            'question': SurveyQuestionSerializer(question).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
