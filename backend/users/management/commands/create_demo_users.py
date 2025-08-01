from django.core.management.base import BaseCommand
from users.models import User

class Command(BaseCommand):
    help = 'Create demo users demo1 and demo2 with password password123.'

    def handle(self, *args, **kwargs):
        users = [
            {'username': 'demo1', 'password': 'password123', 'email': 'demo1@example.com'},
            {'username': 'demo2', 'password': 'password123', 'email': 'demo2@example.com'},
        ]
        for user in users:
            if not User.objects.filter(username=user['username']).exists():
                User.objects.create_user(
                    username=user['username'],
                    password=user['password'],
                    email=user['email']
                )
                self.stdout.write(self.style.SUCCESS(f"Created user {user['username']}"))
            else:
                self.stdout.write(self.style.WARNING(f"User {user['username']} already exists"))
        self.stdout.write(self.style.SUCCESS('Demo users created or already exist.'))
