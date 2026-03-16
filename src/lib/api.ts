const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...this.getHeaders(), ...(options.headers || {}) },
    });

    if (res.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `Error ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: { id: number; email: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) as { id: number; email: string; role: string } : null;
  }

  // Admin
  getCatalog() { return this.request<any[]>('/admin/catalog'); }
  createCatalogProduct(data: { sku: string; name: string; suggested_price: number; brand_id: number; image_url: string }) {
    return this.request<any>('/admin/catalog', { method: 'POST', body: JSON.stringify(data) });
  }
  updateCatalogProduct(id: number, data: Partial<{ sku: string; name: string; suggested_price: number; brand_id: number; image_url: string }>) {
    return this.request<any>(`/admin/catalog/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Vendor
  getExplore() { return this.request<any[]>('/vendor/explore'); }
  getInventory() { return this.request<any[]>('/vendor/inventory'); }
  addToInventory(data: { catalog_id: number; stock: number; precio_personalizado: number }) {
    return this.request<any>('/vendor/inventory', { method: 'POST', body: JSON.stringify(data) });
  }
  updateInventory(id: number, data: Partial<{ stock: number; precio_personalizado: number }>) {
    return this.request<any>(`/vendor/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Sales
  registerSale(data: { inventario_id: number; cantidad: number }) {
    return this.request<any>('/sales/register', { method: 'POST', body: JSON.stringify(data) });
  }
}

export const api = new ApiClient();
