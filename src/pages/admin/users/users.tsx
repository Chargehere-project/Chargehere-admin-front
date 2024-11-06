import React from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout'; // AdminLayout import
import UserTable from '@/components/admin/UserManagement/UserTable';


const InquiriesPage: React.FC = () => {
    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>회원 관리</h1>
            <UserTable/>
        </AdminLayout>
    );
};

export default InquiriesPage; // React 컴포넌트를 기본 내보내기 (default export)
