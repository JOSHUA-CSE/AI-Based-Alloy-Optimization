from rest_framework.decorators import api_view
from rest_framework.response import Response
import numpy as np
import logging
import os, json, traceback
from pathlib import Path
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
from .models import ManagerDecision, MachineLog, PreviousRun

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
    what_if_element_variation,
    compare_compositions,
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
        logger.info("API INPUT received")

        try:
            comp = np.array([float(data.get(col, 0)) if data.get(col) else 0 for col in columns])
        except (ValueError, TypeError) as e:
            logger.error("Input parsing error: %s", e)
            return Response({"error": "Invalid input values. All values must be numeric."}, status=400)

        if len(comp) == 0 or np.all(comp == 0):
            return Response({"error": "Please enter at least one element composition value."}, status=400)

        input_sum = np.sum(comp)
        normalization_warning = None
        if input_sum > 110:
            normalization_warning = f"Total composition was {input_sum:.1f}%. Values have been normalized to 100%."

        comp = normalize(comp)
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
            "grade_matching": {"match": grade_name, "confidence": grade_similarity},
            "optimization": {
                "new_strength": optimized_strength,
                "new_melting_temp": optimized_melting_temp,
                "composition": {k: round(float(v), 2) for k, v in zip(columns, optimized_comp.tolist())}
            },
            "deviation_score": deviation
        }

        run = PreviousRun(
            composition=normalized_composition,
            composition_total=100.0,
            strength_prediction=original_strength,
            melting_temp_prediction=original_melting_temp,
            confidence=int(original_conf),
            run_type='single',
            full_response=response_data
        )
        run.save()

        return Response(response_data)

    except Exception as e:
        logger.error("predict_alloy error: %s", traceback.format_exc())
        return Response({"error": f"Internal server error: {str(e)}"}, status=500)


@csrf_exempt
def chat(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    if not GROQ_AVAILABLE:
        return JsonResponse({"error": "groq package not installed. Run: pip install groq"}, status=500)

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY not configured")
        return JsonResponse({"error": "GROQ_API_KEY not configured on server."}, status=500)

    try:
        body = request.body.decode("utf-8")
        if not body:
            return JsonResponse({"error": "Empty body"}, status=400)
        data = json.loads(body)
    except json.JSONDecodeError as e:
        return JsonResponse({"error": f"Invalid JSON body: {str(e)}"}, status=400)

    messages = data.get("messages", [])[-6:]
    logger.info("Chat: %d message(s) received", len(messages))

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are an expert alloy materials assistant. Help users understand alloy compositions, properties, predictions, and material science. Be concise and accurate."},
                *messages
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        reply = response.choices[0].message.content
        logger.info("Groq response received, length: %d chars", len(reply))
        return JsonResponse({"reply": reply})

    except Exception as e:
        logger.error("Groq API error: %s", traceback.format_exc())
        return JsonResponse({"error": "Failed to get response from AI service."}, status=500)


@api_view(['POST'])
@csrf_exempt
def manager_decision(request):
    try:
        data = request.data
        input_composition = data.get('input_composition')
        ai_prediction = data.get('ai_prediction')
        ai_recommendation = data.get('ai_recommendation')
        changes = data.get('changes')
        final_values = data.get('final_values')
        decision = data.get('decision')
        notes = data.get('notes', '')

        if changes and isinstance(changes, list):
            final_values = {c.get('element'): c.get('final') for c in changes}

        if not all([input_composition, ai_prediction, ai_recommendation, final_values, decision]):
            return Response({'error': 'Missing required fields'}, status=400)

        if decision not in ['approved', 'rejected']:
            return Response({'error': 'Decision must be "approved" or "rejected"'}, status=400)

        decision_doc = ManagerDecision(
            input_composition=input_composition,
            ai_prediction=ai_prediction,
            ai_recommendation=ai_recommendation,
            final_values=final_values,
            decision=decision,
            notes=notes,
            timestamp=datetime.utcnow()
        )
        decision_doc.save()

        if decision == 'approved':
            machine_log = MachineLog(
                manager_decision_id=str(decision_doc.id),
                composition=final_values,
                status='sent',
                response={
                    'status': 'success',
                    'message': 'Composition sent to machine',
                    'timestamp': datetime.utcnow().isoformat()
                },
                updated_at=datetime.utcnow()
            )
            machine_log.save()

            return Response({
                'success': True,
                'message': 'Decision approved and sent to machine',
                'decision_id': str(decision_doc.id),
                'machine_log_id': str(machine_log.id)
            }, status=201)

        return Response({
            'success': True,
            'message': 'Decision rejected and logged',
            'decision_id': str(decision_doc.id)
        }, status=201)

    except Exception as e:
        logger.error("Manager decision error: %s", traceback.format_exc())
        return Response({'error': f'Error processing decision: {str(e)}'}, status=500)


@api_view(['GET'])
def get_history(request):
    try:
        decision_filter = request.GET.get('decision')
        limit = int(request.GET.get('limit', 50))

        query = ManagerDecision.objects.all()
        if decision_filter:
            query = query.filter(decision=decision_filter)

        decisions = query[:limit]

        history = [{
            'id': str(d.id),
            'timestamp': d.timestamp.isoformat(),
            'decision': d.decision,
            'input_summary': d.input_composition,
            'prediction': {
                'strength': d.ai_prediction.get('strength'),
                'melting_temp': d.ai_prediction.get('melting_temp'),
                'confidence': d.ai_prediction.get('confidence')
            },
            'has_machine_log': MachineLog.objects.filter(manager_decision_id=str(d.id)).count() > 0
        } for d in decisions]

        return Response({'success': True, 'count': len(history), 'history': history})

    except Exception as e:
        logger.error("History fetch error: %s", traceback.format_exc())
        return Response({'error': f'Error fetching history: {str(e)}'}, status=500)


@api_view(['GET'])
def get_decision_detail(request, decision_id):
    try:
        decision = ManagerDecision.objects.get(id=decision_id)

        machine_log = None
        ml = MachineLog.objects.filter(manager_decision_id=str(decision.id)).first()
        if ml:
            machine_log = {
                'id': str(ml.id),
                'status': ml.status,
                'timestamp': ml.timestamp.isoformat(),
                'response': ml.response,
                'error': ml.error
            }

        return Response({
            'success': True,
            'id': str(decision.id),
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
        return Response({'error': 'Decision not found'}, status=404)
    except Exception as e:
        logger.error("Decision detail error: %s", traceback.format_exc())
        return Response({'error': f'Error fetching decision: {str(e)}'}, status=500)


@api_view(['GET'])
def get_statistics(request):
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
        logger.error("Statistics error: %s", traceback.format_exc())
        return Response({'error': f'Error fetching statistics: {str(e)}'}, status=500)


@api_view(['POST'])
def compare_alloys(request):
    try:
        data = request.data
        compositions_dict = data.get('compositions', [])
        comparison_name = data.get('comparison_name', f'Comparison - {datetime.utcnow().isoformat()}')

        if not compositions_dict or len(compositions_dict) < 2:
            return Response({'error': 'Please provide at least 2 compositions for comparison'}, status=400)

        compositions_array = []
        for i, comp_dict in enumerate(compositions_dict):
            try:
                comp = np.array([float(comp_dict.get(col, 0)) if comp_dict.get(col) else 0 for col in columns])
            except (ValueError, TypeError) as e:
                return Response({'error': f'Invalid values in composition {i+1}.'}, status=400)

            if np.all(comp == 0):
                return Response({'error': f'Composition {i+1} has no elements.'}, status=400)

            compositions_array.append(normalize(comp))

        comparison_results = compare_compositions(compositions_array)

        for result in comparison_results['results']:
            run = PreviousRun(
                composition=result['composition'],
                composition_total=100.0,
                strength_prediction=result['strength'],
                melting_temp_prediction=result['melting_temp'],
                confidence=result['confidence'],
                run_type='comparison',
                analysis_name=comparison_name,
                full_response=result
            )
            run.save()

        return Response({'success': True, 'comparison_name': comparison_name, 'comparison': comparison_results})

    except Exception as e:
        logger.error("Comparison error: %s", traceback.format_exc())
        return Response({'error': f'Error in comparison: {str(e)}'}, status=500)


@api_view(['POST'])
def what_if_scenario(request):
    try:
        data = request.data
        composition_dict = data.get('composition')
        element_name = data.get('element_name')
        variation_percentage = float(data.get('variation_percentage', 1.0))
        num_steps = int(data.get('num_steps', 21))
        scenario_name = data.get('scenario_name', f'What-If: {element_name} variation')

        if not composition_dict or not element_name:
            return Response({'error': 'Missing required fields: composition, element_name'}, status=400)

        if element_name not in columns:
            return Response({'error': f'Element "{element_name}" not found.'}, status=400)

        try:
            comp = np.array([float(composition_dict.get(col, 0)) if composition_dict.get(col) else 0 for col in columns])
        except (ValueError, TypeError) as e:
            return Response({'error': 'Invalid input values.'}, status=400)

        if np.all(comp == 0):
            return Response({'error': 'Please enter at least one element composition value.'}, status=400)

        comp = normalize(comp)
        scenario_results = what_if_element_variation(comp, element_name, variation_percentage, num_steps)

        run = PreviousRun(
            composition={col: float(val) for col, val in zip(columns, comp.tolist())},
            composition_total=100.0,
            strength_prediction=scenario_results['baseline_strength'],
            melting_temp_prediction=scenario_results['baseline_melting_temp'],
            confidence=100,
            run_type='what_if',
            analysis_name=scenario_name,
            full_response=scenario_results
        )
        run.save()

        return Response({'success': True, 'scenario_name': scenario_name, 'scenario': scenario_results})

    except Exception as e:
        logger.error("What-if scenario error: %s", traceback.format_exc())
        return Response({'error': f'Error in what-if scenario: {str(e)}'}, status=500)
