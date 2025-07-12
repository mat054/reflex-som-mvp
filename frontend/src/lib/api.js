import axios from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas e renovar token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Repetir a requisição original com o novo token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Token de refresh inválido, fazer logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/token/', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/clientes/registrar/', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/clientes/perfil/');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/api/clientes/perfil/', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

// Serviços de equipamentos
export const equipamentoService = {
  listar: async (params = {}) => {
    const response = await api.get('/api/equipamentos/equipamentos/', { params });
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/api/equipamentos/equipamentos/${id}/`);
    return response.data;
  },

  criar: async (equipamentoData) => {
    const response = await api.post('/api/equipamentos/equipamentos/criar/', equipamentoData);
    return response.data;
  },

  atualizar: async (id, equipamentoData) => {
    const response = await api.put(`/api/equipamentos/equipamentos/${id}/editar/`, equipamentoData);
    return response.data;
  },

  remover: async (id) => {
    const response = await api.delete(`/api/equipamentos/equipamentos/${id}/remover/`);
    return response.data;
  },

  listarCategorias: async () => {
    const response = await api.get('/api/equipamentos/categorias/');
    return response.data;
  },

  criarCategoria: async (categoriaData) => {
    const response = await api.post('/api/equipamentos/categorias/', categoriaData);
    return response.data;
  },
};

// Serviços de orçamentos
export const orcamentoService = {
  listar: async () => {
    const response = await api.get('/api/equipamentos/orcamentos/');
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/api/equipamentos/orcamentos/${id}/`);
    return response.data;
  },

  criar: async (orcamentoData = {}) => {
    const response = await api.post('/api/equipamentos/orcamentos/criar/', orcamentoData);
    return response.data;
  },

  adicionarItem: async (orcamentoId, itemData) => {
    const response = await api.post(`/api/equipamentos/orcamentos/${orcamentoId}/adicionar-item/`, itemData);
    return response.data;
  },

  removerItem: async (orcamentoId, itemId) => {
    const response = await api.delete(`/api/equipamentos/orcamentos/${orcamentoId}/remover-item/${itemId}/`);
    return response.data;
  },

  finalizar: async (orcamentoId) => {
    const response = await api.post(`/api/equipamentos/orcamentos/${orcamentoId}/finalizar/`);
    return response.data;
  },

  criarReserva: async (orcamentoId, reservaData) => {
    const response = await api.post(`/api/equipamentos/orcamentos/${orcamentoId}/criar-reserva/`, reservaData);
    return response.data;
  },
};

// Serviços de reservas
export const reservaService = {
  listar: async () => {
    const response = await api.get('/api/equipamentos/reservas/');
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/api/equipamentos/reservas/${id}/`);
    return response.data;
  },

  // Endpoints administrativos
  listarTodas: async (params = {}) => {
    const response = await api.get('/api/equipamentos/admin/reservas/', { params });
    return response.data;
  },

  aprovar: async (id) => {
    const response = await api.post(`/api/equipamentos/admin/reservas/${id}/aprovar/`);
    return response.data;
  },

  rejeitar: async (id) => {
    const response = await api.post(`/api/equipamentos/admin/reservas/${id}/rejeitar/`);
    return response.data;
  },
};

// Serviços de clientes (para uso administrativo)
export const clienteService = {
  listar: async (params = {}) => {
    const response = await api.get('/api/clientes/', { params });
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/api/clientes/${id}/`);
    return response.data;
  },

  atualizar: async (id, clienteData) => {
    const response = await api.put(`/api/clientes/${id}/`, clienteData);
    return response.data;
  },

  remover: async (id) => {
    const response = await api.delete(`/api/clientes/${id}/`);
    return response.data;
  },
};

// Utilitários
export const utils = {
  formatCurrency: (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  },

  formatDate: (date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  },

  formatDateTime: (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  },

  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validateCPF: (cpf) => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  },

  validateCNPJ: (cnpj) => {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cnpj.charAt(12))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(cnpj.charAt(13))) return false;
    
    return true;
  },

  maskCPF: (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },

  maskCNPJ: (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },

  maskPhone: (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  },

  maskCEP: (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  },
};

export default api;

