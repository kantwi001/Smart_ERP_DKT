from django.db import models

class Survey(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class SurveyQuestion(models.Model):
    QUESTION_TYPES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('select', 'Select'),
        ('gps', 'GPS'),
        ('photo', 'Photo'),
    ]
    survey = models.ForeignKey(Survey, related_name='questions', on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    options = models.TextField(blank=True, help_text='Comma-separated options for select type')
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.text

class SurveyResponse(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

class SurveyAnswer(models.Model):
    response = models.ForeignKey(SurveyResponse, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(SurveyQuestion, on_delete=models.CASCADE)
    answer_text = models.TextField(blank=True)
    answer_number = models.FloatField(null=True, blank=True)
    answer_gps = models.CharField(max_length=100, blank=True)
    answer_photo = models.ImageField(upload_to='survey_photos/', null=True, blank=True)

class Route(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class RouteStop(models.Model):
    route = models.ForeignKey(Route, related_name='stops', on_delete=models.CASCADE)
    order = models.PositiveIntegerField()
    name = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    arrival_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.route.name} Stop {self.order}: {self.name}"

class RouteAssignment(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

class Report(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField()
