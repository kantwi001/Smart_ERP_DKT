# Generated migration to add calculated_days field to LeaveRequest

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hr', '0009_trainingsession_created_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='leaverequest',
            name='calculated_days',
            field=models.PositiveIntegerField(default=0, help_text='Number of working days calculated for this request'),
        ),
    ]
