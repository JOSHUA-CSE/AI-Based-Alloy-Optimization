from django.urls import path
from .views import (
    predict_alloy,
    chat,
    manager_decision,
    get_history,
    get_decision_detail,
    get_statistics,
    compare_alloys,
    what_if_scenario,
    read_opcua_composition,
    predict_alloy_from_opcua,
)

urlpatterns = [
    path('predict/', predict_alloy),
    path('predict/opcua/', predict_alloy_from_opcua),
    path('opcua/read/', read_opcua_composition),
    path('chat/', chat),
    path('manager-decision/', manager_decision),
    path('history/', get_history),
    path('history/<int:decision_id>/', get_decision_detail),
    path('statistics/', get_statistics),
    path('compare/', compare_alloys),
    path('what-if/', what_if_scenario),
]
