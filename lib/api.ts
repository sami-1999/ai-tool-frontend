import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create Axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add Bearer token (SSR-safe)
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/** -------- Type Definitions -------- */
interface AuthRegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface AuthLoginPayload {
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  title?: string;
  years_experience?: number;
  default_tone?: string;
  writing_style_notes?: string;
  birthday?: string;
  bio?: string;
  country?: string;
  city?: string;
  address?: string;
  portfolio_site_link?: string;
  github_link?: string;
  linkedin_link?: string;
}

interface Skill {
  id: number;
  name: string;
  status: boolean;
}

interface UserSkill {
  id: number;
  skill_id: number;
  proficiency_level: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  // add more fields if needed
}

interface Proposal {
  id: number;
  job_description: string;
  provider: 'claude' | 'openai' | 'gemini';
  // add more fields if needed
}

/** -------- API Modules -------- */
export const authAPI = {
  register: (data: AuthRegisterPayload) => api.post('/register', data),
  login: (data: AuthLoginPayload) => api.post('/login', data),
  logout: () => api.post('/logout'),
  forgotPassword: (data: ForgotPasswordPayload) => api.post('/forgot-password', data),
  resetPassword: (data: ResetPasswordPayload) => api.post('/reset-password', data),
};

export const profileAPI = {
  get: (userId: number) => api.get<UserProfile>(`/user/profile/${userId}`),
  update: (userId: number, data: Partial<UserProfile>) => api.put(`/user/profile/${userId}`, data),
};

export const skillsAPI = {
  list: () => api.get<Skill[]>('/skill'),
  create: (data: Omit<Skill, 'id'>) => api.post('/skill', data),
  get: (id: number) => api.get<Skill>(`/skill/${id}`),
  update: (id: number, data: Omit<Skill, 'id'>) => api.put(`/skill/${id}`, data),
  delete: (id: number) => api.delete(`/skill/${id}`),
};

export const userSkillsAPI = {
  list: () => api.get<UserSkill[]>('/user-skills'),
  addSingle: (data: { skill_id: number; proficiency_level: string } | { skill_name: string; proficiency_level: string }) => api.post('/user-skills', data),
  addMultiple: (data: { skills: Array<{ skill_id?: number; skill_name?: string; proficiency_level: string }> }) => api.post('/user-skills', data),
  delete: (id: number) => api.delete(`/user-skills/${id}`),
};

export const projectsAPI = {
  list: () => api.get<Project[]>('/project'),
  create: (data: Partial<Project>) => api.post('/project', data),
  get: (id: number) => api.get<Project>(`/project/${id}`),
  update: (id: number, data: Partial<Project>) => api.put(`/project/${id}`, data),
  delete: (id: number) => api.delete(`/project/${id}`),
};

export const proposalsAPI = {
  list: () => api.get<Proposal[]>('/proposals'),
  generate: (data: { job_description: string; provider?: 'claude' | 'openai' | 'gemini' }) =>
    api.post('/proposals/generate', data),
  get: (id: number) => api.get<Proposal>(`/proposals/${id}`),
  submitFeedback: (id: number, data: { success: boolean }) =>
    api.post(`/proposals/${id}/feedback`, data),
};
