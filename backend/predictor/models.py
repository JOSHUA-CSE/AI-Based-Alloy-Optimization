from django.db import models
from django.utils import timezone

class ManagerDecision(models.Model):
    """Track all manager decisions for alloy compositions"""
    
    DECISION_CHOICES = [
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.AutoField(primary_key=True)
    
    # Input data
    input_composition = models.JSONField()
    
    # AI predictions and recommendations
    ai_prediction = models.JSONField()
    ai_recommendation = models.JSONField()
    
    # Manager's final decision
    final_values = models.JSONField()
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES)
    
    # Metadata
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Decision {self.id} - {self.decision} ({self.timestamp})"


class MachineLog(models.Model):
    """Track applications sent to machine/system"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    manager_decision = models.OneToOneField(ManagerDecision, on_delete=models.CASCADE, related_name='machine_log')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    composition = models.JSONField()
    response = models.JSONField(blank=True, null=True)
    error = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Machine Log {self.id} - {self.status}"


class PreviousRun(models.Model):
    """Store individual prediction runs for comparison and analysis"""
    
    RUN_TYPE_CHOICES = [
        ('single', 'Single Prediction'),
        ('comparison', 'Comparison'),
        ('what_if', 'What-If Scenario'),
    ]
    
    id = models.AutoField(primary_key=True)
    
    # Composition & Results
    composition = models.JSONField()  # Full 30-element composition
    composition_total = models.FloatField(default=100.0)
    
    # Predictions
    strength_prediction = models.FloatField()
    melting_temp_prediction = models.FloatField()
    confidence = models.IntegerField(default=0)
    
    # Metadata
    run_type = models.CharField(max_length=20, choices=RUN_TYPE_CHOICES, default='single')
    analysis_name = models.CharField(max_length=200, blank=True, null=True)  # e.g., "Comparison: Alloy A vs B"
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Store full prediction response for reference
    full_response = models.JSONField(blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Run {self.id} - {self.run_type} ({self.timestamp})"
