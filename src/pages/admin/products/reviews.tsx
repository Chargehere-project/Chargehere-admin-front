import React from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout'; // AdminLayout import
import ReviewTable from '@/components/admin/ProductManagement/ReviewTable';


const ReviewPage: React.FC = () => {
    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>리뷰 관리</h1>
            <ReviewTable />
        </AdminLayout>
    );
};

export default ReviewPage; // React 컴포넌트를 기본 내보내기 (default export)
