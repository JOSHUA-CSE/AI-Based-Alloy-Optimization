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
