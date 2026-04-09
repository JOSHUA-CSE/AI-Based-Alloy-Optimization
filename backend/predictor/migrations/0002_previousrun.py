# Generated migration for PreviousRun model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('predictor', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PreviousRun',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('composition', models.JSONField()),
                ('composition_total', models.FloatField(default=100.0)),
                ('strength_prediction', models.FloatField()),
                ('melting_temp_prediction', models.FloatField()),
                ('confidence', models.IntegerField(default=0)),
                ('run_type', models.CharField(choices=[('single', 'Single Prediction'), ('comparison', 'Comparison'), ('what_if', 'What-If Scenario')], default='single', max_length=20)),
                ('analysis_name', models.CharField(blank=True, max_length=200, null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('full_response', models.JSONField(blank=True, null=True)),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
    ]
