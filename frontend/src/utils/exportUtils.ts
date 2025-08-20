import { Product } from '../types';

// CSV Export Functions
export const exportToCSV = (products: Product[], fields: string[]): void => {
  // Debug: Log the first product to see what data we have
  console.log('Debug - First product data:', products[0]);
  console.log('Debug - Fields to export:', fields);
  
  // Check which fields are missing from the first product
  const missingFields = fields.filter(field => {
    const value = products[0]?.[field as keyof Product];
    return value === undefined || value === null;
  });
  console.log('Debug - Missing fields in first product:', missingFields);
  
  // Filter products to only include selected fields
  const filteredProducts = products.map(product => {
    const filteredProduct: any = {};
    fields.forEach(field => {
      let value: any = '';
      
      // Handle special field mappings
      switch (field) {
        case 'category':
          value = product.category?.name || '';
          break;
        case 'tags':
          value = Array.isArray(product.tags) ? product.tags.join(', ') : '';
          break;
        case 'variants':
          value = product.variants?.length || 0;
          break;
        case 'images':
          value = product.images?.length || 0;
          break;
        case 'createdAt':
        case 'updatedAt':
        case 'saleEndDate':
          value = product[field] ? new Date(product[field]!).toLocaleDateString() : '';
          break;
        case 'isActive':
        case 'isFeatured':
        case 'isOnSale':
        case 'allowBackorder':
          value = product[field] === true ? 'Yes' : product[field] === false ? 'No' : '';
          break;
        case 'price':
        case 'comparePrice':
        case 'costPrice':
        case 'salePrice':
          value = product[field] ? Number(product[field]).toFixed(2) : '';
          break;
        default:
          value = product[field as keyof Product];
          // Handle undefined/null values
          if (value === undefined || value === null) {
            value = '';
          }
          break;
      }
      
      filteredProduct[field] = value;
    });
    
    // Debug: Log what we stored for this product
    console.log(`CSV Export - Product ${product.id} filtered data:`, filteredProduct);
    
    return filteredProduct;
  });

  // Convert to CSV
  const headers = fields.map(field => field.charAt(0).toUpperCase() + field.slice(1));
  const csvContent = [
    headers.join(','),
    ...filteredProducts.map(row => 
      headers.map(header => {
        // Convert header back to original field name to match the data
        const field = header.charAt(0).toLowerCase() + header.slice(1);
        const value = row[field];
        
        // Debug: Log what we're looking for and what we find
        console.log(`CSV Export - Header: "${header}", Field: "${field}", Value:`, value);
        
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Download file
  downloadFile(csvContent, 'products.csv', 'text/csv');
};

// Excel Export Functions
export const exportToExcel = async (products: Product[], fields: string[]): Promise<void> => {
  try {
    // Dynamic import to avoid bundling xlsx in main bundle
    const XLSX = await import('xlsx');
    
    // Filter products to only include selected fields (using same logic as CSV)
    const filteredProducts = products.map(product => {
      const filteredProduct: any = {};
      fields.forEach(field => {
        let value: any = '';
        
        // Handle special field mappings
        switch (field) {
          case 'category':
            value = product.category?.name || '';
            break;
          case 'tags':
            value = Array.isArray(product.tags) ? product.tags.join(', ') : '';
            break;
          case 'variants':
            value = product.variants?.length || 0;
            break;
          case 'images':
            value = product.images?.length || 0;
            break;
          case 'createdAt':
          case 'updatedAt':
          case 'saleEndDate':
            value = product[field] ? new Date(product[field]!).toLocaleDateString() : '';
            break;
          case 'isActive':
          case 'isFeatured':
          case 'isOnSale':
          case 'allowBackorder':
            value = product[field] === true ? 'Yes' : product[field] === false ? 'No' : '';
            break;
          case 'price':
          case 'comparePrice':
          case 'costPrice':
          case 'salePrice':
            value = product[field] ? Number(product[field]).toFixed(2) : '';
            break;
          default:
            value = product[field as keyof Product];
            // Handle undefined/null values
            if (value === undefined || value === null) {
              value = '';
            }
            break;
        }
        
        filteredProduct[field] = value;
      });
      return filteredProduct;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(filteredProducts);

    // Auto-size columns
    const columnWidths = fields.map(field => ({
      wch: Math.max(
        field.length,
        ...filteredProducts.map(row => {
          const value = row[field]?.toString() || '';
          return value.length;
        })
      )
    }));
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    // Generate and download file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(blob, 'products.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel. Please try CSV or JSON format.');
  }
};

// JSON Export Functions
export const exportToJSON = (products: Product[], fields: string[]): void => {
  // Filter products to only include selected fields
  const filteredProducts = products.map(product => {
    const filteredProduct: any = {};
    fields.forEach(field => {
      let value: any = null;
      
      // Handle special field mappings (JSON keeps more structured data)
      switch (field) {
        case 'category':
          value = product.category || null;
          break;
        case 'tags':
          value = product.tags || [];
          break;
        case 'variants':
          value = product.variants || [];
          break;
        case 'images':
          value = product.images || [];
          break;
        case '_count':
          value = product._count || null;
          break;
        case 'createdAt':
        case 'updatedAt':
        case 'saleEndDate':
          value = product[field] || null;
          break;
        case 'price':
        case 'comparePrice':
        case 'costPrice':
        case 'salePrice':
          value = product[field] ? Number(product[field]) : null;
          break;
        default:
          value = product[field as keyof Product];
          break;
      }
      
      filteredProduct[field] = value;
    });
    return filteredProduct;
  });

  // Convert to JSON with pretty formatting
  const jsonContent = JSON.stringify(filteredProducts, null, 2);
  downloadFile(jsonContent, 'products.json', 'application/json');
};

// Generic download function
const downloadFile = (content: string | Blob, filename: string, mimeType: string): void => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Available export fields
export const EXPORT_FIELDS = [
  { key: 'id', label: 'ID', default: false },
  { key: 'name', label: 'Name', default: true },
  { key: 'slug', label: 'Slug', default: true },
  { key: 'description', label: 'Description', default: false },
  { key: 'shortDescription', label: 'Short Description', default: false },
  { key: 'price', label: 'Price', default: true },
  { key: 'comparePrice', label: 'Compare Price', default: false },
  { key: 'costPrice', label: 'Cost Price', default: false },
  { key: 'sku', label: 'SKU', default: true },
  { key: 'barcode', label: 'Barcode', default: false },
  { key: 'category', label: 'Category', default: true },
  { key: 'weight', label: 'Weight', default: false },
  { key: 'dimensions', label: 'Dimensions', default: false },
  { key: 'tags', label: 'Tags', default: false },
  { key: 'metaTitle', label: 'Meta Title', default: false },
  { key: 'metaDescription', label: 'Meta Description', default: false },
  { key: 'isActive', label: 'Active Status', default: true },
  { key: 'isFeatured', label: 'Featured Status', default: false },
  { key: 'isOnSale', label: 'On Sale Status', default: false },
  { key: 'salePrice', label: 'Sale Price', default: false },
  { key: 'saleEndDate', label: 'Sale End Date', default: false },
  { key: 'lowStockThreshold', label: 'Low Stock Threshold', default: false },
  { key: 'allowBackorder', label: 'Allow Backorder', default: false },
  { key: 'variants', label: 'Variants Count', default: false },
  { key: 'images', label: 'Images Count', default: false },
  { key: 'totalStock', label: 'Total Stock', default: true },
  { key: 'overallStockStatus', label: 'Stock Status', default: true },
  { key: 'createdAt', label: 'Created Date', default: false },
  { key: 'updatedAt', label: 'Updated Date', default: false }
];

// Get default selected fields
export const getDefaultFields = (): string[] => {
  return EXPORT_FIELDS.filter(field => field.default).map(field => field.key);
};
