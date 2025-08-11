#!/bin/bash

# Navigate to backend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

echo "🚀 Activating virtual environment and making Collins Arku and Edmond Sekyere superusers..."
echo "=" * 80

# Activate virtual environment and run the script
if [ -d "venv" ]; then
    echo "✅ Found virtual environment"
    source venv/bin/activate
    echo "✅ Virtual environment activated"
    
    # Run the Django script
    python /Users/kwadwoantwi/CascadeProjects/erp-system/make_superusers_direct.py
    
    echo "✅ Script execution complete"
    deactivate
else
    echo "❌ Virtual environment not found at venv/"
    echo "Trying to run with system Python and manage.py..."
    
    # Alternative: Use manage.py shell
    echo "from django.contrib.auth import get_user_model; from django.db.models import Q; User = get_user_model(); print('=== ALL USERS ==='); [print(f'{u.id}: {u.username} ({u.first_name} {u.last_name})') for u in User.objects.all()]; collins = None; edmond = None; [setattr(globals(), 'collins', User.objects.filter(Q(first_name__icontains='Collins') | Q(username__icontains='collins')).first())]; [setattr(globals(), 'edmond', User.objects.filter(Q(first_name__icontains='Edmond') | Q(username__icontains='edmond')).first())]; print('=== UPDATING USERS ==='); [print(f'Collins found: {collins}') if collins else print('Collins not found')]; [print(f'Edmond found: {edmond}') if edmond else print('Edmond not found')]; [setattr(collins, 'is_superuser', True), setattr(collins, 'is_staff', True), setattr(collins, 'role', 'superadmin'), collins.save(), print(f'✅ {collins.username} is now superuser!')] if collins and not collins.is_superuser else [print(f'ℹ️ {collins.username} already superuser')] if collins else None; [setattr(edmond, 'is_superuser', True), setattr(edmond, 'is_staff', True), setattr(edmond, 'role', 'superadmin'), edmond.save(), print(f'✅ {edmond.username} is now superuser!')] if edmond and not edmond.is_superuser else [print(f'ℹ️ {edmond.username} already superuser')] if edmond else None; print('=== CURRENT SUPERUSERS ==='); [print(f'{u.username} ({u.first_name} {u.last_name})') for u in User.objects.filter(is_superuser=True)]" | python manage.py shell
fi

echo "🎉 Superuser update process complete!"
