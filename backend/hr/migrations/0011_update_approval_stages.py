# Generated migration to update approval stages to include CD

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hr', '0010_leaverequest_calculated_days'),
    ]

    operations = [
        migrations.AlterField(
            model_name='leaverequest',
            name='approval_stage',
            field=models.CharField(choices=[('hod', 'HOD'), ('hr', 'HR'), ('cd', 'CD'), ('complete', 'Complete')], default='hod', max_length=30),
        ),
        migrations.AlterField(
            model_name='performancereview',
            name='approval_stage',
            field=models.CharField(choices=[('hod', 'HOD'), ('hr', 'HR'), ('cd', 'CD'), ('complete', 'Complete')], default='hod', max_length=30),
        ),
    ]
