# Generated migration to add approval stages to procurement

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('procurement', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='procurementrequest',
            name='approval_stage',
            field=models.CharField(choices=[('dept', 'Department'), ('procurement', 'Procurement'), ('finance', 'Finance'), ('complete', 'Complete')], default='dept', max_length=30),
        ),
        migrations.AddField(
            model_name='procurementrequest',
            name='approver',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
    ]
