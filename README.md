# Smart Expense Tracker with Predictive Insights

## Overview

Smart Expense Tracker with Predictive Insights is a full-stack expense management web application that helps users track expenses, manage budgets, visualize spending patterns, and receive AI-powered financial recommendations. The platform provides an intuitive dashboard, budget alerts, expense analytics, PDF report generation, and intelligent spending insights.

---

## Features

### Authentication System

* User Registration
* Secure Login
* Protected Routes
* User-specific expense management

### Expense Management

* Add new expenses
* View expense history
* Categorize transactions
* Delete expenses
* Search and filter expenses

### Budget Management

* Create category-wise budgets
* Track spending against budgets
* Budget exceeded alerts
* Real-time budget monitoring

### Analytics Dashboard

* Expense summary cards
* Spending trend visualization
* Category-wise expense analysis
* Interactive charts using Recharts

### AI-Powered Insights

* Personalized spending recommendations
* Savings suggestions
* Financial planning guidance
* AI-generated expense analysis using Groq AI

### PDF Reporting

* Generate downloadable expense reports
* Easy record keeping and sharing

---

## Tech Stack

### Frontend

* React.js
* JavaScript
* Tailwind CSS
* Recharts

### Backend

* FastAPI
* Python

### Database

* MongoDB Atlas

### AI Integration

* Groq API
* Llama 3 Model

### Tools

* Git
* GitHub
* Postman
* Jupyter Notebook

---

## Project Structure

```text
smart-expense-tracker/
│
├── backend/
│   ├── .env
│   ├── requirements.txt
│   └── server.py
│
└── frontend/
    ├── public/
    └── src/
        ├── api/
        │   └── client.js
        ├── assets/
        ├── components/
        │   ├── ExpenseForm.jsx
        │   ├── Layout.jsx
        │   ├── ProtectedRoute.jsx
        │   └── StatCard.jsx
        ├── context/
        └── pages/
            ├── Budgets.jsx
            ├── Dashboard.jsx
            ├── Expenses.jsx
            ├── Insights.jsx
            ├── Login.jsx
            └── Register.jsx
```

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/divy686/smart-expense-tracker.git
cd smart-expense-tracker
```

---

### 2. Backend Setup

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate environment:

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend server:

```bash
uvicorn server:app --reload --port 8001
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### Backend (.env)

```env
MONGO_URL=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

### Frontend (.env)

```env
VITE_APP_BACKEND_URL=http://localhost:8001
```

---

## Key Components

### ExpenseForm.jsx

Handles expense creation and transaction management.

### Layout.jsx

Provides application layout and navigation structure.

### ProtectedRoute.jsx

Protects authenticated routes from unauthorized access.

### StatCard.jsx

Displays dashboard statistics and financial summaries.

---

## Pages

### Dashboard

Displays analytics, charts, and financial summaries.

### Expenses

Manages expense records and transaction history.

### Budgets

Tracks category-wise budgets and spending limits.

### Insights

Generates AI-powered financial recommendations.

### Login

Handles user authentication.

### Register

Handles new user registration.

---

## Future Enhancements

* Machine Learning based expense prediction
* Multi-currency support
* Email notifications
* Export reports in Excel format
* Mobile application integration
* Advanced financial forecasting

---

## Learning Outcomes

* Full-Stack Application Development
* REST API Development using FastAPI
* MongoDB Atlas Integration
* AI API Integration using Groq
* Data Visualization with Recharts
* Authentication and Authorization
* Expense Analytics and Reporting

---

## Author

**Divya Rana**

B.Tech (Computer Science & Engineering)

GitHub: https://github.com/divy686
