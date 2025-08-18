#!/usr/bin/env python
import os
import django
from django.core.management import execute_from_command_line

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Run makemigrations --merge
print("Running makemigrations --merge to resolve conflicts...")
execute_from_command_line(['manage.py', 'makemigrations', '--merge'])

# Run migrate
print("Running migrate to apply all migrations...")
execute_from_command_line(['manage.py', 'migrate'])

print("✅ Migration conflict resolved and applied!")
