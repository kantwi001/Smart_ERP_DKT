from django.db.models.signals import post_save
from django.dispatch import receiver
from inventory.models import InventoryTransfer
from .services import TransferApprovalService
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=InventoryTransfer)
def handle_transfer_created(sender, instance, created, **kwargs):
    """
    Automatically request approval when a new transfer is created
    """
    if created and instance.status == 'pending':
        try:
            approval_service = TransferApprovalService()
            approval = approval_service.request_approval(instance)
            
            if approval:
                logger.info(f"Approval requested for transfer {instance.id}")
            else:
                logger.warning(f"Failed to request approval for transfer {instance.id}")
                
        except Exception as e:
            logger.error(f"Error requesting approval for transfer {instance.id}: {str(e)}")

@receiver(post_save, sender=InventoryTransfer)
def handle_transfer_status_change(sender, instance, created, **kwargs):
    """
    Handle transfer status changes (approved/rejected)
    """
    if not created and instance.status in ['approved', 'rejected']:
        try:
            # If transfer is approved, we can trigger stock movement here
            if instance.status == 'approved':
                logger.info(f"Transfer {instance.id} approved - stock movement can be processed")
                # TODO: Implement actual stock movement logic here
                
        except Exception as e:
            logger.error(f"Error handling transfer status change for {instance.id}: {str(e)}")
