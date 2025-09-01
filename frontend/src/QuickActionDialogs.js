import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
  Grid, FormControl, InputLabel, Select, MenuItem, Autocomplete, Typography,
  Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Card, CardContent, Avatar, Divider, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Send as SendIcon,
  Print as PrintIcon, Visibility as VisibilityIcon, SwapHoriz as TransferIcon,
  AttachMoney as AttachMoneyIcon, Description as DescriptionIcon,
  PersonAdd as PersonAddIcon, Map as MapIcon, PointOfSale as PointOfSaleIcon,
  Receipt as ReceiptIcon, AssignmentInd as AssignmentIndIcon,
  Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon,
  Business as BusinessIcon, Home as HomeIcon, LocationOn as LocationOnIcon,
  Notes as NotesIcon, Domain as DomainIcon, Store as StoreIcon,
  Payment as PaymentIcon, Close as CloseIcon, CheckCircle as CheckCircleIcon,
  Sell as SellIcon
} from '@mui/icons-material';
import api from './api';
import CustomerHeatMap from './components/CustomerHeatMap';

const QuickActionDialogs = ({
  // Dialog states
  promotionsDialogOpen, setPromotionsDialogOpen,
  quoteDialogOpen, setQuoteDialogOpen,
  transferStockDialogOpen, setTransferStockDialogOpen,
  viewTransfersDialogOpen, setViewTransfersDialogOpen,
  addLeadDialogOpen, setAddLeadDialogOpen,
  posTransactionsDialogOpen, setPosTransactionsDialogOpen,
  transactionsDialogOpen, setTransactionsDialogOpen,
  stockAssignmentDialogOpen, setStockAssignmentDialogOpen,
  customerCreationDialogOpen, setCustomerCreationDialogOpen,
  customerHeatMapDialogOpen, setCustomerHeatMapDialogOpen,
  salesOrderDialogOpen, setSalesOrderDialogOpen,
  
  // Data
  customers, products, warehouses, salesAgents,
  
  // Handlers
  onSnackbar,
  refreshCustomers, // Add refresh callback
  onRefreshProducts // Add refresh callback
}) => {
  // Form states using mobile app data structures
  const [promotionData, setPromotionData] = useState({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    start_date: '',
    end_date: '',
    minimum_order: 0,
    is_active: true
  });

  const [salesOrderData, setSalesOrderData] = useState({
    customer: null,
    products: [{ product: null, quantity: 1, unit_price: 0 }],
    payment_method: 'cash',
    discount_percentage: 0,
    notes: '',
    payment_terms: 30,
    due_date: '',
    total: 0
  });

  const [quoteData, setQuoteData] = useState({
    customer: null,
    product: null,
    quantity: 1,
    unit_price: 0,
    total: 0,
    notes: '',
    valid_until: '',
    terms: 'Net 30'
  });

  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'website',
    status: 'new',
    notes: '',
    assigned_to: null
  });

  const [transferData, setTransferData] = useState({
    product: null,
    from_warehouse: null,
    to_warehouse: null,
    quantity: 1,
    reason: 'restock',
    notes: ''
  });

  const [stockAssignmentData, setStockAssignmentData] = useState({
    agent: null,
    product: null,
    quantity: 1,
    warehouse: null,
    notes: ''
  });

  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    customer_type: 'retailer',
    payment_terms: 30,
    latitude: null,
    longitude: null,
    location_accuracy: null,
    location_timestamp: null
  });

  const [heatMapData, setHeatMapData] = useState({
    timePeriod: '30days',
    region: 'all',
    isLoading: false,
    showMap: false
  });

  // API call handlers
  const handleCreatePromotion = async () => {
    try {
      const response = await api.post('/api/sales/promotions/', promotionData);
      
      // Create accounting entry for marketing expense
      await api.post('/api/accounting/journal-entries/', {
        description: `Marketing Promotion: ${promotionData.name}`,
        entries: [
          {
            account: 'Marketing Expense',
            debit: promotionData.discount_value * 100,
            credit: 0
          },
          {
            account: 'Cash',
            debit: 0,
            credit: promotionData.discount_value * 100
          }
        ]
      });

      onSnackbar('Promotion created successfully!', 'success');
      setPromotionsDialogOpen(false);
      setPromotionData({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        start_date: '',
        end_date: '',
        minimum_order: 0,
        is_active: true
      });
    } catch (error) {
      onSnackbar('Error creating promotion', 'error');
    }
  };

  const handleGenerateQuote = async () => {
    try {
      // Validate required fields
      if (!quoteData.customer) {
        onSnackbar('Please select a customer', 'error');
        return;
      }
      
      if (!quoteData.product) {
        onSnackbar('Please select a product', 'error');
        return;
      }
      
      if (!quoteData.quantity || quoteData.quantity <= 0) {
        onSnackbar('Please enter a valid quantity', 'error');
        return;
      }
      
      if (!quoteData.unit_price || quoteData.unit_price <= 0) {
        onSnackbar('Please enter a valid unit price', 'error');
        return;
      }

      // Calculate total
      const calculatedTotal = (quoteData.quantity || 0) * (quoteData.unit_price || 0);
      
      // Prepare quote data
      const quotePayload = {
        customer: quoteData.customer.id,
        product: quoteData.product.id,
        quantity: quoteData.quantity,
        unit_price: quoteData.unit_price,
        total_amount: calculatedTotal,
        notes: quoteData.notes || '',
        valid_until: quoteData.valid_until || null,
        status: 'draft'
      };

      const response = await api.post('/api/sales/quotes/', quotePayload);
      const quote = response.data;
      
      onSnackbar('Quote generated successfully!', 'success');
      
      // Auto-print prompt
      setTimeout(() => {
        if (window.confirm('Quote generated successfully! Would you like to print it now?')) {
          printQuote(quote, quoteData);
        }
      }, 500);
      
      setQuoteDialogOpen(false);
      
      // Reset form
      setQuoteData({
        customer: null,
        product: null,
        quantity: 1,
        unit_price: 0,
        total: 0,
        notes: '',
        valid_until: '',
        terms: 'Net 30'
      });
    } catch (error) {
      console.error('Quote generation error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          (typeof error.response?.data === 'string' ? error.response.data : error.message);
      onSnackbar(`Error generating quote: ${errorMessage}`, 'error');
    }
  };

  // Print quote function
  const printQuote = (quote, quoteFormData) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        onSnackbar('Pop-up blocked. Please allow pop-ups to print quotes.', 'warning');
        return;
      }

      const currentDate = new Date().toLocaleDateString();
      const validUntil = quoteFormData.valid_until ? new Date(quoteFormData.valid_until).toLocaleDateString() : 'Not specified';
      const total = (quoteFormData.quantity || 0) * (quoteFormData.unit_price || 0);
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Quote #${quote.id}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 30px; 
                line-height: 1.6;
                color: #333;
              }
              .header { 
                text-align: center; 
                margin-bottom: 40px; 
                border-bottom: 3px solid #9C27B0; 
                padding-bottom: 20px; 
              }
              .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #9C27B0;
                margin-bottom: 10px;
              }
              .quote-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .quote-number {
                font-size: 16px;
                color: #666;
              }
              .section {
                margin-bottom: 30px;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
              }
              .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #9C27B0;
                margin-bottom: 15px;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 5px 0;
              }
              .detail-label {
                font-weight: bold;
                color: #555;
              }
              .product-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
              }
              .product-table th,
              .product-table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
              }
              .product-table th {
                background-color: #f8f9fa;
                font-weight: bold;
                color: #9C27B0;
              }
              .product-table tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .product-table tr:hover {
                background-color: #f0f8ff;
              }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .summary-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 40px;
              }
              .summary-table {
                width: 300px;
                border-collapse: collapse;
              }
              .summary-table td {
                padding: 8px 15px;
                border-bottom: 1px solid #eee;
                font-size: 14px;
              }
              .summary-table .total-row {
                background: linear-gradient(135deg, #2196F3, #1976D2);
                color: white;
                font-weight: bold;
                font-size: 16px;
              }
              .terms-section {
                margin-top: 40px;
                padding: 20px;
                background-color: #f8f9fa;
                border-left: 4px solid #2196F3;
              }
              .terms-title {
                font-weight: bold;
                margin-bottom: 10px;
                color: #2196F3;
              }
              .terms-content {
                font-size: 12px;
                line-height: 1.5;
                color: #666;
              }
              .footer {
                margin-top: 50px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #eee;
                padding-top: 20px;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">SmartERP Software</div>
              <div class="quote-title">SALES QUOTE</div>
              <div class="quote-number">Quote #${quote.id}</div>
              <div>Date: ${currentDate}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="detail-row">
                <span class="detail-label">Customer Name:</span>
                <span>${quoteFormData.customer?.name || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span>${quoteFormData.customer?.email || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span>${quoteFormData.customer?.phone || 'N/A'}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Product Details</div>
              <table class="product-table">
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
                  <tr>
                    <td>${quoteFormData.product?.name || 'N/A'}</td>
                    <td>${quoteFormData.product?.sku || 'N/A'}</td>
                    <td>${quoteFormData.quantity || 0}</td>
                    <td>$${(quoteFormData.unit_price || 0).toFixed(2)}</td>
                    <td>$${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="total-section">
              <div class="total-amount">
                Total Amount: $${total.toFixed(2)}
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Quote Details</div>
              <div class="detail-row">
                <span class="detail-label">Valid Until:</span>
                <span>${validUntil}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Terms:</span>
                <span>${quoteFormData.terms || 'Net 30'}</span>
              </div>
              ${quoteFormData.notes ? `
              <div style="margin-top: 15px;">
                <div class="detail-label">Additional Notes:</div>
                <div style="margin-top: 5px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
                  ${quoteFormData.notes}
                </div>
              </div>
              ` : ''}
            </div>
            
            <div class="terms-section">
              <strong>Terms & Conditions:</strong><br>
              • This quote is valid until the date specified above<br>
              • Prices are subject to change without notice<br>
              • Payment terms as specified above<br>
              • All sales are final unless otherwise specified
            </div>
            
            <div class="footer">
              <p>Thank you for considering our services!</p>
              <p>Please contact us if you have any questions about this quote.</p>
            </div>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; background-color: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Quote</button>
              <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; margin-left: 10px; background-color: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
      
    } catch (error) {
      console.error('Print quote error:', error);
      onSnackbar('Failed to open print window. Please try again.', 'error');
    }
  };

  const handleAddLead = async () => {
    try {
      await api.post('/api/sales/leads/', leadData);
      onSnackbar('Lead added successfully!', 'success');
      setAddLeadDialogOpen(false);
      setLeadData({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'website',
        status: 'new',
        notes: '',
        assigned_to: null
      });
    } catch (error) {
      onSnackbar('Error adding lead', 'error');
    }
  };

  const handleTransferStock = async () => {
    try {
      // Comprehensive validation
      const errors = [];
      
      if (!transferData.product) {
        errors.push('Product is required');
      }
      if (!transferData.from_warehouse) {
        errors.push('Source warehouse is required');
      }
      if (!transferData.to_warehouse) {
        errors.push('Destination warehouse is required');
      }
      if (transferData.from_warehouse?.id === transferData.to_warehouse?.id) {
        errors.push('Source and destination warehouses must be different');
      }
      if (!transferData.quantity || transferData.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
      }
      
      if (errors.length > 0) {
        onSnackbar(`Validation errors: ${errors.join(', ')}`, 'error');
        return;
      }

      console.log('🔄 [Stock Transfer] Starting transfer:', {
        product: transferData.product?.name,
        from: transferData.from_warehouse?.name,
        to: transferData.to_warehouse?.name,
        quantity: transferData.quantity,
        reason: transferData.reason
      });

      // Create inventory transfer
      const transferResponse = await api.post('/warehouse/transfers/create/', {
        product: transferData.product?.id,
        from_warehouse: transferData.from_warehouse?.id,
        to_warehouse: transferData.to_warehouse?.id,
        quantity: transferData.quantity,
        priority: 'medium',
        request_notes: transferData.notes || `Transfer requested: ${transferData.reason}`,
        expected_delivery_date: null
      });

      console.log('✅ [Stock Transfer] Transfer created:', transferResponse.data);

      // Create accounting entry for inventory movement
      try {
        await api.post('/accounting/journal-entries/', {
          description: `Stock Transfer: ${transferData.product?.name}`,
          entries: [
            {
              account: `Inventory - ${transferData.to_warehouse?.name}`,
              debit: transferData.quantity * (transferData.product?.cost || 0),
              credit: 0
            },
            {
              account: `Inventory - ${transferData.from_warehouse?.name}`,
              debit: 0,
              credit: transferData.quantity * (transferData.product?.cost || 0)
            }
          ]
        });
        console.log('✅ [Stock Transfer] Accounting entry created');
      } catch (accountingError) {
        console.warn('⚠️ [Stock Transfer] Accounting entry failed:', accountingError);
        // Continue with transfer completion even if accounting fails
      }

      onSnackbar('Stock transferred successfully!', 'success');
      setTransferStockDialogOpen(false);
      setTransferData({
        product: null,
        from_warehouse: null,
        to_warehouse: null,
        quantity: 1,
        reason: 'restock',
        notes: ''
      });
    } catch (error) {
      console.error('❌ [Stock Transfer] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Unknown error occurred';
      
      onSnackbar(`Error transferring stock: ${errorMessage}`, 'error');
    }
  };

  const handleAssignStock = async () => {
    try {
      await api.post('/api/inventory/agent-assignments/', {
        agent: stockAssignmentData.agent?.id,
        product: stockAssignmentData.product?.id,
        quantity: stockAssignmentData.quantity,
        warehouse: stockAssignmentData.warehouse?.id,
        notes: stockAssignmentData.notes
      });

      onSnackbar('Stock assigned to agent successfully!', 'success');
      setStockAssignmentDialogOpen(false);
      setStockAssignmentData({
        agent: null,
        product: null,
        quantity: 1,
        warehouse: null,
        notes: ''
      });
    } catch (error) {
      onSnackbar('Error assigning stock', 'error');
    }
  };

  const handleGenerateHeatMap = async () => {
    try {
      // Set loading state and generate heat map
      setHeatMapData({...heatMapData, isLoading: true, showMap: false});
      
      // Simulate processing time
      setTimeout(() => {
        setHeatMapData({...heatMapData, isLoading: false, showMap: true});
        onSnackbar('Heat map generated successfully!', 'success');
      }, 1500);
    } catch (error) {
      setHeatMapData({...heatMapData, isLoading: false, showMap: false});
      onSnackbar('Error generating heat map', 'error');
    }
  };

  const handleCreateSalesOrder = async () => {
    try {
      // Validate customer exists and has proper ID
      if (!salesOrderData.customer || !salesOrderData.customer.id) {
        onSnackbar('Please select a valid customer', 'error');
        return;
      }

      // Check if customer exists in available customers
      const customerExists = customers.find(c => c.id === salesOrderData.customer.id);
      if (!customerExists) {
        onSnackbar('Selected customer does not exist. Please refresh and try again.', 'error');
        return;
      }

      let validCustomerId = salesOrderData.customer.id;
      if (!customerExists && customers.length > 0) {
        validCustomerId = 1; // Use customer ID 1 which should exist in backend
        console.log('Using first available customer ID:', validCustomerId);
      }

      const validProducts = salesOrderData.products.filter(p => p.product && p.quantity > 0);
      if (validProducts.length === 0) {
        onSnackbar('Please add at least one product', 'error');
        return;
      }

      // Calculate totals
      const subtotal = validProducts.reduce((total, product) => total + product.quantity * product.unit_price, 0);
      
      const discountAmount = (subtotal * salesOrderData.discount_percentage) / 100;
      const finalTotal = subtotal - discountAmount;

      // Set due date for credit sales
      let dueDate = null;
      if (salesOrderData.payment_method === 'credit') {
        const today = new Date();
        dueDate = new Date(today.getTime() + (salesOrderData.customer?.payment_terms || salesOrderData.payment_terms) * 24 * 60 * 60 * 1000);
      }

      // Format data for backend API - match SalesOrder model exactly
      const orderData = {
        customer: validCustomerId, // Use the selected customer ID
        sales_agent: salesAgents[0]?.id || 1, // Use current user ID or fallback to 1
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount_percentage: parseFloat(salesOrderData.discount_percentage || 0),
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        total: parseFloat(finalTotal.toFixed(2)),
        payment_method: salesOrderData.payment_method || 'cash',
        payment_terms: parseInt(salesOrderData.customer?.payment_terms || salesOrderData.payment_terms || 30),
        due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
        status: salesOrderData.payment_method === 'credit' ? 'pending' : 'confirmed',
        payment_status: (salesOrderData.payment_method === 'cash' || salesOrderData.payment_method === 'momo') ? 'paid' : 'pending',
        notes: salesOrderData.notes || ''
      };

      // Create items as plain objects to avoid serialization issues
      const itemsArray = [];
      for (const product of validProducts) {
        itemsArray.push({
          product: parseInt(product.product.id),
          quantity: parseInt(product.quantity),
          unit_price: parseFloat(product.unit_price || 0)
        });
      }

      // Add items to order data
      orderData.items = itemsArray;

      console.log('Sales order payload:', orderData); // Debug logging
      console.log('Customer ID type:', typeof orderData.customer, orderData.customer);
      console.log('Sales agent ID:', orderData.sales_agent);
      console.log('Items data:', JSON.stringify(orderData.items, null, 2));

      const response = await api.post('/sales/sales-orders/', orderData);
      const salesOrder = response.data;

      // Create invoice after sales order
      try {
        const invoiceData = {
          sales_order: salesOrder.id,
          customer: salesOrder.customer,
          invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
          subtotal: salesOrder.subtotal,
          discount_amount: salesOrder.discount_amount,
          total: salesOrder.total,
          due_date: salesOrder.due_date,
          status: 'pending',
          notes: salesOrder.notes
        };

        await api.post('/api/accounting/invoices/', invoiceData);
      } catch (invoiceError) {
        console.warn('Failed to create invoice:', invoiceError);
        // Don't fail order creation if invoice fails
      }
      
      // Handle different payment methods
      if (salesOrderData.payment_method === 'cash' || salesOrderData.payment_method === 'momo') {
        // Immediate receipt for cash/momo sales
        await generateReceipt(salesOrder, 'paid');
        onSnackbar('Sales order created and receipt generated!', 'success');
        
        // Auto-print prompt
        setTimeout(() => {
          if (window.confirm('Sales order created successfully! Would you like to print the receipt now?')) {
            printReceipt(salesOrder, {
              receipt_number: `RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
              amount: salesOrder.total,
              payment_method: salesOrder.payment_method,
              payment_status: 'paid',
              issued_date: new Date().toISOString().split('T')[0]
            });
          }
        }, 500);
        
      } else if (salesOrderData.payment_method === 'credit') {
        // Create finance transaction for credit sales
        try {
          await api.post('/api/sales/finance-transactions/', {
            transaction_type: 'receivable',
            customer: salesOrderData.customer.id,
            sales_order: salesOrder.id,
            amount: finalTotal,
            due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
            status: 'pending',
            reference: salesOrder.order_number,
            description: `Credit Sale - ${salesOrderData.customer.name}`,
            payment_method: 'credit'
          });
        } catch (financeError) {
          console.warn('Failed to create finance transaction:', financeError);
        }
        onSnackbar('Sales order created! Awaiting finance approval for receipt generation.', 'success');
        
      } else if (salesOrderData.payment_method === 'cheque') {
        // Create finance transaction for cheque - requires approval
        try {
          await api.post('/api/sales/finance-transactions/', {
            transaction_type: 'payment',
            customer: salesOrderData.customer.id,
            sales_order: salesOrder.id,
            amount: finalTotal,
            status: 'pending',
            reference: salesOrder.order_number,
            description: `Cheque Payment - ${salesOrderData.customer.name}`,
            payment_method: 'cheque'
          });
        } catch (financeError) {
          console.warn('Failed to create finance transaction:', financeError);
        }
        onSnackbar('Sales order created! Cheque payment requires finance approval.', 'success');
      }

      setSalesOrderDialogOpen(false);
      setSalesOrderData({
        customer: null,
        products: [{ product: null, quantity: 1, unit_price: 0 }],
        payment_method: 'cash',
        discount_percentage: 0,
        notes: '',
        payment_terms: 30,
        due_date: '',
        total: 0
      });
    } catch (error) {
      console.error('Sales order creation error:', error);
      
      // Enhanced error handling for 400 errors
      let errorMessage = 'Error creating sales order';
      
      if (error.response?.status === 400 && error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          // Handle field-specific validation errors
          const fieldErrors = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              fieldErrors.push(`${field}: ${errorData[field].join(', ')}`);
            } else if (typeof errorData[field] === 'string') {
              fieldErrors.push(`${field}: ${errorData[field]}`);
            }
          });
          if (fieldErrors.length > 0) {
            errorMessage = `Validation errors: ${fieldErrors.join('; ')}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onSnackbar(errorMessage, 'error');
    }
  };

  // Generate receipt function
  const generateReceipt = async (salesOrder, paymentStatus) => {
    try {
      const receiptData = {
        sales_order: salesOrder.id,
        customer: salesOrder.customer,
        receipt_number: `RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        amount: salesOrder.total,
        payment_method: salesOrder.payment_method,
        payment_status: paymentStatus,
        issued_date: new Date().toISOString().split('T')[0],
        notes: `Receipt for ${salesOrder.order_number}`
      };

      await api.post('/api/accounting/receipts/', receiptData);
      
      // Print receipt
      printReceipt(salesOrder, receiptData);
    } catch (error) {
      console.error('Receipt generation error:', error);
      onSnackbar('Sales order created but receipt generation failed', 'warning');
    }
  };

  // Print receipt function
  const printReceipt = (salesOrder, receiptData) => {
    try {
      // Create a temporary div to hold the receipt content
      const receiptContent = createReceiptHTML(salesOrder, receiptData);
      
      // Try to open print window first (user-initiated)
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (printWindow) {
        // Pop-up allowed - use normal print window
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      } else {
        // Pop-up blocked - use alternative approach
        showPrintableReceipt(receiptContent, receiptData.receipt_number);
      }
      
    } catch (error) {
      console.error('Print receipt error:', error);
      onSnackbar('Print failed. Please try again or check browser settings.', 'error');
    }
  };

  // Create receipt HTML content
  const createReceiptHTML = (salesOrder, receiptData) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    return `
      <html>
        <head>
          <title>Receipt ${receiptData.receipt_number}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 20px; 
              line-height: 1.4;
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333; 
              padding-bottom: 15px; 
            }
            .company-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .details { 
              margin-bottom: 20px; 
              border-bottom: 1px dashed #666;
              padding-bottom: 15px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              padding: 5px 0;
            }
            .detail-label {
              font-weight: bold;
              color: #555;
            }
            .product-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .product-table th {
              background: linear-gradient(135deg, #2196F3, #1976D2);
              color: white;
              padding: 15px 10px;
              text-align: left;
              font-weight: bold;
              font-size: 14px;
            }
            .product-table td {
              padding: 12px 10px;
              border-bottom: 1px solid #ddd;
              font-size: 14px;
            }
            .product-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .product-table tr:hover {
              background-color: #f0f8ff;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .summary-section {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 40px;
            }
            .summary-table {
              width: 300px;
              border-collapse: collapse;
            }
            .summary-table td {
              padding: 8px 15px;
              border-bottom: 1px solid #eee;
              font-size: 14px;
            }
            .summary-table .total-row {
              background: linear-gradient(135deg, #2196F3, #1976D2);
              color: white;
              font-weight: bold;
              font-size: 16px;
            }
            .terms-section {
              margin-top: 40px;
              padding: 20px;
              background-color: #f8f9fa;
              border-left: 4px solid #2196F3;
            }
            .terms-title {
              font-weight: bold;
              margin-bottom: 10px;
              color: #2196F3;
            }
            .terms-content {
              font-size: 12px;
              line-height: 1.5;
              color: #666;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">SmartERP Software</div>
            <div class="details">
              <div class="detail-row">
                <span>Receipt #:</span>
                <span>${receiptData.receipt_number}</span>
              </div>
              <div class="detail-row">
                <span>Date:</span>
                <span>${currentDate}</span>
              </div>
              <div class="detail-row">
                <span>Time:</span>
                <span>${currentTime}</span>
              </div>
            </div>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span>Customer:</span>
              <span>${salesOrder.customer_name || 'Customer Name'}</span>
            </div>
            <div class="detail-row">
              <span>Order #:</span>
              <span>${salesOrder.order_number || salesOrder.id}</span>
            </div>
            <div class="detail-row">
              <span>Payment Method:</span>
              <span>${receiptData.payment_method?.toUpperCase() || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span>Payment Status:</span>
              <span>${receiptData.payment_status?.toUpperCase() || 'N/A'}</span>
            </div>
          </div>
          
          <div class="items-section">
            <h4>Items Purchased:</h4>
            ${salesOrder.items && salesOrder.items.length > 0 ? `
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${salesOrder.items.map(item => `
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
            ` : `<div>No items available</div>`}
          </div>
          
          <div class="total-section">
            <div class="total">
              <div class="detail-row">
                <span>TOTAL PAID:</span>
                <span>$${parseFloat(receiptData.amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="terms-section">
            <div class="terms-title">Payment Terms & Conditions:</div>
            <div class="terms-content">
              • Payment Method: ${(salesOrder.payment_method || 'Cash').toUpperCase()}<br>
              • Payment Terms: ${salesOrder.payment_terms || 30} days<br>
              ${salesOrder.payment_method === 'credit' ? '• Late payments may incur additional charges<br>' : ''}
              • All sales are final unless otherwise specified<br>
              • Please retain this receipt for your records<br>
              ${salesOrder.notes || salesOrderData.notes ? `• Notes: ${salesOrder.notes || salesOrderData.notes}<br>` : ''}
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p>For inquiries, please contact us at info@smarterpsoftware.com</p>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 12px 24px; font-size: 14px;">Print Receipt</button>
            <button onclick="window.close()" style="padding: 12px 24px; font-size: 14px; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `;
  };

  // Show printable receipt in current window (fallback for pop-up blockers)
  const showPrintableReceipt = (receiptHTML, receiptNumber) => {
    // Create a temporary container
    const printContainer = document.createElement('div');
    printContainer.innerHTML = receiptHTML;
    printContainer.style.position = 'fixed';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.width = '100%';
    printContainer.style.height = '100%';
    printContainer.style.backgroundColor = 'white';
    printContainer.style.zIndex = '10000';
    printContainer.style.overflow = 'auto';
    
    // Add close button functionality
    const closeButton = printContainer.querySelector('button[onclick="window.close()"]');
    if (closeButton) {
      closeButton.onclick = () => {
        document.body.removeChild(printContainer);
      };
    }
    
    // Add to document
    document.body.appendChild(printContainer);
    
    // Show notification
    onSnackbar(`Receipt ready for printing. Click "Print Receipt" button or use Ctrl+P`, 'info');
  };

  const updateProduct = (index, field, value) => {
    const products = [...salesOrderData.products];
    products[index][field] = value;
    
    // Auto-populate unit price when product is selected from centralized inventory
    if (field === 'product' && value) {
      // Use the unit_price from the centralized product data
      products[index].unit_price = value.unit_price || (value.prices && value.prices.length > 0 ? value.prices[0].price : 0);
    }
    
    setSalesOrderData({...salesOrderData, products});
  };

  const addProduct = () => {
    const products = [...salesOrderData.products];
    products.push({ product: null, quantity: 1, unit_price: 0 });
    setSalesOrderData({...salesOrderData, products});
  };

  const removeProduct = (index) => {
    const products = [...salesOrderData.products];
    products.splice(index, 1);
    setSalesOrderData({...salesOrderData, products});
  };

  const subtotal = salesOrderData.products.reduce((total, product) => total + product.quantity * product.unit_price, 0);
  const discountAmount = (subtotal * salesOrderData.discount_percentage) / 100;
  const finalTotal = subtotal - discountAmount;

  useEffect(() => {
    // Listen for product updates to refresh product list
    const handleProductUpdate = (event) => {
      console.log('Product updated, refreshing product list in sales form');
      // Trigger product list refresh in parent component
      if (onRefreshProducts) {
        onRefreshProducts();
      }
    };

    window.addEventListener('productUpdated', handleProductUpdate);
    return () => window.removeEventListener('productUpdated', handleProductUpdate);
  }, [onRefreshProducts]);

  // Generate invoice function - called immediately after sales order creation
  const generateInvoice = (salesOrder, orderItems) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        onSnackbar('Pop-up blocked. Please allow pop-ups to print invoices.', 'warning');
        return;
      }

      const currentDate = new Date().toLocaleDateString();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // Use the order items from the form data since backend might not return items
      const itemsToDisplay = orderItems || salesOrderData.products?.filter(p => p.product && p.quantity > 0) || [];
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoiceNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                line-height: 1.6;
                color: #333;
              }
              .invoice-header { 
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px; 
                border-bottom: 3px solid #2196F3; 
                padding-bottom: 20px; 
              }
              .company-info {
                flex: 1;
              }
              .company-name {
                font-size: 28px;
                font-weight: bold;
                color: #2196F3;
                margin-bottom: 5px;
              }
              .company-details {
                font-size: 14px;
                color: #666;
                line-height: 1.4;
              }
              .invoice-info {
                text-align: right;
                flex: 1;
              }
              .invoice-title {
                font-size: 36px;
                font-weight: bold;
                color: #2196F3;
                margin-bottom: 10px;
              }
              .invoice-details {
                font-size: 14px;
                line-height: 1.8;
              }
              .billing-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
              }
              .billing-info {
                flex: 1;
                margin-right: 40px;
              }
              .billing-title {
                font-size: 16px;
                font-weight: bold;
                color: #2196F3;
                margin-bottom: 15px;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
              }
              .billing-details {
                font-size: 14px;
                line-height: 1.6;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .items-table th {
                background: linear-gradient(135deg, #2196F3, #1976D2);
                color: white;
                padding: 15px 10px;
                text-align: left;
                font-weight: bold;
                font-size: 14px;
              }
              .items-table td {
                padding: 12px 10px;
                border-bottom: 1px solid #ddd;
                font-size: 14px;
              }
              .items-table tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .items-table tr:hover {
                background-color: #f0f8ff;
              }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .summary-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 40px;
              }
              .summary-table {
                width: 300px;
                border-collapse: collapse;
              }
              .summary-table td {
                padding: 8px 15px;
                border-bottom: 1px solid #eee;
                font-size: 14px;
              }
              .summary-table .total-row {
                background: linear-gradient(135deg, #2196F3, #1976D2);
                color: white;
                font-weight: bold;
                font-size: 16px;
              }
              .terms-section {
                margin-top: 40px;
                padding: 20px;
                background-color: #f8f9fa;
                border-left: 4px solid #2196F3;
              }
              .terms-title {
                font-weight: bold;
                margin-bottom: 10px;
                color: #2196F3;
              }
              .terms-content {
                font-size: 12px;
                line-height: 1.5;
                color: #666;
              }
              .footer {
                margin-top: 50px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #eee;
                padding-top: 20px;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-header">
              <div class="company-info">
                <div class="company-name">SmartERP Software</div>
                <div class="company-details">
                  Enterprise Resource Planning System<br>
                  123 Business Street<br>
                  Accra, Ghana<br>
                  Phone: +233 20 123 4567<br>
                  Email: info@smarterpsoftware.com
                </div>
              </div>
              <div class="invoice-info">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-details">
                  <strong>Invoice #:</strong> ${invoiceNumber}<br>
                  <strong>Date:</strong> ${currentDate}<br>
                  <strong>Order #:</strong> ${salesOrder.order_number || 'N/A'}<br>
                  ${salesOrder.due_date ? `<strong>Due Date:</strong> ${new Date(salesOrder.due_date).toLocaleDateString()}<br>` : ''}
                </div>
              </div>
            </div>
            
            <div class="billing-section">
              <div class="billing-info">
                <div class="billing-title">Bill To:</div>
                <div class="billing-details">
                  <strong>${salesOrderData.customer?.name || 'Customer Name'}</strong><br>
                  ${salesOrderData.customer?.email || ''}<br>
                  ${salesOrderData.customer?.phone || ''}<br>
                  ${salesOrderData.customer?.address || ''}
                </div>
              </div>
              <div class="billing-info">
                <div class="billing-title">Sales Agent:</div>
                <div class="billing-details">
                  <strong>${salesAgents[0]?.name || 'Sales Agent'}</strong><br>
                  ${salesAgents[0]?.email || ''}<br>
                  Department: Sales
                </div>
              </div>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 40%">Product Description</th>
                  <th style="width: 15%" class="text-center">SKU</th>
                  <th style="width: 10%" class="text-center">Qty</th>
                  <th style="width: 15%" class="text-right">Unit Price</th>
                  <th style="width: 20%" class="text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsToDisplay.map(product => {
                  const quantity = parseInt(product.quantity || 0);
                  const unitPrice = parseFloat(product.unit_price || product.product?.unit_price || product.product?.price || 0);
                  const lineTotal = quantity * unitPrice;
                  
                  return `
                    <tr>
                      <td><strong>${product.product?.name || 'Product'}</strong></td>
                      <td class="text-center">${product.product?.sku || 'N/A'}</td>
                      <td class="text-center">${quantity}</td>
                      <td class="text-right">$${unitPrice.toFixed(2)}</td>
                      <td class="text-right">$${lineTotal.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
            <div class="summary-section">
              <table class="summary-table">
                <tr>
                  <td><strong>Subtotal:</strong></td>
                  <td class="text-right">$${(salesOrder.subtotal || 0).toFixed(2)}</td>
                </tr>
                ${(salesOrder.discount_amount || 0) > 0 ? `
                <tr>
                  <td><strong>Discount (${salesOrder.discount_percentage || 0}%):</strong></td>
                  <td class="text-right">-$${(salesOrder.discount_amount || 0).toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td><strong>TOTAL AMOUNT:</strong></td>
                  <td class="text-right"><strong>$${(salesOrder.total || 0).toFixed(2)}</strong></td>
                </tr>
              </table>
            </div>
            
            <div class="terms-section">
              <div class="terms-title">Payment Terms & Conditions:</div>
              <div class="terms-content">
                • Payment Method: ${(salesOrder.payment_method || 'Cash').toUpperCase()}<br>
                • Payment Terms: ${salesOrder.payment_terms || 30} days<br>
                ${salesOrder.payment_method === 'credit' ? '• Late payments may incur additional charges<br>' : ''}
                • All sales are final unless otherwise specified<br>
                • Please retain this invoice for your records<br>
                ${salesOrder.notes || salesOrderData.notes ? `• Notes: ${salesOrder.notes || salesOrderData.notes}<br>` : ''}
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Thank you for your business!</strong></p>
              <p>This is a computer-generated invoice and does not require a signature.</p>
              <p>For inquiries, please contact us at info@smarterpsoftware.com</p>
            </div>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="padding: 12px 24px; font-size: 14px;">Print Invoice</button>
              <button onclick="window.close()" style="padding: 12px 24px; font-size: 14px; margin-left: 10px;">Close</button>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Auto-focus and print
      setTimeout(() => {
        printWindow.focus();
        if (window.confirm('Invoice generated successfully! Would you like to print it now?')) {
          printWindow.print();
        }
      }, 500);
      
    } catch (error) {
      console.error('Invoice generation error:', error);
      onSnackbar('Failed to generate invoice', 'error');
    }
  };

  const handleCreateCustomer = async () => {
    try {
      // Comprehensive form validation
      const errors = [];
      
      if (!customerData.name?.trim()) {
        errors.push('Customer name is required');
      }
      
      if (!customerData.email?.trim()) {
        errors.push('Email address is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
        errors.push('Please enter a valid email address');
      }
      
      if (!customerData.phone?.trim()) {
        errors.push('Phone number is required');
      }
      
      if (!customerData.address?.trim()) {
        errors.push('Address is required');
      }
      
      if (errors.length > 0) {
        onSnackbar(`Validation errors: ${errors.join(', ')}`, 'error');
        return;
      }

      // Prepare customer data with proper field mapping
      const customerPayload = {
        name: customerData.name.trim(),
        email: customerData.email.trim().toLowerCase(),
        phone: customerData.phone.trim(),
        address: customerData.address.trim(),
        customer_type: customerData.customer_type || 'retailer',
        payment_terms: customerData.payment_terms || 30,
        latitude: customerData.latitude,
        longitude: customerData.longitude,
        location_accuracy: customerData.location_accuracy,
        location_timestamp: customerData.location_timestamp,
        // Add optional fields if they exist
        ...(customerData.priority && { priority: customerData.priority }),
        ...(customerData.estimated_value && { estimated_value: parseFloat(customerData.estimated_value) }),
        ...(customerData.notes && { notes: customerData.notes.trim() })
      };

      const response = await api.post('/sales/customers/', customerPayload);
      console.log('Customer creation response:', response.data);
      
      // Update shared customer data immediately
      if (response.data) {
        // Add to shared customers array
        const { sharedCustomers, addCustomer } = await import('./sharedData');
        addCustomer(response.data);
      }
      
      // Create accounts receivable account
      try {
        await api.post('/accounting/chart-of-accounts/', {
          name: `Accounts Receivable - ${customerData.name}`,
          account_type: 'asset',
          parent_account: 'Accounts Receivable'
        });
      } catch (accountingError) {
        console.warn('Failed to create accounting entry:', accountingError);
        // Don't fail customer creation if accounting fails
      }

      onSnackbar('Customer created successfully!', 'success');
      setCustomerCreationDialogOpen(false);
      
      // Force refresh customers list with a small delay to ensure backend consistency
      setTimeout(() => {
        refreshCustomers();
      }, 500);
      
      // Reset form with all fields
      setCustomerData({
        name: '',
        email: '',
        phone: '',
        address: '',
        customer_type: 'retailer',
        payment_terms: 30,
        latitude: null,
        longitude: null,
        location_accuracy: null,
        location_timestamp: null,
        priority: 'medium',
        estimated_value: '',
        notes: ''
      });
    } catch (error) {
      console.error('Customer creation error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Error creating customer';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.email && Array.isArray(errorData.email)) {
          errorMessage = `Email error: ${errorData.email.join(', ')}`;
        } else if (errorData.latitude && Array.isArray(errorData.latitude)) {
          errorMessage = `GPS Latitude error: ${errorData.latitude.join(', ')}`;
        } else if (errorData.longitude && Array.isArray(errorData.longitude)) {
          errorMessage = `GPS Longitude error: ${errorData.longitude.join(', ')}`;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(', ');
        } else {
          // Handle field-specific errors
          const fieldErrors = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              fieldErrors.push(`${field}: ${errorData[field].join(', ')}`);
            }
          });
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('; ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onSnackbar(errorMessage, 'error');
    }
  };

  return (
    <>
      {/* Promotions Dialog */}
      <Dialog 
        open={promotionsDialogOpen} 
        onClose={() => setPromotionsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 2
        }}>
          <AttachMoneyIcon />
          Create Promotion
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          {/* Basic Promotion Details */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <AttachMoneyIcon sx={{ color: '#4CAF50' }} />
              <Typography variant="h6" fontWeight="bold">Promotion Details</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Promotion Name*"
                    value={promotionData.name}
                    onChange={(e) => setPromotionData({...promotionData, name: e.target.value})}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={promotionData.description}
                    onChange={(e) => setPromotionData({...promotionData, description: e.target.value})}
                    placeholder="Describe the promotion details"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Discount Configuration */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <DescriptionIcon sx={{ color: '#4CAF50' }} />
              <Typography variant="h6" fontWeight="bold">Discount Configuration</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      value={promotionData.discount_type}
                      onChange={(e) => setPromotionData({...promotionData, discount_type: e.target.value})}
                      label="Discount Type"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="percentage">Percentage (%)</MenuItem>
                      <MenuItem value="fixed">Fixed Amount ($)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Discount Value"
                    type="number"
                    value={promotionData.discount_value}
                    onChange={(e) => setPromotionData({...promotionData, discount_value: parseFloat(e.target.value) || 0})}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>
                        {promotionData.discount_type === 'percentage' ? '%' : '$'}
                      </Typography>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={promotionData.start_date}
                    onChange={(e) => setPromotionData({...promotionData, start_date: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={promotionData.end_date}
                    onChange={(e) => setPromotionData({...promotionData, end_date: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Minimum Order Amount"
                    type="number"
                    value={promotionData.minimum_order}
                    onChange={(e) => setPromotionData({...promotionData, minimum_order: parseFloat(e.target.value) || 0})}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setPromotionsDialogOpen(false)}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              color: '#666'
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreatePromotion}
            startIcon={<AddIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)' }
            }}
          >
            Create Promotion
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Customer Dialog */}
      <Dialog 
        open={customerCreationDialogOpen} 
        onClose={() => setCustomerCreationDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #FF8C00 0%, #FF6347 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 2
        }}>
          <PersonAddIcon />
          Create New Customer
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          {/* Basic Information Section */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <PersonIcon sx={{ color: '#FF8C00' }} />
              <Typography variant="h6" fontWeight="bold">Basic Information</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ position: 'relative' }}>
                    <PersonIcon sx={{ 
                      position: 'absolute', 
                      left: 12, 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#666',
                      zIndex: 1
                    }} />
                    <TextField
                      fullWidth
                      label="Customer Name*"
                      value={customerData.name}
                      onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                      required
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          pl: 5,
                          borderRadius: 2 
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ position: 'relative' }}>
                    <EmailIcon sx={{ 
                      position: 'absolute', 
                      left: 12, 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#666',
                      zIndex: 1
                    }} />
                    <TextField
                      fullWidth
                      label="Email Address*"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                      required
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          pl: 5,
                          borderRadius: 2 
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ position: 'relative' }}>
                    <PhoneIcon sx={{ 
                      position: 'absolute', 
                      left: 12, 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#666',
                      zIndex: 1
                    }} />
                    <TextField
                      fullWidth
                      label="Phone Number*"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          pl: 5,
                          borderRadius: 2 
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Business Details Section */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <BusinessIcon sx={{ color: '#FF8C00' }} />
              <Typography variant="h6" fontWeight="bold">Business Details</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Select Customer Type
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: customerData.customer_type === 'wholesaler' ? '2px solid #4CAF50' : '1px solid #ddd',
                      bgcolor: customerData.customer_type === 'wholesaler' ? '#f8fff8' : 'white',
                      '&:hover': { boxShadow: 3 },
                      textAlign: 'center',
                      p: 2
                    }}
                    onClick={() => setCustomerData({...customerData, customer_type: 'wholesaler'})}
                  >
                    <DomainIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Wholesaler</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bulk purchases, volume discounts
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: customerData.customer_type === 'distributor' ? '2px solid #2196F3' : '1px solid #ddd',
                      bgcolor: customerData.customer_type === 'distributor' ? '#f8fcff' : 'white',
                      '&:hover': { boxShadow: 3 },
                      textAlign: 'center',
                      p: 2
                    }}
                    onClick={() => setCustomerData({...customerData, customer_type: 'distributor'})}
                  >
                    <BusinessIcon sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Distributor</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Regional distribution network
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: customerData.customer_type === 'retailer' ? '2px solid #FF9800' : '1px solid #ddd',
                      bgcolor: customerData.customer_type === 'retailer' ? '#FF9800' : 'white',
                      color: customerData.customer_type === 'retailer' ? 'white' : 'inherit',
                      '&:hover': { boxShadow: 3 },
                      textAlign: 'center',
                      p: 2
                    }}
                    onClick={() => setCustomerData({...customerData, customer_type: 'retailer'})}
                  >
                    <StoreIcon sx={{ fontSize: 40, color: customerData.customer_type === 'retailer' ? 'white' : '#FF9800', mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Retailer</Typography>
                    <Typography variant="body2" sx={{ opacity: customerData.customer_type === 'retailer' ? 0.9 : 0.6 }}>
                      Direct sales to consumers
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Terms</InputLabel>
                    <Select
                      value={customerData.payment_terms}
                      onChange={(e) => setCustomerData({...customerData, payment_terms: e.target.value})}
                      label="Payment Terms"
                    >
                      <MenuItem value={15}>15 Days</MenuItem>
                      <MenuItem value={30}>30 Days - Standard terms</MenuItem>
                      <MenuItem value={45}>45 Days</MenuItem>
                      <MenuItem value={60}>60 Days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority Level</InputLabel>
                    <Select
                      value={customerData.priority || 'medium'}
                      onChange={(e) => setCustomerData({...customerData, priority: e.target.value})}
                      label="Priority Level"
                    >
                      <MenuItem value="high">High Priority</MenuItem>
                      <MenuItem value="medium">Medium Priority</MenuItem>
                      <MenuItem value="low">Low Priority</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <TextField
                fullWidth
                label="Estimated Annual Value"
                placeholder="Expected annual business value (optional)"
                value={customerData.estimated_value || ''}
                onChange={(e) => setCustomerData({...customerData, estimated_value: e.target.value})}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </CardContent>
          </Card>

          {/* Location & Address Section */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <HomeIcon sx={{ color: '#FF8C00' }} />
              <Typography variant="h6" fontWeight="bold">Location & Address</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ position: 'relative', mb: 3 }}>
                <HomeIcon sx={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: 20, 
                  color: '#666',
                  zIndex: 1
                }} />
                <TextField
                  fullWidth
                  label="Customer Address*"
                  multiline
                  rows={3}
                  value={customerData.address}
                  onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                  placeholder="Complete business address"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      pl: 5,
                      borderRadius: 2
                    }
                  }}
                />
              </Box>
              
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                GPS Coordinates (Optional)
              </Typography>
              <Card sx={{ 
                bgcolor: '#FFF8E1', 
                border: '2px dashed #FF9800',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#FFF3C4' }
              }}
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setCustomerData({
                        ...customerData,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        location_accuracy: position.coords.accuracy,
                        location_timestamp: new Date().toISOString()
                      });
                      // Show success feedback
                      onSnackbar(`GPS location captured: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`, 'success');
                    },
                    (error) => {
                      console.error('GPS Error:', error);
                      onSnackbar('Failed to capture GPS location. Please enable location services.', 'error');
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 10000,
                      maximumAge: 60000
                    }
                  );
                } else {
                  onSnackbar('GPS not supported by this browser', 'error');
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <LocationOnIcon sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Capture GPS Location</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to get current location for precise mapping
                  </Typography>
                </CardContent>
              </Card>
              
              {customerData.latitude && customerData.longitude && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#E8F5E8', borderRadius: 1 }}>
                  <Typography variant="body2">
                    📍 GPS Location: {customerData.latitude.toFixed(6)}, {customerData.longitude.toFixed(6)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accuracy: {customerData.location_accuracy} meters
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Timestamp: {customerData.location_timestamp}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Additional Information Section */}
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <NotesIcon sx={{ color: '#FF8C00' }} />
              <Typography variant="h6" fontWeight="bold">Additional Information</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <TextField
                fullWidth
                label="Notes & Comments"
                multiline
                rows={4}
                value={customerData.notes || ''}
                onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
                placeholder="Any additional information about this customer"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setCustomerCreationDialogOpen(false)}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              color: '#666'
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateCustomer}
            startIcon={<AddIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)' }
            }}
          >
            Create Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quote Dialog */}
      <Dialog 
        open={quoteDialogOpen} 
        onClose={() => setQuoteDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 2
        }}>
          <DescriptionIcon />
          Generate Quote
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          {/* Customer Information */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <PersonIcon sx={{ color: '#9C27B0' }} />
              <Typography variant="h6" fontWeight="bold">Customer Information</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => option.name}
                value={quoteData.customer}
                onChange={(event, newValue) => setQuoteData({...quoteData, customer: newValue})}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Select Customer*" 
                    required 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <DescriptionIcon sx={{ color: '#9C27B0' }} />
              <Typography variant="h6" fontWeight="bold">Quote Details</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={products}
                    getOptionLabel={(option) => `${option.sku} - ${option.name}`}
                    value={quoteData.product}
                    onChange={(event, newValue) => setQuoteData({...quoteData, product: newValue})}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Select Product*" 
                        required 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quantity*"
                    type="number"
                    value={quoteData.quantity}
                    onChange={(e) => setQuoteData({...quoteData, quantity: parseInt(e.target.value) || 1})}
                    inputProps={{ min: 1 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Unit Price"
                    type="number"
                    value={quoteData.unit_price}
                    onChange={(e) => setQuoteData({...quoteData, unit_price: parseFloat(e.target.value) || 0})}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valid Until"
                    type="date"
                    value={quoteData.valid_until}
                    onChange={(e) => setQuoteData({...quoteData, valid_until: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    value={`$${(quoteData.quantity * parseFloat(quoteData.unit_price || 0)).toFixed(2)}`}
                    InputProps={{ readOnly: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f5f5f5' } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Terms & Notes */}
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <NotesIcon sx={{ color: '#9C27B0' }} />
              <Typography variant="h6" fontWeight="bold">Terms & Notes</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Terms & Conditions"
                    multiline
                    rows={3}
                    value={quoteData.terms}
                    onChange={(e) => setQuoteData({...quoteData, terms: e.target.value})}
                    placeholder="Payment terms, delivery conditions, etc."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    multiline
                    rows={3}
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})}
                    placeholder="Any additional information"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setQuoteDialogOpen(false)}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              color: '#666'
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleGenerateQuote}
            startIcon={<PrintIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%)' }
            }}
          >
            Generate & Print Quote
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Stock Dialog */}
      <Dialog 
        open={transferStockDialogOpen} 
        onClose={() => setTransferStockDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 2
        }}>
          <TransferIcon />
          Transfer Stock
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          {/* Product Selection */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <DescriptionIcon sx={{ color: '#FF5722' }} />
              <Typography variant="h6" fontWeight="bold">Product Selection</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.sku} - ${option.name}`}
                value={transferData.product}
                onChange={(event, newValue) => setTransferData({...transferData, product: newValue})}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Select Product*" 
                    required 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Transfer Details */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TransferIcon sx={{ color: '#FF5722' }} />
              <Typography variant="h6" fontWeight="bold">Transfer Details</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={warehouses}
                    getOptionLabel={(option) => option.name}
                    value={transferData.from_warehouse}
                    onChange={(event, newValue) => setTransferData({...transferData, from_warehouse: newValue})}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="From Warehouse*" 
                        required 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={warehouses}
                    getOptionLabel={(option) => option.name}
                    value={transferData.to_warehouse}
                    onChange={(event, newValue) => setTransferData({...transferData, to_warehouse: newValue})}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="To Warehouse*" 
                        required 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quantity*"
                    type="number"
                    value={transferData.quantity}
                    onChange={(e) => setTransferData({...transferData, quantity: parseInt(e.target.value) || 1})}
                    inputProps={{ min: 1 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Transfer Reason</InputLabel>
                    <Select
                      value={transferData.reason}
                      onChange={(e) => setTransferData({...transferData, reason: e.target.value})}
                      label="Transfer Reason"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="restock">Restock</MenuItem>
                      <MenuItem value="demand">High Demand</MenuItem>
                      <MenuItem value="expiry">Near Expiry</MenuItem>
                      <MenuItem value="damage">Damage</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ 
              bgcolor: '#f0f0f0', 
              p: 2, 
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <NotesIcon sx={{ color: '#FF5722' }} />
              <Typography variant="h6" fontWeight="bold">Additional Information</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <TextField
                fullWidth
                label="Transfer Notes"
                multiline
                rows={3}
                value={transferData.notes}
                onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
                placeholder="Add any additional notes about this transfer"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setTransferStockDialogOpen(false)}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              color: '#666'
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleTransferStock}
            startIcon={<TransferIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #D84315 0%, #BF360C 100%)' }
            }}
          >
            Transfer Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Transfers Dialog */}
      <Dialog 
        open={viewTransfersDialogOpen} 
        onClose={() => setViewTransfersDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 2
        }}>
          <VisibilityIcon />
          View Stock Transfers
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Transfer ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>From</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>To</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { id: 'TRF001', product: 'Paracetamol 500mg', from: 'Main Warehouse', to: 'Branch A', quantity: 100, status: 'Pending', date: '2024-01-15' },
                      { id: 'TRF002', product: 'Surgical Gloves', from: 'Branch A', to: 'Branch B', quantity: 50, status: 'Completed', date: '2024-01-14' },
                      { id: 'TRF003', product: 'Medical Masks', from: 'Main Warehouse', to: 'Branch C', quantity: 200, status: 'In Transit', date: '2024-01-13' }
                    ].map((transfer) => (
                      <TableRow key={transfer.id} hover>
                        <TableCell>{transfer.id}</TableCell>
                        <TableCell>{transfer.product}</TableCell>
                        <TableCell>{transfer.from}</TableCell>
                        <TableCell>{transfer.to}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>
                          <Chip 
                            label={transfer.status} 
                            color={transfer.status === 'Completed' ? 'success' : transfer.status === 'Pending' ? 'warning' : 'info'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transfer.date}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton size="small" color="secondary">
                            <PrintIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setViewTransfersDialogOpen(false)}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              color: '#666'
            }}
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #455A64 0%, #37474F 100%)' }
            }}
          >
            New Transfer
          </Button>
        </DialogActions>
      </Dialog>

      {/* POS Transactions Dialog */}
      <Dialog 
        open={posTransactionsDialogOpen} 
        onClose={() => setPosTransactionsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 2
        }}>
          <PointOfSaleIcon />
          POS Transactions
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Point of Sale transaction management and processing
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Transaction ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Payment Method</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { id: 'POS001', customer: 'Accra Medical Center', amount: 1250.00, payment: 'Cash', status: 'Completed', date: '2024-01-15' },
                      { id: 'POS002', customer: 'Kumasi Health Clinic', amount: 850.00, payment: 'Card', status: 'Completed', date: '2024-01-14' },
                      { id: 'POS003', customer: 'Takoradi Pharmacy', amount: 650.00, payment: 'Mobile Money', status: 'Completed', date: '2024-01-13' }
                    ].map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell>{transaction.customer}</TableCell>
                        <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                        <TableCell>{transaction.payment}</TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.status} 
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <PrintIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setPosTransactionsDialogOpen(false)}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              color: '#666'
            }}
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)' }
            }}
          >
            New POS Sale
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transactions Dialog */}
      <Dialog 
        open={transactionsDialogOpen} 
        onClose={() => setTransactionsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 2
        }}>
          <ReceiptIcon />
          Transaction History
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Complete transaction history with financial integration
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Transaction ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Customer/Vendor</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { id: 'TXN001', type: 'Sale', customer: 'Accra Medical Center', amount: 1250.00, status: 'Completed', date: '2024-01-15' },
                      { id: 'TXN002', type: 'Quote', customer: 'Kumasi Health Clinic', amount: 850.00, status: 'Pending', date: '2024-01-14' },
                      { id: 'TXN003', type: 'Purchase', customer: 'PharmaCorp Ltd', amount: 5000.00, status: 'Completed', date: '2024-01-13' }
                    ].map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.type} 
                            color={transaction.type === 'Sale' ? 'success' : transaction.type === 'Quote' ? 'warning' : 'info'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.customer}</TableCell>
                        <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.status} 
                            color={transaction.status === 'Completed' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton size="small" color="secondary">
                            <PrintIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setTransactionsDialogOpen(false)}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              color: '#666'
            }}
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)' }
            }}
          >
            New Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Heat Map Dialog */}
      <Dialog 
        open={customerHeatMapDialogOpen} 
        onClose={() => setCustomerHeatMapDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <MapIcon />
          Customer Heat Map
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={heatMapData.timePeriod}
                  onChange={(e) => setHeatMapData({...heatMapData, timePeriod: e.target.value})}
                  label="Time Period"
                >
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="90days">Last 90 Days</MenuItem>
                  <MenuItem value="1year">Last Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={heatMapData.region}
                  onChange={(e) => setHeatMapData({...heatMapData, region: e.target.value})}
                  label="Region"
                >
                  <MenuItem value="all">All Regions</MenuItem>
                  <MenuItem value="north">Northern Region</MenuItem>
                  <MenuItem value="south">Southern Region</MenuItem>
                  <MenuItem value="east">Eastern Region</MenuItem>
                  <MenuItem value="west">Western Region</MenuItem>
                  <MenuItem value="central">Central Region</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              {heatMapData.showMap ? (
                <CustomerHeatMap customers={customers} />
              ) : (
                <Box sx={{ 
                  height: 400, 
                  bgcolor: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', 
                  borderRadius: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px dashed #2196F3'
                }}>
                  {heatMapData.isLoading ? (
                    <>
                      <CircularProgress sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Generating heat map...
                      </Typography>
                    </>
                  ) : (
                    <>
                      <MapIcon sx={{ fontSize: 60, color: '#2196F3', mb: 2 }} />
                      <Typography variant="h6" color="primary" textAlign="center">
                        Interactive Customer Heat Map
                      </Typography>
                      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                        Visualization will load here showing customer density and activity
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerHeatMapDialogOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={handleGenerateHeatMap}
            startIcon={<VisibilityIcon />}
            sx={{ 
              background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)' }
            }}
          >
            Generate Heat Map
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sales Order Dialog */}
      <Dialog 
        open={salesOrderDialogOpen} 
        onClose={() => setSalesOrderDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 2
        }}>
          <SellIcon />
          Create Sales Order
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          {/* Customer Selection */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#FF9800' }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">Customer</Typography>
              </Box>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => option.name}
                value={salesOrderData.customer}
                onChange={(event, newValue) => {
                  setSalesOrderData({
                    ...salesOrderData, 
                    customer: newValue,
                    payment_terms: newValue?.payment_terms || 30
                  });
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Select Customer*" 
                    required 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Products Section */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Products</Typography>
              
              {salesOrderData.products.map((product, index) => (
                <Card key={index} sx={{ mb: 2, p: 2, border: product.product ? '2px solid #2196F3' : '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: '#4CAF50', 
                          borderRadius: 1, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {product.product?.sku?.substring(0, 2) || 'PR'}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Autocomplete
                            options={products}
                            getOptionLabel={(option) => `${option.sku} - ${option.name}`}
                            value={product.product}
                            onChange={(event, newValue) => updateProduct(index, 'product', newValue)}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                label="Product" 
                                variant="standard"
                                sx={{ '& .MuiInput-root': { fontSize: '0.9rem' } }}
                              />
                            )}
                          />
                          {product.product && (
                            <Typography variant="body2" color="text.secondary">
                              {product.product.name}
                            </Typography>
                          )}
                          <Typography variant="body2" color="success.main" fontWeight="bold">
                            ${parseFloat(product.unit_price || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1 }}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>#</Typography>
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <IconButton 
                        color="error" 
                        onClick={() => removeProduct(index)}
                        disabled={salesOrderData.products.length === 1}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Card>
              ))}
              
              <Button 
                variant="outlined" 
                onClick={addProduct}
                startIcon={<AddIcon />}
                sx={{ 
                  mt: 2,
                  borderColor: '#4CAF50',
                  color: '#4CAF50',
                  '&:hover': {
                    borderColor: '#388E3C',
                    backgroundColor: 'rgba(76, 175, 80, 0.04)'
                  }
                }}
              >
                Add Another Product
              </Button>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Payment Information</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={salesOrderData.payment_method}
                      onChange={(e) => setSalesOrderData({...salesOrderData, payment_method: e.target.value})}
                      label="Payment Method"
                      startAdornment={<PaymentIcon sx={{ mr: 1, color: '#2196F3' }} />}
                    >
                      <MenuItem value="cash">💵 Cash</MenuItem>
                      <MenuItem value="credit">📋 Credit</MenuItem>
                      <MenuItem value="cheque">🏦 Cheque</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Discount (%)"
                    type="number"
                    value={salesOrderData.discount_percentage}
                    onChange={(e) => setSalesOrderData({...salesOrderData, discount_percentage: parseFloat(e.target.value) || 0})}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: '#FF9800' }}>%</Typography>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={salesOrderData.notes || ''}
                    onChange={(e) => setSalesOrderData({...salesOrderData, notes: e.target.value})}
                    placeholder="Notes"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>

              {/* Payment Terms for Credit Sales */}
              {salesOrderData.payment_method === 'credit' && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#E3F2FD', borderRadius: 2 }}>
                  <Typography variant="body2">
                    Credit Terms: {salesOrderData.customer?.payment_terms || salesOrderData.payment_terms} days
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payment due: {new Date(Date.now() + (salesOrderData.customer?.payment_terms || salesOrderData.payment_terms) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Total Section */}
          <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#f9f9f9' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Total</Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
                </Box>
                {discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="error">Discount ({salesOrderData.discount_percentage}%):</Typography>
                    <Typography variant="body1" color="error">-${discountAmount.toFixed(2)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" fontWeight="bold">Total:</Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    ${finalTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5', gap: 2 }}>
          <Button 
            onClick={() => setSalesOrderDialogOpen(false)}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              color: '#666'
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateSalesOrder}
            startIcon={<CheckCircleIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #F57C00 0%, #D84315 100%)' }
            }}
          >
            Create Order & Print
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickActionDialogs;
