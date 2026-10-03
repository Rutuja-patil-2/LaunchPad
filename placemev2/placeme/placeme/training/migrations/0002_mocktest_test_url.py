from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('training', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='mocktest',
            name='test_url',
            field=models.URLField(blank=True, null=True),
        ),
    ]
