import React from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout'; // AdminLayout import
import NoticeTable from '@/components/admin/Communication/NoticeTable';

const ProductPage: React.FC = () => {
    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>공지 관리</h1>
            <NoticeTable/>
        </AdminLayout>
    );
};

export default ProductPage; // React 컴포넌트를 기본 내보내기 (default export)
