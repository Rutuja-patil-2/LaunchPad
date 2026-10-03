from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('placement', '0004_company_is_verified_drive_is_verified'),
    ]

    operations = [
        migrations.AddField(
            model_name='drive',
            name='drive_type',
            field=models.CharField(
                choices=[('placement', 'Placement'), ('internship', 'Internship')],
                default='placement',
                max_length=20,
            ),
        ),
    ]