from rest_framework.decorators import api_view
from rest_framework.response import Response
import numpy as np
import logging
import os, json, traceback
from pathlib import Path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from dotenv import load_dotenv
from .models import ManagerDecision, MachineLog

# Explicitly load .env from the backend root (where manage.py lives)
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

from .ml.predictor import (
    predict_with_confidence,
    recommend_changes,
    root_cause_analysis,
    what_if_analysis,
    match_grade,
    risk_analysis,
    optimize,
    deviation_score,
    columns
)

logger = logging.getLogger(__name__)


def normalize(comp):
    total = np.sum(comp)
    if total == 0:
        return comp
    normalized = (comp / total) * 100
    normalized = np.round(normalized, 2)
    current_sum = np.sum(normalized)
    if abs(current_sum - 100.0) > 0.01:
        max_idx = np.argmax(normalized)
        adjustment = 100.0 - current_sum
        normalized[max_idx] = np.round(normalized[max_idx] + adjustment, 2)
    return normalized


@api_view(['POST'])
def predict_alloy(request):
    try:
        data = request.data
        logger.info(f"API INPUT: {data}")

        try:
            comp = np.array([float(data.get(col, 0)) if data.get(col) else 0 for col in columns])
        except (ValueError, TypeError) as e:
            logger.error(f"Input parsing error: {e}")
            return Response({
                "error": "Invalid input values. All values must be numeric.",
                "details": str(e)
            }, status=400)

        if len(comp) == 0 or np.all(comp == 0):
            return Response({"error": "Please enter at least one element composition value."}, status=400)

        input_sum = np.sum(comp)
        normalization_warning = None

        if input_sum > 110:
            normalization_warning = f"Total composition was {input_sum:.1f}%. Values have been normalized to 100%."
            logger.warning(f"Input exceeds 110%: {input_sum:.2f}%")

        comp = normalize(comp)
        logger.info(f"Normalized composition sum: {np.sum(comp):.2f}%")

        normalized_composition = {col: float(val) for col, val in zip(columns, comp.tolist())}

        original_pred, original_conf = predict_with_confidence(comp)
        original_strength = float(original_pred[0])
        original_melting_temp = float(original_pred[1])

        recommendations = recommend_changes(comp)
        root_cause = root_cause_analysis(comp)
        risk_alerts = risk_analysis(comp, data)
        what_if = what_if_analysis(comp)
        grade_name, grade_similarity = match_grade(comp)
        optimized_comp = optimize(comp)
        optimized_pred, optimized_conf = predict_with_confidence(optimized_comp)
        optimized_strength = float(optimized_pred[0])
        optimized_melting_temp = float(optimized_pred[1])
        deviation = deviation_score(comp, optimized_comp)

        response_data = {
            "original_composition": normalized_composition,
            "original_composition_total": round(float(np.sum(comp)), 2),
            "normalization_warning": normalization_warning,
            "prediction": {
                "material_type": "Custom Alloy",
                "predicted_grade": "Standard",
                "strength": original_strength,
                "melting_temp": original_melting_temp,
                "confidence": original_conf
            },
            "recommendations": recommendations,
            "root_cause": root_cause[:5],
            "risk_alerts": risk_alerts,
            "what_if": [item["summary"] for item in what_if],
            "what_if_detailed": what_if,
            "grade_matching": {
                "match": grade_name,
                "confidence": grade_similarity
            },
            "optimization": {
                "new_strength": optimized_strength,
                "new_melting_temp": optimized_melting_temp,
                "composition": {k: round(float(v), 2) for k, v in zip(columns, optimized_comp.tolist())}
            },
            "deviation_score": deviation
        }

        logger.info(f"API OUTPUT: {response_data}")
        return Response(response_data)

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        logger.error(f"API ERROR: {error_msg}")
        return Response({
            "error": f"Internal server error: {str(e)}",
            "details": error_msg
        }, status=500)


@csrf_exempt
def chat(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        body = request.body.decode("utf-8")
        print("RAW BODY:", body)

        if not body:
            return JsonResponse({"error": "Empty body"}, status=400)

        data = json.loads(body)
        print("PARSED:", data)

        user_message = data.get("message")
        if not user_message:
            return JsonResponse({"error": "Missing 'message'"}, status=400)

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return JsonResponse({"error": "GROQ_API_KEY missing"}, status=500)

        from groq import Groq
        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": user_message}]
        )

        reply = response.choices[0].message.content

        return JsonResponse({"reply": reply})

    except Exception as e:
        print("FULL ERROR:", traceback.format_exc())
        return JsonResponse({
            "error": str(e),
            "trace": traceback.format_exc()
        }, status=500)


# ============================================
# MANAGER DECISION SYSTEM
# ============================================

@api_view(['POST'])
@csrf_exempt
def manager_decision(request):
    """Handle manager approval/rejection of recommendations"""
    try:
        data = request.data
        
        # Extract data
        input_composition = data.get('input_composition')
        ai_prediction = data.get('ai_prediction')
        ai_recommendation = data.get('ai_recommendation')
        changes = data.get('changes')  # New format: array of changes
        final_values = data.get('final_values')  # Legacy format
        decision = data.get('decision')  # 'approved' or 'rejected'
        notes = data.get('notes', '')
        
        # Build final_values from changes if provided
        if changes and isinstance(changes, list):
            final_values = {}
            for change in changes:
                final_values[change.get('element')] = change.get('final')
        
        if not all([input_composition, ai_prediction, ai_recommendation, final_values, decision]):
            return Response({
                'error': 'Missing required fields: input_composition, ai_prediction, ai_recommendation, (changes or final_values), decision'
            }, status=400)
        
        if decision not in ['approved', 'rejected']:
            return Response({
                'error': 'Decision must be "approved" or "rejected"'
            }, status=400)
        
        # Create decision record
        manager_decision = ManagerDecision.objects.create(
            input_composition=input_composition,
            ai_prediction=ai_prediction,
            ai_recommendation=ai_recommendation,
            final_values=final_values,
            decision=decision,
            notes=notes,
            timestamp=timezone.now()
        )
        
        # If approved, trigger machine and create machine log
        if decision == 'approved':
            machine_log = MachineLog.objects.create(
                manager_decision=manager_decision,
                composition=final_values,
                status='pending'
            )
            
            # In production, call actual machine API here
            # For now, simulate successful send
            machine_log.status = 'sent'
            machine_log.response = {
                'status': 'success',
                'message': 'Composition sent to machine',
                'timestamp': timezone.now().isoformat()
            }
            machine_log.save()
            
            return Response({
                'success': True,
                'message': 'Decision approved and sent to machine',
                'decision_id': manager_decision.id,
                'machine_log_id': machine_log.id
            }, status=201)
        else:
            return Response({
                'success': True,
                'message': 'Decision rejected and logged',
                'decision_id': manager_decision.id
            }, status=201)
    
    except Exception as e:
        logger.error(f"Manager decision error: {traceback.format_exc()}")
        return Response({
            'error': f'Error processing decision: {str(e)}'
        }, status=500)


@api_view(['GET'])
def get_history(request):
    """Get all manager decisions with optional filtering"""
    try:
        # Get filter parameters
        decision_filter = request.GET.get('decision')  # 'approved' or 'rejected'
        limit = int(request.GET.get('limit', 50))
        
        # Query decisions
        query = ManagerDecision.objects.all()
        
        if decision_filter:
            query = query.filter(decision=decision_filter)
        
        decisions = query[:limit]
        
        # Format response
        history = []
        for d in decisions:
            history.append({
                'id': d.id,
                'timestamp': d.timestamp.isoformat(),
                'decision': d.decision,
                'input_summary': d.input_composition,
                'prediction': {
                    'strength': d.ai_prediction.get('strength'),
                    'melting_temp': d.ai_prediction.get('melting_temp'),
                    'confidence': d.ai_prediction.get('confidence')
                },
                'has_machine_log': hasattr(d, 'machine_log')
            })
        
        return Response({
            'success': True,
            'count': len(history),
            'history': history
        })
    
    except Exception as e:
        logger.error(f"History fetch error: {traceback.format_exc()}")
        return Response({
            'error': f'Error fetching history: {str(e)}'
        }, status=500)


@api_view(['GET'])
def get_decision_detail(request, decision_id):
    """Get full details of a specific decision"""
    try:
        decision = ManagerDecision.objects.get(id=decision_id)
        
        machine_log = None
        if hasattr(decision, 'machine_log'):
            ml = decision.machine_log
            machine_log = {
                'id': ml.id,
                'status': ml.status,
                'timestamp': ml.timestamp.isoformat(),
                'response': ml.response,
                'error': ml.error
            }
        
        return Response({
            'success': True,
            'id': decision.id,
            'timestamp': decision.timestamp.isoformat(),
            'input_composition': decision.input_composition,
            'ai_prediction': decision.ai_prediction,
            'ai_recommendation': decision.ai_recommendation,
            'final_values': decision.final_values,
            'decision': decision.decision,
            'notes': decision.notes,
            'machine_log': machine_log
        })
    
    except ManagerDecision.DoesNotExist:
        return Response({
            'error': 'Decision not found'
        }, status=404)
    except Exception as e:
        logger.error(f"Decision detail error: {traceback.format_exc()}")
        return Response({
            'error': f'Error fetching decision: {str(e)}'
        }, status=500)


@api_view(['GET'])
def get_statistics(request):
    """Get statistics on manager decisions"""
    try:
        total = ManagerDecision.objects.count()
        approved = ManagerDecision.objects.filter(decision='approved').count()
        rejected = ManagerDecision.objects.filter(decision='rejected').count()
        
        return Response({
            'success': True,
            'total_decisions': total,
            'approved': approved,
            'rejected': rejected,
            'approval_rate': round((approved / total * 100) if total > 0 else 0, 2)
        })
    
    except Exception as e:
        logger.error(f"Statistics error: {traceback.format_exc()}")
        return Response({
            'error': f'Error fetching statistics: {str(e)}'
        }, status=500)