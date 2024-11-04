// src/services/userService.ts
import axios from 'axios';

// 유저 데이터를 가져오는 함수
export const fetchUsers = async (searchParams: any) => {
    const response = await axios.get('/api/admin/users', { params: searchParams });
    return response.data;
};
