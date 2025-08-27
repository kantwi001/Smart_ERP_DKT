from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from .models import POSSession, Sale
from .serializers import POSSessionSerializer, SaleSerializer
from inventory.models import Product, InventoryTransfer
from sales.models import Customer

class POSSessionViewSet(viewsets.ModelViewSet):
    queryset = POSSession.objects.all()
    serializer_class = POSSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Create sale and deduct from inventory"""
        try:
            with transaction.atomic():
                # Get product and validate stock
                product_id = request.data.get('product_id')
                quantity = int(request.data.get('quantity', 1))
                
                if not product_id:
                    return Response(
                        {'error': 'Product ID is required'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                try:
                    product = Product.objects.get(id=product_id)
                except Product.DoesNotExist:
                    return Response(
                        {'error': 'Product not found'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Check stock availability
                if product.quantity < quantity:
                    return Response(
                        {'error': f'Insufficient stock. Available: {product.quantity}, Requested: {quantity}'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Get customer if provided
                customer = None
                customer_id = request.data.get('customer_id')
                if customer_id:
                    try:
                        customer = Customer.objects.get(id=customer_id)
                    except Customer.DoesNotExist:
                        return Response(
                            {'error': 'Customer not found'}, 
                            status=status.HTTP_404_NOT_FOUND
                        )
                
                # Get product price - use first available price or default
                unit_price = request.data.get('unit_price')
                if not unit_price:
                    price_obj = product.prices.first()
                    unit_price = price_obj.price if price_obj else 0
                
                # Create sale record
                sale_data = {
                    'product': product,
                    'customer': customer,
                    'quantity': quantity,
                    'unit_price': unit_price,
                    'total': request.data.get('total_amount', quantity * float(unit_price)),
                    'payment_method': request.data.get('payment_method', 'cash'),
                    'staff': request.user,
                    'notes': request.data.get('notes', ''),
                }
                
                sale = Sale.objects.create(**sale_data)
                
                # Deduct from inventory
                product.quantity -= quantity
                product.save()
                
                # Create inventory transfer record for tracking
                InventoryTransfer.objects.create(
                    product=product,
                    quantity=quantity,
                    from_location='Main Stock',
                    to_location='POS Sale',
                    requested_by=request.user,
                    status='completed'
                )
                
                serializer = self.get_serializer(sale)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': f'Transaction failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def products_list(request):
    """Get available products for POS"""
    try:
        # Get products with stock > 0 and include price information
        products = []
        for product in Product.objects.filter(quantity__gt=0):
            price_obj = product.prices.first()
            products.append({
                'id': product.id,
                'name': product.name,
                'sku': product.sku,
                'price': str(price_obj.price) if price_obj else '0.00',
                'quantity': product.quantity,
                'category': product.category.name if product.category else 'Uncategorized'
            })
        return Response(products)
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch products: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def transactions_list(request):
    sales = Sale.objects.all().order_by('-date')
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)
