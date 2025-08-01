from django.core.management.base import BaseCommand
from sales.models import Customer

class Command(BaseCommand):
    help = 'Automatically blacklist customers with overdue invoices based on their payment terms.'

    def handle(self, *args, **options):
        count = 0
        for customer in Customer.objects.all():
            if customer.check_and_update_blacklist():
                count += 1
        self.stdout.write(self.style.SUCCESS(f'Blacklisted {count} customers with overdue invoices.'))
