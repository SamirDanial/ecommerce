

export class CategoryService {
  private static baseUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/categories`;

  static async getCategoriesForExport(token: string, categoryIds: number[], includeProducts: boolean = false) {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryIds,
          includeProducts
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching categories for export:', error);
      throw error;
    }
  }

  static async getCategories(token: string) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Category Import Methods
  static async validateImport(categories: any[], token: string) {
    try {
      const response = await fetch(`${this.baseUrl}/import/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ categories })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate categories');
      }

      return data;
    } catch (error) {
      console.error('Error validating categories:', error);
      throw error;
    }
  }

  static async executeImport(categories: any[], options: any = {}, token: string) {
    try {
      const response = await fetch(`${this.baseUrl}/import/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ categories, options })
      });

      const data = await response.json();
      
      if (!response.ok && response.status !== 207) { // 207 is Multi-Status (partial success)
        throw new Error(data.message || 'Failed to execute import');
      }

      return data;
    } catch (error) {
      console.error('Error executing import:', error);
      throw error;
    }
  }

  static async getImportTemplate(token: string) {
    try {
      const response = await fetch(`${this.baseUrl}/import/template`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get template');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  }
}
