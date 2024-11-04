import React, { useState } from 'react';
import UserTable from '@/components/admin/UserManagement/UserTable'; // UserTable 컴포넌트
import AdminLayout from '@/components/admin/layouts/AdminLayout';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState([]); // 검색 결과로 받은 유저 데이터를 저장할 상태

    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>회원 관리</h1>

            {/* 유저 테이블 컴포넌트 - 검색 결과 전달 */}
            <UserTable users={users} />
        </AdminLayout>
    );
};

export default UsersPage;
