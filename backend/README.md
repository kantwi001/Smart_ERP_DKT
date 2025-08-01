# ERP System Backend

## Stack
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Stripe Integration

## Setup
1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy the example environment file and edit as needed:
   ```bash
   cp .env.example .env
   # Edit .env for your credentials and secrets
   ```
4. Set up PostgreSQL and configure `DATABASE_URL` in `.env`.
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Run development server:
   ```bash
   python manage.py runserver
   ```

## Running Tests
```bash
python manage.py test
```

## Deployment Tips
- Set `DEBUG=False` in production.
- Use a strong `DJANGO_SECRET_KEY`.
- Configure `ALLOWED_HOSTS` and email settings in `.env`.
- Use a production-ready database (PostgreSQL recommended).
