# Simple Django shell script to make Collins Arku and Edmond Sekyere superusers
# Run with: python manage.py shell < make_superusers_simple.py

from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

print("=" * 80)
print("MAKING COLLINS ARKU AND EDMOND SEKYERE SUPERUSERS")
print("=" * 80)

# Show all users first
print("\n🔍 All users in the system:")
all_users = User.objects.all().order_by('id')
for u in all_users:
    print(f"   {u.id}: {u.username} ({u.first_name} {u.last_name}) - {u.email}")

print(f"\nTotal users: {all_users.count()}")

# Find Collins Arku
print("\n🔍 Searching for Collins Arku...")
collins = None
try:
    collins = User.objects.get(first_name__iexact='Collins', last_name__iexact='Arku')
    print(f"✅ Found Collins by name: {collins.username}")
except User.DoesNotExist:
    # Try by username
    collins_users = User.objects.filter(Q(first_name__icontains='Collins') | Q(username__icontains='collins'))
    if collins_users.exists():
        collins = collins_users.first()
        print(f"✅ Found Collins by search: {collins.username} ({collins.first_name} {collins.last_name})")
    else:
        print("❌ Collins Arku not found")

# Find Edmond Sekyere
print("\n🔍 Searching for Edmond Sekyere...")
edmond = None
try:
    edmond = User.objects.get(first_name__iexact='Edmond', last_name__iexact='Sekyere')
    print(f"✅ Found Edmond by name: {edmond.username}")
except User.DoesNotExist:
    # Try by username
    edmond_users = User.objects.filter(Q(first_name__icontains='Edmond') | Q(username__icontains='edmond'))
    if edmond_users.exists():
        edmond = edmond_users.first()
        print(f"✅ Found Edmond by search: {edmond.username} ({edmond.first_name} {edmond.last_name})")
    else:
        print("❌ Edmond Sekyere not found")

# Update Collins to superuser
if collins:
    print(f"\n📋 Collins current status:")
    print(f"   Username: {collins.username}")
    print(f"   Name: {collins.first_name} {collins.last_name}")
    print(f"   Is Superuser: {collins.is_superuser}")
    print(f"   Is Staff: {collins.is_staff}")
    
    if not collins.is_superuser:
        collins.is_superuser = True
        collins.is_staff = True
        if hasattr(collins, 'role'):
            collins.role = 'superadmin'
        collins.save()
        print(f"🚀 {collins.username} is now a SUPERUSER!")
    else:
        print(f"ℹ️  {collins.username} is already a superuser")

# Update Edmond to superuser
if edmond:
    print(f"\n📋 Edmond current status:")
    print(f"   Username: {edmond.username}")
    print(f"   Name: {edmond.first_name} {edmond.last_name}")
    print(f"   Is Superuser: {edmond.is_superuser}")
    print(f"   Is Staff: {edmond.is_staff}")
    
    if not edmond.is_superuser:
        edmond.is_superuser = True
        edmond.is_staff = True
        if hasattr(edmond, 'role'):
            edmond.role = 'superadmin'
        edmond.save()
        print(f"🚀 {edmond.username} is now a SUPERUSER!")
    else:
        print(f"ℹ️  {edmond.username} is already a superuser")

# Show all current superusers
print("\n" + "=" * 80)
print("CURRENT SUPERUSERS IN THE SYSTEM")
print("=" * 80)

superusers = User.objects.filter(is_superuser=True).order_by('id')
print(f"Total Superusers: {superusers.count()}")

for user in superusers:
    print(f"• {user.username} ({user.first_name} {user.last_name}) - {user.email}")

print("\n✅ SUPERUSER UPDATE COMPLETE!")
print("=" * 80)
