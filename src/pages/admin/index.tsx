import React from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout'; // AdminLayout import

const AdminPage: React.FC = () => {
    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>관리자 페이지</h1>
        
        </AdminLayout>
    );
};

export default AdminPage; // React 컴포넌트를 기본 내보내기 (default export)
