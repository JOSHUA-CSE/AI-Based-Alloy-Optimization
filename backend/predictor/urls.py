from django.urls import path
from .views import (
    predict_alloy,
    chat,
    manager_decision,
    get_history,
    get_decision_detail,
    get_statistics,
    compare_alloys,
    what_if_scenario
)

urlpatterns = [
    path('predict/', predict_alloy),
    path('chat/', chat),
    path('manager-decision/', manager_decision),
    path('history/', get_history),
    path('history/<int:decision_id>/', get_decision_detail),
    path('statistics/', get_statistics),
    path('compare/', compare_alloys),
    path('what-if/', what_if_scenario),
]
