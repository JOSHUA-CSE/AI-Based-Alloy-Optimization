# Gunicorn configuration — EC2 production
# Run from backend/ directory:
#   gunicorn alloy_backend.wsgi -c gunicorn.conf.py

import multiprocessing

# Bind to all interfaces on port 8000
bind = "0.0.0.0:8000"

# 2-4 workers is fine for a t2.micro/t3.small EC2 instance
workers = multiprocessing.cpu_count() * 2 + 1

# ML optimization loop runs up to 100 iterations — needs more than 30s default
timeout = 120

# Keep connections alive for slightly longer
keepalive = 5

# Worker class — sync is correct for CPU-bound ML workloads
worker_class = "sync"

# Logging — stdout/stderr so systemd/journald captures them
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Reload on code change (set to False in production)
reload = False
