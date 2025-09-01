import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Grid, Divider, Alert,
  InputAdornment, Tooltip, FormControl, InputLabel, Select, Tabs, Tab
} from '@mui/material';
import {
  Visibility as VisibilityIcon, Payment as PaymentIcon, Print as PrintIcon,
  Receipt as ReceiptIcon, Edit as EditIcon, Search as SearchIcon,
  FilterList as FilterListIcon, Refresh as RefreshIcon, AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon, Pending as PendingIcon, Cancel as CancelIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import api from '../api';

const SalesOrdersManagement = ({ onSnackbar, customers, products }) => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash',
    reference: '',
    notes: '',
    attachment: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: 'info',
    message: ''
  });

  useEffect(() => {
    loadSalesOrders();
  }, []);

  const loadSalesOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales/sales-orders/');
      console.log('Sales orders loaded:', response.data);
      setSalesOrders(response.data);
    } catch (error) {
      console.error('Error loading sales orders:', error);
      onSnackbar('Error loading sales orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleApplyPayment = (order) => {
    setSelectedOrder(order);
    setPaymentForm({
      amount: order.total || '',
      payment_method: 'cash',
      reference: '',
      notes: '',
      attachment: null
    });
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      if (!paymentForm.amount || paymentForm.amount <= 0) {
        onSnackbar('Please enter a valid payment amount', 'error');
        return;
      }

      // Validate cheque attachment
      if (paymentForm.payment_method === 'cheque' && !paymentForm.attachment) {
        onSnackbar('Please attach cheque image or PDF for approval', 'error');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('sales_order', selectedOrder.id);
      formData.append('amount', paymentForm.amount);
      formData.append('payment_method', paymentForm.payment_method);
      formData.append('reference', paymentForm.reference);
      formData.append('notes', paymentForm.notes);
      formData.append('payment_date', new Date().toISOString().split('T')[0]);

      if (paymentForm.attachment) {
        formData.append('attachment', paymentForm.attachment);
      }

      await api.post('/sales/payments/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update payment and order status based on payment method
      if (paymentForm.payment_method === 'cash' || paymentForm.payment_method === 'mobile_money') {
        const totalPaid = parseFloat(paymentForm.amount);
        const orderTotal = parseFloat(selectedOrder.total);
        
        if (totalPaid >= orderTotal) {
          await api.patch(`/sales/sales-orders/${selectedOrder.id}/`, {
            status: 'confirmed',
            payment_status: 'paid'
          });
        } else {
          await api.patch(`/sales/sales-orders/${selectedOrder.id}/`, {
            status: 'confirmed',
            payment_status: 'partial'
          });
        }
        onSnackbar('Payment applied successfully', 'success');
      } else {
        // For cheque and bank transfer, update payment status to 'paid' but keep order status as pending for finance approval
        await api.patch(`/sales/sales-orders/${selectedOrder.id}/`, {
          payment_status: 'paid'
        });
        onSnackbar('Payment submitted for finance approval', 'info');
      }

      setPaymentDialogOpen(false);
      setPaymentForm({
        amount: '',
        payment_method: 'cash',
        reference: '',
        notes: '',
        attachment: null
      });
      loadSalesOrders();
      
      // Generate receipt
      generatePaymentReceipt(selectedOrder, paymentForm);
      
    } catch (error) {
      onSnackbar('Error applying payment: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const generatePaymentReceipt = (order, payment) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        onSnackbar('Pop-up blocked. Please allow pop-ups to print receipts.', 'warning');
        return;
      }

      const currentDate = new Date().toLocaleDateString();
      const customer = customers.find(c => c.id === order.customer) || {};
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Payment Receipt #${order.order_number || order.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; color: #333; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #4CAF50; padding-bottom: 20px; }
              .company-name { font-size: 24px; font-weight: bold; color: #4CAF50; margin-bottom: 10px; }
              .receipt-title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
              .section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
              .section-title { font-size: 16px; font-weight: bold; color: #4CAF50; margin-bottom: 15px; }
              .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; }
              .detail-label { font-weight: bold; color: #555; }
              .total-amount { font-size: 20px; font-weight: bold; color: #4CAF50; text-align: center; border-top: 2px solid #4CAF50; padding-top: 10px; margin-top: 10px; }
              @media print { body { margin: 0; } .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">SmartERP Software</div>
              <div class="receipt-title">PAYMENT RECEIPT</div>
              <div>Receipt Date: ${currentDate}</div>
            </div>
            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="detail-row"><span class="detail-label">Customer Name:</span><span>${customer.name || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Email:</span><span>${customer.email || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Phone:</span><span>${customer.phone || 'N/A'}</span></div>
            </div>
            <div class="section">
              <div class="section-title">Payment Details</div>
              <div class="detail-row"><span class="detail-label">Sales Order:</span><span>#${order.order_number || order.id}</span></div>
              <div class="detail-row"><span class="detail-label">Payment Method:</span><span>${payment.payment_method.toUpperCase()}</span></div>
              <div class="detail-row"><span class="detail-label">Reference:</span><span>${payment.reference || 'N/A'}</span></div>
            </div>
            <div class="total-amount">Payment Amount: $${parseFloat(payment.amount).toFixed(2)}</div>
            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px;">Print Receipt</button>
              <button onclick="window.close()" style="padding: 10px 20px; margin-left: 10px; background-color: #666; color: white; border: none; border-radius: 4px;">Close</button>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
      
    } catch (error) {
      console.error('Print receipt error:', error);
      onSnackbar('Failed to open print window. Please try again.', 'error');
    }
  };

  const reprintInvoice = (order) => {
    try {
      const customer = customers.find(c => c.id === order.customer) || {};
      const customerName = customer.name || 'N/A';
      const customerEmail = customer.email || 'N/A';
      const customerPhone = customer.phone || 'N/A';
      const salesAgentName = order.sales_agent_name || 'Sales Agent';
      const salesAgentEmail = order.sales_agent_email || 'agent@company.com';
      
      // Generate barcode data (simple format: ORDER-YYYYMMDD-ID)
      const barcodeData = `ORDER-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${order.id}`;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Sales Invoice - ${order.order_number || order.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .header { text-align: center; border-bottom: 2px solid #2196F3; padding-bottom: 20px; margin-bottom: 30px; }
              .company-name { font-size: 24px; font-weight: bold; color: #2196F3; margin-bottom: 10px; }
              .section { margin-bottom: 25px; }
              .section-title { font-size: 16px; font-weight: bold; color: #2196F3; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; }
              .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              .items-table th { background-color: #f5f5f5; font-weight: bold; }
              .items-table tr:nth-child(even) { background-color: #f9f9f9; }
              .total-amount { font-size: 18px; font-weight: bold; color: #2196F3; text-align: right; margin-top: 20px; padding: 15px; background-color: #f0f8ff; border-radius: 5px; }
              .no-items { text-align: center; color: #666; font-style: italic; padding: 20px; }
              .barcode-section { text-align: center; margin: 20px 0; padding: 15px; border: 1px solid #ddd; background-color: #f9f9f9; }
              .barcode { font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; letter-spacing: 3px; margin: 10px 0; }
              .barcode-lines { font-family: 'Courier New', monospace; font-size: 8px; line-height: 0.8; margin: 5px 0; }
              .no-print { display: block; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">SmartERP Software</div>
              <div>SALES INVOICE</div>
              <div>Invoice #${order.order_number || order.id}</div>
              <div style="font-size: 12px; margin-top: 10px;">${new Date().toLocaleDateString()}</div>
            </div>
            
            <div class="barcode-section">
              <div style="font-size: 12px; color: #666; margin-bottom: 10px; text-align: center;">Verification Barcode</div>
              <div style="display: flex; justify-content: center; align-items: end; height: 60px; margin: 15px 0;">
                <div style="width: 3px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 3px;"></div>
                <div style="width: 2px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 3px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 2px;"></div>
                <div style="width: 2px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 3px;"></div>
                <div style="width: 3px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 2px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 2px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 3px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 2px; height: 60px; background: #000; margin-right: 3px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 2px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 3px; height: 60px; background: #000; margin-right: 2px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 2px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 3px;"></div>
                <div style="width: 2px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 3px; height: 60px; background: #000; margin-right: 2px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 2px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 3px;"></div>
                <div style="width: 3px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 2px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 2px;"></div>
                <div style="width: 1px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 2px; height: 60px; background: #000; margin-right: 1px;"></div>
                <div style="width: 3px; height: 60px; background: #000; margin-right: 1px;"></div>
              </div>
              <div style="font-family: 'Courier New', monospace; font-size: 14px; font-weight: bold; text-align: center; letter-spacing: 2px; color: #333; margin-top: 5px;">
                0 ${barcodeData.replace(/[^0-9]/g, '').slice(0,6).padEnd(6, '0')} ${barcodeData.replace(/[^0-9]/g, '').slice(6,12).padEnd(6, '0')} 0
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="detail-row"><span>Customer:</span><span>${customerName}</span></div>
              <div class="detail-row"><span>Email:</span><span>${customerEmail}</span></div>
              <div class="detail-row"><span>Phone:</span><span>${customerPhone}</span></div>
            </div>
            <div class="section">
              <div class="section-title">Sales Agent Information</div>
              <div class="detail-row"><span>Sales Agent:</span><span>${salesAgentName}</span></div>
              <div class="detail-row"><span>Agent Email:</span><span>${salesAgentEmail}</span></div>
            </div>
            <div class="section">
              <div class="section-title">Order Items</div>
              ${(order.items && order.items.length > 0) ? `
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items.map(item => `
                      <tr>
                        <td>${item.product_name || 'Product'}</td>
                        <td>${item.product_sku || 'N/A'}</td>
                        <td>${item.quantity || 0}</td>
                        <td>$${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                        <td>$${parseFloat(item.line_total || (item.quantity * item.unit_price) || 0).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : (order.salesorderitem_set && order.salesorderitem_set.length > 0) ? `
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.salesorderitem_set.map(item => `
                      <tr>
                        <td>${item.product_name || 'Product'}</td>
                        <td>${item.product_sku || 'N/A'}</td>
                        <td>${item.quantity || 0}</td>
                        <td>$${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                        <td>$${parseFloat((item.quantity * item.unit_price) || 0).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : `
                <div style="text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #666; font-size: 14px;">
                    <strong>Debug Info:</strong><br>
                    Items: ${JSON.stringify(order.items || 'null')}<br>
                    SalesOrderItemSet: ${JSON.stringify(order.salesorderitem_set || 'null')}<br>
                    Order Keys: ${Object.keys(order).join(', ')}
                  </p>
                  <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
                  <p><strong>Product Information:</strong></p>
                  <p>Order Total: $${parseFloat(order.total || 0).toFixed(2)}</p>
                  <p>Payment Method: ${order.payment_method || 'N/A'}</p>
                  <p><em>Product details will be loaded from backend API.</em></p>
                </div>
              `}
            </div>
            <div class="section">
              <div class="section-title">Order Summary</div>
              <div class="detail-row"><span>Payment Method:</span><span>${order.payment_method || 'N/A'}</span></div>
              <div class="detail-row"><span>Payment Status:</span><span>${order.payment_status || 'N/A'}</span></div>
              <div class="detail-row"><span>Subtotal:</span><span>$${parseFloat(order.subtotal || 0).toFixed(2)}</span></div>
              ${order.discount_amount > 0 ? `<div class="detail-row"><span>Discount:</span><span>-$${parseFloat(order.discount_amount || 0).toFixed(2)}</span></div>` : ''}
              <div class="total-amount">Total: $${parseFloat(order.total || 0).toFixed(2)}</div>
            </div>
            ${order.notes ? `
            <div class="section">
              <div class="section-title">Notes</div>
              <div>${order.notes}</div>
            </div>
            ` : ''}
            
            <div class="section" style="font-size: 11px; color: #666; text-align: center; margin-top: 30px;">
              <div>Invoice generated on ${new Date().toLocaleString()}</div>
              <div>Verification Code: ${barcodeData}</div>
              <div>For support, contact: support@smarterp.com</div>
            </div>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; background-color: #2196F3; color: white; border: none; border-radius: 4px;">Print Invoice</button>
              <button onclick="window.close()" style="padding: 10px 20px; margin-left: 10px; background-color: #666; color: white; border: none; border-radius: 4px;">Close</button>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
      
    } catch (error) {
      console.error('Print invoice error:', error);
      onSnackbar('Failed to open print window. Please try again.', 'error');
    }
  };

  const printReceipt = (order) => {
    try {
      const customer = customers.find(c => c.id === order.customer) || {};
      const customerName = customer.name || 'N/A';
      const salesAgentName = order.sales_agent_name || 'Sales Agent';
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${order.order_number || order.id}</title>
            <style>
              body { font-family: 'Courier New', monospace; margin: 10px; font-size: 12px; line-height: 1.4; }
              .receipt-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
              .company-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
              .receipt-title { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
              .receipt-number { font-size: 12px; margin-bottom: 10px; }
              .section { margin-bottom: 15px; }
              .section-title { font-weight: bold; margin-bottom: 8px; text-decoration: underline; }
              .detail-line { display: flex; justify-content: space-between; margin-bottom: 3px; }
              .items-section { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 15px 0; }
              .item-line { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .item-details { font-size: 11px; color: #666; margin-left: 10px; margin-bottom: 3px; }
              .total-section { border-top: 1px solid #000; padding-top: 10px; margin-top: 15px; }
              .total-line { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
              .footer { text-align: center; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; font-size: 10px; }
              .no-print { display: block; text-align: center; margin-top: 20px; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="receipt-header">
              <div class="company-name">SmartERP Software</div>
              <div class="receipt-title">PAYMENT RECEIPT</div>
              <div class="receipt-number">Receipt #${order.order_number || order.id}</div>
              <div>${new Date().toLocaleString()}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Customer Details</div>
              <div class="detail-line"><span>Customer:</span><span>${customerName}</span></div>
              <div class="detail-line"><span>Sales Agent:</span><span>${salesAgentName}</span></div>
            </div>
            
            <div class="items-section">
              <div class="section-title">Items Purchased</div>
              ${order.items && order.items.length > 0 ? 
                order.items.map(item => `
                  <div class="item-line">
                    <span>${item.product_name || 'Product'}</span>
                    <span>$${parseFloat(item.line_total || (item.quantity * item.unit_price) || 0).toFixed(2)}</span>
                  </div>
                  <div class="item-details">
                    SKU: ${item.product_sku || 'N/A'} | Qty: ${item.quantity || 0} | Unit: $${parseFloat(item.unit_price || 0).toFixed(2)}
                  </div>
                `).join('') : 
                '<div>No items available</div>'
              }
            </div>
            
            <div class="section">
              <div class="detail-line"><span>Subtotal:</span><span>$${parseFloat(order.subtotal || 0).toFixed(2)}</span></div>
              ${order.discount_amount > 0 ? `<div class="detail-line"><span>Discount:</span><span>-$${parseFloat(order.discount_amount || 0).toFixed(2)}</span></div>` : ''}
              <div class="total-section">
                <div class="total-line"><span>TOTAL PAID:</span><span>$${parseFloat(order.total || 0).toFixed(2)}</span></div>
              </div>
            </div>
            
            <div class="section">
              <div class="detail-line"><span>Payment Method:</span><span>${order.payment_method?.toUpperCase() || 'N/A'}</span></div>
              <div class="detail-line"><span>Payment Status:</span><span>${order.payment_status?.toUpperCase() || 'N/A'}</span></div>
              <div class="detail-line"><span>Order Status:</span><span>${order.status?.toUpperCase() || 'N/A'}</span></div>
            </div>
            
            <div class="footer">
              <div>Thank you for your business!</div>
              <div>SmartERP Software - Your Business Partner</div>
              ${order.notes ? `<div style="margin-top: 10px;">Notes: ${order.notes}</div>` : ''}
            </div>
            
            <div class="no-print">
              <button onclick="window.print()" style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; margin-right: 10px;">Print Receipt</button>
              <button onclick="window.close()" style="padding: 8px 16px; background-color: #666; color: white; border: none; border-radius: 4px;">Close</button>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
      
    } catch (error) {
      console.error('Print receipt error:', error);
      onSnackbar('Failed to open print window. Please try again.', 'error');
    }
  };

  const refreshOrderStatus = async () => {
    try {
      await loadSalesOrders();
    } catch (error) {
      console.error('Error refreshing orders:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshOrderStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', icon: <PendingIcon /> },
      confirmed: { color: 'info', icon: <CheckCircleIcon /> },
      approved: { color: 'success', icon: <CheckCircleIcon /> },
      rejected: { color: 'error', icon: <CancelIcon /> },
      completed: { color: 'success', icon: <CheckCircleIcon /> }
    };
    
    const config = statusConfig[status] || { color: 'default', icon: null };
    return (
      <Chip 
        label={status?.toUpperCase() || 'UNKNOWN'} 
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  const getPaymentStatusChip = (paymentStatus) => {
    const statusConfig = {
      paid: { color: 'success', icon: <CheckCircleIcon /> },
      partial: { color: 'warning', icon: <PendingIcon /> },
      pending: { color: 'error', icon: <PendingIcon /> },
      overdue: { color: 'error', icon: <CancelIcon /> }
    };
    
    const config = statusConfig[paymentStatus] || { color: 'default', icon: null };
    return (
      <Chip 
        label={paymentStatus?.toUpperCase() || 'PENDING'} 
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  const filteredOrders = salesOrders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customers.find(c => c.id === order.customer)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.payment_status === paymentStatusFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  // Separate orders by payment status for tabs
  const pendingPayments = filteredOrders.filter(order => 
    order.payment_status === 'pending' || order.payment_status === 'partial'
  );
  const completedPayments = filteredOrders.filter(order => 
    order.payment_status === 'paid'
  );

  const currentOrders = tabValue === 0 ? pendingPayments : 
                       tabValue === 1 ? completedPayments : filteredOrders;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Sales Orders Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadSalesOrders}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search orders or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Order Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Order Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentStatusFilter}
                  label="Payment Status"
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Payment Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label={`Pending Payments (${pendingPayments.length})`}
            icon={<PendingIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Completed Payments (${completedPayments.length})`}
            icon={<CheckCircleIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`All Orders (${filteredOrders.length})`}
            icon={<DescriptionIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Orders Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Loading...</TableCell>
                </TableRow>
              ) : currentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No orders found</TableCell>
                </TableRow>
              ) : (
                currentOrders.map((order) => {
                  const customer = customers.find(c => c.id === order.customer) || {};
                  return (
                    <TableRow key={order.id}>
                      <TableCell>#{order.order_number || order.id}</TableCell>
                      <TableCell>{customer.name || 'Unknown Customer'}</TableCell>
                      <TableCell>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>${parseFloat(order.total || 0).toFixed(2)}</TableCell>
                      <TableCell>{getStatusChip(order.status)}</TableCell>
                      <TableCell>{getPaymentStatusChip(order.payment_status)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewOrder(order)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {(order.payment_status === 'pending' || order.payment_status === 'partial') && (
                            <Tooltip title="Apply Payment">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApplyPayment(order)}
                              >
                                <PaymentIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Reprint Invoice">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => reprintInvoice(order)}
                            >
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {(order.payment_status === 'paid' && order.status === 'confirmed') && (
                            <Tooltip title="Print Receipt">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => printReceipt(order)}
                              >
                                <ReceiptIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - #{selectedOrder?.order_number || selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Customer Information</Typography>
                <Typography>
                  <strong>Name:</strong> {customers.find(c => c.id === selectedOrder.customer)?.name || 'N/A'}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {customers.find(c => c.id === selectedOrder.customer)?.email || 'N/A'}
                </Typography>
                <Typography>
                  <strong>Phone:</strong> {customers.find(c => c.id === selectedOrder.customer)?.phone || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Order Information</Typography>
                <Typography><strong>Status:</strong> {getStatusChip(selectedOrder.status)}</Typography>
                <Typography><strong>Payment Status:</strong> {getPaymentStatusChip(selectedOrder.payment_status)}</Typography>
                <Typography><strong>Total:</strong> ${parseFloat(selectedOrder.total || 0).toFixed(2)}</Typography>
                <Typography><strong>Payment Method:</strong> {selectedOrder.payment_method?.toUpperCase() || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Order Items</Typography>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Unit Price</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>${item.product_name || 'Product'}</TableCell>
                          <TableCell>${item.quantity}</TableCell>
                          <TableCell>${parseFloat(item.unit_price || 0).toFixed(2)}</TableCell>
                          <TableCell>${parseFloat(item.line_total || (item.quantity * item.unit_price) || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography>No items available</Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Apply Payment - {selectedOrder?.order_number}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                  label="Payment Method"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="mobile_money">Mobile Money</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference Number"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
              />
            </Grid>
            {paymentForm.payment_method === 'cheque' && (
              <Grid item xs={12}>
                <input
                  type="file"
                  onChange={(e) => setPaymentForm({...paymentForm, attachment: e.target.files[0]})}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            color="primary"
          >
            Apply Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesOrdersManagement;
