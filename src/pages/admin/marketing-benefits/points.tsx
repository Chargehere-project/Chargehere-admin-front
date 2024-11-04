import React from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout'; // AdminLayout import
import PointsTable from '@/components/admin/MarketingBenefits/PointsTable';


const PointsPage: React.FC = () => {
    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>포인트 관리</h1>
            <PointsTable/>
        </AdminLayout>
    );
};

export default PointsPage; // React 컴포넌트를 기본 내보내기 (default export)
