from django.contrib import admin
from .models import ManagerDecision, MachineLog, PreviousRun


@admin.register(ManagerDecision)
class ManagerDecisionAdmin(admin.ModelAdmin):
    list_display = ('id', 'decision', 'timestamp')
    list_filter = ('decision', 'timestamp')
    search_fields = ('id',)
    readonly_fields = ('timestamp',)


@admin.register(MachineLog)
class MachineLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'status', 'timestamp', 'updated_at')
    list_filter = ('status', 'timestamp')
    search_fields = ('id',)
    readonly_fields = ('timestamp', 'updated_at')


@admin.register(PreviousRun)
class PreviousRunAdmin(admin.ModelAdmin):
    list_display = ('id', 'run_type', 'analysis_name', 'timestamp')
    list_filter = ('run_type', 'timestamp')
    search_fields = ('analysis_name', 'id')
    readonly_fields = ('timestamp',)
    fieldsets = (
        ('Identification', {
            'fields': ('id', 'run_type', 'analysis_name', 'timestamp'),
        }),
        ('Composition', {
            'fields': ('composition', 'composition_total'),
        }),
        ('Predictions', {
            'fields': ('strength_prediction', 'melting_temp_prediction', 'confidence'),
        }),
        ('Full Response', {
            'fields': ('full_response',),
            'classes': ('collapse',),
        }),
    )
