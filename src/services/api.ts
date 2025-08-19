const API_BASE_URL = 'https://prop.digiheadway.in/api/mylinks.php';

export interface ApiLink {
  id: string;
  link: string;
  title: string;
  description: string;
  folder: string;
  tags: string;
  img: string;
  isfav: string;
  created_time: string;
  click_count?: string;
}

export interface ApiResponse {
  status: 'success' | 'error';
  message: string;
  id?: number;
  new_count?: number;
}

class ApiService {
  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      // Check if we're offline
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }
      
      throw error;
    }
  }

  async getLinks(): Promise<ApiLink[]> {
    const url = `${API_BASE_URL}?action=get`;
    return this.makeRequest(url);
  }

  async addLink(linkData: {
    link: string;
    title: string;
    description: string;
    folder: string;
    tags: string;
    img: string;
    isfav: boolean;
  }): Promise<ApiResponse> {
    if (!navigator.onLine) {
      throw new Error('No internet connection');
    }

    const url = `${API_BASE_URL}?action=post`;
    const formData = new URLSearchParams();
    formData.append('link', linkData.link);
    formData.append('title', linkData.title);
    formData.append('description', linkData.description);
    formData.append('folder', linkData.folder);
    formData.append('tags', linkData.tags);
    formData.append('img', linkData.img);
    formData.append('isfav', linkData.isfav ? '1' : '0');

    return this.makeRequest(url, {
      method: 'POST',
      body: formData,
    });
  }

  async updateLink(id: string, linkData: {
    link: string;
    title: string;
    description: string;
    folder: string;
    tags: string;
    img: string;
    isfav: boolean;
    click_count?: string;
  }): Promise<ApiResponse> {
    if (!navigator.onLine) {
      throw new Error('No internet connection');
    }

    const url = `${API_BASE_URL}?action=post`;
    const formData = new URLSearchParams();
    formData.append('id', id);
    formData.append('link', linkData.link);
    formData.append('title', linkData.title);
    formData.append('description', linkData.description);
    formData.append('folder', linkData.folder);
    formData.append('tags', linkData.tags);
    formData.append('img', linkData.img);
    formData.append('isfav', linkData.isfav ? '1' : '0');
    
    // Add click count if provided (for click increment updates)
    if (linkData.click_count !== undefined) {
      console.log('Adding click parameter to form data:', linkData.click_count);
      formData.append('clicks', linkData.click_count);
    }
    
    console.log('Form data being sent:', Array.from(formData.entries()));

    return this.makeRequest(url, {
      method: 'POST',
      body: formData,
    });
  }

  async deleteLink(id: string): Promise<ApiResponse> {
    if (!navigator.onLine) {
      throw new Error('No internet connection');
    }

    const url = `${API_BASE_URL}?action=delete&id=${id}`;
    return this.makeRequest(url);
  }

  async incrementClickCount(id: string): Promise<ApiResponse> {
    if (!navigator.onLine) {
      throw new Error('No internet connection');
    }

    const url = `${API_BASE_URL}?action=increment_click&id=${id}`;
    console.log('Making click increment request to:', url);
    return this.makeRequest(url, {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();