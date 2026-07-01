from prometheus_client import Gauge, Counter

# Cloud Resources
cloud_resources_total = Gauge(
    "cloud_resources_total",
    "Total cloud resources"
)

# Incidents
incidents_total = Gauge(
    "incidents_total",
    "Total incidents"
)

# Active Users
active_users_total = Gauge(
    "active_users_total",
    "Total active users"
)

# AI Reports
ai_reports_total = Counter(
    "ai_reports_total",
    "Total AI reports generated"
)

# Login Counter
login_total = Counter(
    "login_total",
    "Total successful logins"
)