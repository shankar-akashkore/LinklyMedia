import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (userData) => api.post('/register', userData),
    login: (credentials) => api.post('/login', credentials),
    refreshToken: (refreshToken) => api.post('/refresh', { refreshToken }),
};

export const billboardAPI = {
    getAllBillboards: () => api.get('/billboards'),
    getTopBillboards: () => api.get('/TopBillboards'),
    addReview: (billboardId, reviewData) => api.post(`/review/${billboardId}`, reviewData),
};

export const userAPI = {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.put('/user/profile', data),
    logout: () => api.post('/user/logout'),
};

export const cartAPI = {
    addToCart: (billboardData) => api.post('/user/cart/add', billboardData),
    removeFromCart: (billboardId) => api.delete(`/user/cart/remove/${billboardId}`),
    getCartItems: () => api.get('/user/cart'),
    calculateOrderPrice: (orderData) => api.post('/user/booking/calculate', orderData),
};

export const partnerAPI = {
    addBillboard: (billboardData) => api.post('/partner/billboard', billboardData),
    updateBillboard: (id, billboardData) => api.put(`/partner/billboard/${id}`, billboardData),
    deleteBillboard: (id) => api.delete(`/partner/billboard/${id}`),
    getAllListings: () => api.get('/partner/listings'),
};

export const reviewAPI = {
    getReviews: (billboardId) => api.get(`/review/${billboardId}`),
};

export default api;