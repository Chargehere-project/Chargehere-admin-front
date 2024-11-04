import React from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout'; // AdminLayout import
import InquiryTable from '@/components/admin/UserManagement/InquiryTable';

const InquiriesPage: React.FC = () => {
    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>1:1 관리</h1>
            <InquiryTable />
        </AdminLayout>
    );
};

export default InquiriesPage; // React 컴포넌트를 기본 내보내기 (default export)
