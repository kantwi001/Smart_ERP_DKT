from django.db import models

class WorkOrder(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default='scheduled')
    notes = models.TextField(blank=True)
