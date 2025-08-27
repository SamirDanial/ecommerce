import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const notificationTemplates = [
  // Order Notifications
  {
    name: 'new_order_placed',
    type: 'ORDER_PLACED',
    category: 'ORDERS',
    title: 'New Order #{{orderNumber}}',
    message: 'A new order has been placed by {{customerName}} for {{total}} {{currency}}. Order contains {{itemCount}} items.',
    variables: ['orderNumber', 'customerName', 'total', 'currency', 'itemCount'],
    isActive: true
  },
  {
    name: 'order_status_changed',
    type: 'ORDER_STATUS_CHANGED',
    category: 'ORDERS',
    title: 'Order #{{orderNumber}} Status Updated',
    message: 'Order #{{orderNumber}} status has been changed to {{newStatus}} by {{updatedBy}}.',
    variables: ['orderNumber', 'newStatus', 'updatedBy'],
    isActive: true
  },
  {
    name: 'payment_received',
    type: 'PAYMENT_RECEIVED',
    category: 'FINANCIAL',
    title: 'Payment Received for Order #{{orderNumber}}',
    message: 'Payment of {{amount}} {{currency}} has been received for order #{{orderNumber}} from {{customerName}}.',
    variables: ['orderNumber', 'amount', 'currency', 'customerName'],
    isActive: true
  },
  {
    name: 'payment_failed',
    type: 'PAYMENT_FAILED',
    category: 'FINANCIAL',
    title: 'Payment Failed for Order #{{orderNumber}}',
    message: 'Payment of {{amount}} {{currency}} failed for order #{{orderNumber}} from {{customerName}}. Reason: {{reason}}',
    variables: ['orderNumber', 'amount', 'currency', 'customerName', 'reason'],
    isActive: true
  },
  {
    name: 'shipping_update',
    type: 'SHIPPING_UPDATE',
    category: 'ORDERS',
    title: 'Shipping Update for Order #{{orderNumber}}',
    message: 'Order #{{orderNumber}} has been {{shippingAction}} by {{shippingCompany}}. Tracking: {{trackingNumber}}',
    variables: ['orderNumber', 'shippingAction', 'shippingCompany', 'trackingNumber'],
    isActive: true
  },
  {
    name: 'order_cancelled',
    type: 'ORDER_CANCELLED',
    category: 'ORDERS',
    title: 'Order #{{orderNumber}} Cancelled',
    message: 'Order #{{orderNumber}} has been cancelled by {{cancelledBy}}. Reason: {{reason}}',
    variables: ['orderNumber', 'cancelledBy', 'reason'],
    isActive: true
  },
  {
    name: 'refund_requested',
    type: 'REFUND_REQUESTED',
    category: 'FINANCIAL',
    title: 'Refund Requested for Order #{{orderNumber}}',
    message: 'Refund request of {{amount}} {{currency}} for order #{{orderNumber}} from {{customerName}}. Reason: {{reason}}',
    variables: ['orderNumber', 'amount', 'currency', 'customerName', 'reason'],
    isActive: true
  },

  // Product Notifications
  {
    name: 'product_review',
    type: 'PRODUCT_REVIEW',
    category: 'PRODUCTS',
    title: 'New Review for {{productName}}',
    message: '{{customerName}} left a {{rating}}-star review for {{productName}}: "{{reviewText}}"',
    variables: ['productName', 'customerName', 'rating', 'reviewText'],
    isActive: true
  },
  {
    name: 'product_question',
    type: 'PRODUCT_QUESTION',
    category: 'PRODUCTS',
    title: 'Question about {{productName}}',
    message: '{{customerName}} asked: "{{question}}" about {{productName}}',
    variables: ['productName', 'customerName', 'question'],
    isActive: true
  },
  {
    name: 'review_reply',
    type: 'REVIEW_REPLY',
    category: 'PRODUCTS',
    title: 'New Reply to Review for {{productName}}',
    message: '{{replyAuthor}} replied to a review for {{productName}}: "{{replyText}}"',
    variables: ['productName', 'replyAuthor', 'replyText'],
    isActive: true
  },
  {
    name: 'low_stock_alert',
    type: 'LOW_STOCK_ALERT',
    category: 'INVENTORY',
    title: 'Low Stock Alert: {{productName}}',
    message: '{{productName}} is running low on stock. Current quantity: {{currentStock}}, Threshold: {{threshold}}',
    variables: ['productName', 'currentStock', 'threshold'],
    isActive: true
  },
  {
    name: 'inventory_update',
    type: 'INVENTORY_UPDATE',
    category: 'INVENTORY',
    title: 'Inventory Updated: {{productName}}',
    message: 'Inventory for {{productName}} has been updated. New quantity: {{newQuantity}}, Previous: {{previousQuantity}}',
    variables: ['productName', 'newQuantity', 'previousQuantity'],
    isActive: true
  },
  {
    name: 'price_change',
    type: 'PRICE_CHANGE',
    category: 'PRODUCTS',
    title: 'Price Change: {{productName}}',
    message: 'Price for {{productName}} has changed from {{oldPrice}} to {{newPrice}} {{currency}}',
    variables: ['productName', 'oldPrice', 'newPrice', 'currency'],
    isActive: true
  },

  // Customer Notifications
  {
    name: 'new_user_registration',
    type: 'NEW_USER_REGISTRATION',
    category: 'CUSTOMERS',
    title: 'New User Registration',
    message: 'New user {{customerName}} ({{customerEmail}}) has registered on the platform.',
    variables: ['customerName', 'customerEmail'],
    isActive: true
  },
  {
    name: 'contact_form_submission',
    type: 'CONTACT_FORM_SUBMISSION',
    category: 'SUPPORT',
    title: 'New Contact Form Submission',
    message: '{{customerName}} ({{customerEmail}}) submitted a contact form with subject: "{{subject}}"',
    variables: ['customerName', 'customerEmail', 'subject'],
    isActive: true
  },
  {
    name: 'support_ticket',
    type: 'SUPPORT_TICKET',
    category: 'SUPPORT',
    title: 'New Support Ticket #{{ticketNumber}}',
    message: 'Support ticket #{{ticketNumber}} created by {{customerName}} with priority {{priority}}: "{{subject}}"',
    variables: ['ticketNumber', 'customerName', 'priority', 'subject'],
    isActive: true
  },
  {
    name: 'customer_feedback',
    type: 'CUSTOMER_FEEDBACK',
    category: 'CUSTOMERS',
    title: 'Customer Feedback Received',
    message: '{{customerName}} provided feedback: "{{feedbackText}}"',
    variables: ['customerName', 'feedbackText'],
    isActive: true
  },

  // System Notifications
  {
    name: 'system_alert',
    type: 'SYSTEM_ALERT',
    category: 'SYSTEM',
    title: 'System Alert: {{alertTitle}}',
    message: '{{alertMessage}}',
    variables: ['alertTitle', 'alertMessage'],
    isActive: true
  },
  {
    name: 'security_alert',
    type: 'SECURITY_ALERT',
    category: 'SECURITY',
    title: 'Security Alert: {{alertTitle}}',
    message: '{{alertMessage}}',
    variables: ['alertTitle', 'alertMessage'],
    isActive: true
  },
  {
    name: 'maintenance_scheduled',
    type: 'MAINTENANCE_SCHEDULED',
    category: 'SYSTEM',
    title: 'Maintenance Scheduled',
    message: 'System maintenance scheduled for {{maintenanceDate}} from {{startTime}} to {{endTime}}. {{description}}',
    variables: ['maintenanceDate', 'startTime', 'endTime', 'description'],
    isActive: true
  },

  // Marketing Notifications
  {
    name: 'discount_expiring',
    type: 'DISCOUNT_EXPIRING',
    category: 'MARKETING',
    title: 'Discount Expiring Soon',
    message: 'Discount "{{discountName}}" ({{discountValue}}) expires on {{expiryDate}}. {{description}}',
    variables: ['discountName', 'discountValue', 'expiryDate', 'description'],
    isActive: true
  },

  // Export/Import Notifications
  {
    name: 'export_completed',
    type: 'EXPORT_COMPLETED',
    category: 'SYSTEM',
    title: 'Export Completed: {{exportType}}',
    message: '{{exportType}} export has been completed successfully. File: {{fileName}}, Records: {{recordCount}}',
    variables: ['exportType', 'fileName', 'recordCount'],
    isActive: true
  },
  {
    name: 'import_completed',
    type: 'IMPORT_COMPLETED',
    category: 'SYSTEM',
    title: 'Import Completed: {{importType}}',
    message: '{{importType}} import has been completed. Records processed: {{recordCount}}, Success: {{successCount}}, Errors: {{errorCount}}',
    variables: ['importType', 'recordCount', 'successCount', 'errorCount'],
    isActive: true
  },
  {
    name: 'backup_completed',
    type: 'BACKUP_COMPLETED',
    category: 'SYSTEM',
    title: 'Backup Completed',
    message: 'System backup has been completed successfully. File: {{fileName}}, Size: {{fileSize}}, Duration: {{duration}}',
    variables: ['fileName', 'fileSize', 'duration'],
    isActive: true
  }
];

async function seedNotificationTemplates() {
  try {
    console.log('🌱 Starting notification templates seeding...');

    // Clear existing templates
    await prisma.notificationTemplate.deleteMany();
    console.log('🗑️ Cleared existing notification templates');

    // Create new templates
    for (const template of notificationTemplates) {
      await prisma.notificationTemplate.create({
        data: template
      });
    }

    console.log(`✅ Successfully seeded ${notificationTemplates.length} notification templates`);

    // Display created templates
    const createdTemplates = await prisma.notificationTemplate.findMany({
      orderBy: { category: 'asc' }
    });

    console.log('\n📋 Created notification templates:');
    createdTemplates.forEach(template => {
      console.log(`  • ${template.name} (${template.category})`);
    });

  } catch (error) {
    console.error('❌ Error seeding notification templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedNotificationTemplates()
  .then(() => {
    console.log('🎉 Notification templates seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Notification templates seeding failed:', error);
    process.exit(1);
  });

export { seedNotificationTemplates };
