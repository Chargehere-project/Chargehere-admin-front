import React, { useState, useEffect } from 'react';
import UserTable from '@/components/admin/UserManagement/UserTable'; // UserTable 컴포넌트
import AdminLayout from '@/components/admin/layouts/AdminLayout';
import { useAppContext } from '../../../../contexts/AppContext';

const UsersPage: React.FC = () => {
    const { isAuthenticated, apiClient } = useAppContext(); // 인증 상태와 apiClient 가져오기
    const [users, setUsers] = useState([]); // 검색 결과로 받은 유저 데이터를 저장할 상태

    useEffect(() => {
        if (isAuthenticated) {
            // 인증된 경우에만 유저 데이터 가져오기
            const fetchUsers = async () => {
                try {
                    const response = await apiClient.get('/users');
                    setUsers(response.data);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };

            fetchUsers();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <p>Loading...</p>; // 인증 확인 중일 때 로딩 메시지 또는 다른 처리
    }

    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>회원 관리</h1>

            {/* 유저 테이블 컴포넌트 - 검색 결과 전달 */}
            <UserTable users={users} />
        </AdminLayout>
    );
};

export default UsersPage;
