import React from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout'; // AdminLayout import
import QnATable from '@/components/admin/ProductManagement/QnATable';


const QnAPage: React.FC = () => {
    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>QnA 관리</h1>
            <QnATable/>
        </AdminLayout>
    );
};

export default QnAPage; // React 컴포넌트를 기본 내보내기 (default export)
