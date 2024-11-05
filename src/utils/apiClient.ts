import axios, { AxiosRequestConfig } from 'axios';

// axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/admin', // API 서버의 기본 URL
});

// 요청 인터셉터 설정 - 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('adminToken'); // 로컬 스토리지에서 토큰 가져오기
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`; // 요청 헤더에 토큰 추가
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
