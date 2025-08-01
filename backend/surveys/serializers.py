from rest_framework import serializers
from .models import Survey, SurveyQuestion, SurveyResponse, SurveyAnswer
from users.serializers import UserSerializer

class SurveyQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyQuestion
        fields = ['id', 'question_text', 'question_type', 'options', 'is_required', 'order', 'created_at']

class SurveySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    question_count = serializers.SerializerMethodField()
    response_count = serializers.SerializerMethodField()
    questions = SurveyQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Survey
        fields = ['id', 'title', 'description', 'status', 'created_by', 'created_by_name', 'target_audience', 
                 'start_date', 'end_date', 'is_anonymous', 'question_count', 'response_count', 'questions', 
                 'created_at', 'updated_at']
        read_only_fields = ['created_by']
    
    def get_question_count(self, obj):
        return obj.questions.count()
    
    def get_response_count(self, obj):
        return obj.responses.count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class SurveyAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyAnswer
        fields = ['id', 'question', 'answer_text', 'answer_choice', 'answer_rating', 'created_at']

class SurveyResponseSerializer(serializers.ModelSerializer):
    respondent_name = serializers.CharField(source='respondent.username', read_only=True)
    answers = SurveyAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = SurveyResponse
        fields = ['id', 'survey', 'respondent', 'respondent_name', 'respondent_email', 'ip_address', 
                 'submitted_at', 'is_complete', 'answers']
