from django.db import models

class Account(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

class Transaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    transaction_type = models.CharField(max_length=20, choices=[('credit','Credit'),('debit','Debit')])
