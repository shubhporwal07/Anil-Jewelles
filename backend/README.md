# Backend - Django REST API

This directory is the home for the Django REST Framework backend.

## Setup

If you have an existing Django project, move or clone it here. Otherwise, create a new one:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install django djangorestframework
django-admin startproject config .
```

## Existing Apps (from previous work)

Based on your project history, the backend includes:
- **accounts** — User registration, email verification (OTP), multi-role auth (customer/vendor)
- **products** — Product models, categories, vendor profiles
- **config** — Django project settings with PostgreSQL, Firebase integration
