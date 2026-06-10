from mongoengine import Document, EmbeddedDocument, fields
from datetime import datetime


class ManagerDecision(Document):
    DECISION_CHOICES = ('approved', 'rejected')

    input_composition = fields.DictField(required=True)
    ai_prediction = fields.DictField(required=True)
    ai_recommendation = fields.DictField(required=True)
    final_values = fields.DictField(required=True)
    decision = fields.StringField(required=True, choices=DECISION_CHOICES)
    notes = fields.StringField(default='')
    timestamp = fields.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'manager_decisions',
        'ordering': ['-timestamp']
    }

    def __str__(self):
        return f"Decision {self.id} - {self.decision} ({self.timestamp})"


class MachineLog(Document):
    STATUS_CHOICES = ('pending', 'sent', 'completed', 'failed')

    manager_decision_id = fields.StringField(required=True)
    status = fields.StringField(default='pending', choices=STATUS_CHOICES)
    composition = fields.DictField(required=True)
    response = fields.DictField(default=None)
    error = fields.StringField(default='')
    timestamp = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'machine_logs',
        'ordering': ['-timestamp']
    }

    def __str__(self):
        return f"Machine Log {self.id} - {self.status}"


class PreviousRun(Document):
    RUN_TYPE_CHOICES = ('single', 'comparison', 'what_if')

    composition = fields.DictField(required=True)
    composition_total = fields.FloatField(default=100.0)
    strength_prediction = fields.FloatField(required=True)
    melting_temp_prediction = fields.FloatField(required=True)
    confidence = fields.IntField(default=0)
    run_type = fields.StringField(default='single', choices=RUN_TYPE_CHOICES)
    analysis_name = fields.StringField(default='')
    timestamp = fields.DateTimeField(default=datetime.utcnow)
    full_response = fields.DictField(default=None)

    meta = {
        'collection': 'previous_runs',
        'ordering': ['-timestamp']
    }

    def __str__(self):
        return f"Run {self.id} - {self.run_type} ({self.timestamp})"
