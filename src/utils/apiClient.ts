import axios, { AxiosRequestConfig } from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // 모든 요청에 withCredentials 설정
});

// 요청 인터셉터 설정 - 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
    (config: AxiosRequestConfig | any) => {
        const token = localStorage.getItem('adminToken'); // 로컬 스토리지에서 토큰 가져오기
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`; // 요청 헤더에 토큰 추가
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
