#!/bin/bash
# =============================================================
# EC2 Ubuntu Deployment Script — Alloy AI System
# Run once on a fresh EC2 instance:
#   chmod +x deploy.sh && ./deploy.sh
# =============================================================

set -e  # Exit immediately on any error

echo "=== [1/7] Updating system packages ==="
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv nodejs npm git

echo "=== [2/7] Setting up Python virtual environment ==="
cd backend
python3 -m venv venv
source venv/bin/activate

echo "=== [3/7] Installing Python dependencies ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== [4/7] Collecting static files ==="
python manage.py collectstatic --noinput

echo "=== [5/7] Installing frontend dependencies ==="
cd ../frontend
npm install

echo "=== [6/7] Building React frontend ==="
# Make sure frontend/.env has REACT_APP_API_URL set to your EC2 IP before this step
npm run build

echo "=== [7/7] Installing serve for React static hosting ==="
sudo npm install -g serve

echo ""
echo "============================================"
echo " Setup complete."
echo ""
echo " To start the backend (Gunicorn):"
echo "   cd backend && source venv/bin/activate"
echo "   gunicorn alloy_backend.wsgi -c gunicorn.conf.py &"
echo ""
echo " To serve the React frontend:"
echo "   serve -s frontend/build -l 3000 &"
echo ""
echo " Make sure EC2 Security Group allows ports 3000 and 8000."
echo "============================================"
