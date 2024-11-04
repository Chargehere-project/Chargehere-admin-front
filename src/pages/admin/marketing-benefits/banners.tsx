import React from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout';
import BannerSettings from '@/components/admin/MarketingBenefits/BannerSettings';


const BannersPage: React.FC = () => {
    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>배너 관리</h1>
            <BannerSettings/>
        </AdminLayout>
    );
};

export default BannersPage;
