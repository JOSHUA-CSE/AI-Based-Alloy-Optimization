# Alloyfy – AI-Based Alloy Optimization

## Overview

Alloyfy is an AI-powered platform that helps metallurgical engineers optimize alloy compositions before physical manufacturing. Instead of relying on multiple trial-and-error experiments, Alloyfy predicts important material properties such as tensile strength and melting point using machine learning.

The platform also integrates with industrial analyzers through OPC-UA, enabling real-time chemical composition data to be imported directly into the application for instant prediction and optimization.

---

## Problem Statement

Designing a new alloy is expensive and time-consuming. Engineers traditionally need to:

- Prepare alloy samples
- Manufacture test specimens
- Perform laboratory testing
- Repeat the process multiple times

This leads to:

- High material costs
- Longer development cycles
- Increased production delays
- Wasted resources

---

## Solution

Alloyfy replaces much of this manual experimentation with AI.

The application:

- Accepts alloy composition manually or from an OPC-UA connected spectrometer
- Predicts mechanical properties using trained ML models
- Suggests optimized alloy compositions
- Displays prediction confidence and comparison
- Stores prediction history for future analysis

This enables engineers to evaluate alloy performance before manufacturing.

---

## Features

- AI-based alloy property prediction
- Alloy composition optimization
- OPC-UA industrial integration
- Real-time spectrometer data import
- Interactive React dashboard
- Prediction history
- REST API using Django
- Machine Learning model integration

---

## Technology Stack

### Frontend

- React
- TypeScript
- Tailwind CSS

### Backend

- Django
- Django REST Framework

### Machine Learning

- Python
- Scikit-learn
- Pandas
- NumPy
- Joblib

### Industrial Communication

- OPC-UA

### Database

- SQLite (development)

---

## Project Structure

```
alloy-ai-system/
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
│
├── backend/
│   ├── alloy_api/
│   ├── ml_models/
│   ├── optimization/
│   └── manage.py
│
├── models/
├── dataset/
├── README.md
└── requirements.txt
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/<username>/alloy-ai-system.git

cd alloy-ai-system
```

---

### Backend

```bash
cd backend

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Usage

1. Start the Django backend.
2. Start the React frontend.
3. Connect the OPC-UA analyzer (optional).
4. Enter or import alloy composition.
5. Run prediction.
6. View optimized alloy recommendations.

---

# AI Workflow

The project combines Machine Learning with Generative AI-assisted development.

### Machine Learning

- Predict tensile strength
- Predict melting point
- Optimize alloy composition

### Industrial Integration

- Fetch live elemental composition using OPC-UA
- Display real-time values in the dashboard
- Send prediction requests to backend

---

# How GPT-5.6 and Codex were used

This project was developed with assistance from OpenAI GPT-5.6 and Codex during development.

### GPT-5.6 assisted with

- Brainstorming the overall project architecture
- Designing backend APIs
- Explaining machine learning workflows
- Improving React UI structure
- Writing technical documentation
- Preparing hackathon submission content
- Creating presentation material
- Debugging Python and Django issues
- Improving optimization logic
- Drafting README and deployment documentation

### Codex assisted with

- Generating Django REST API boilerplate
- Implementing React components
- Writing OPC-UA integration code
- Creating ML inference functions
- Debugging frontend/backend integration
- Refactoring project structure
- Fixing Git merge conflicts
- Improving code quality and maintainability

AI-generated code was reviewed, modified, tested, and integrated by the development team before deployment.

---

## Future Improvements

- Deep learning models for higher prediction accuracy
- Multi-objective alloy optimization
- Cloud deployment
- User authentication
- Production database support
- Advanced visualization dashboards
- Digital twin integration
- Manufacturing recommendation engine

---

## Contributors

- Joshua Rubert R
---

## License

This project is developed for educational and hackathon purposes.

---

## Repository

GitHub Repository:

```
https://github.com/JOSHUA-CSE/AI-Based-Alloy-Optimization
```

Replace the above URL with your actual GitHub repository link.

---

## Acknowledgements

- OpenAI GPT-5.6-Terra
- OpenAI Codex
- Django
- React
- Scikit-learn
- OPC-UA Community
