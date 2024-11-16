import React from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout'; // AdminLayout import
import PaymentTable from '@/components/admin/PaymentManagement/PaymentTable';

const PaymentsPage: React.FC = () => {
    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>결제 관리</h1>
            <PaymentTable/>
        </AdminLayout>
    );
};

export default PaymentsPage; // React 컴포넌트를 기본 내보내기 (default export)
