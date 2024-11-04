import React from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout';
import DesignSettings from '@/components/admin/SiteSettings/DesignSettings';

const DesignSettingsPage: React.FC = () => {
    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>디자인 관리</h1>
            <DesignSettings />
        </AdminLayout>
    );
};

export default DesignSettingsPage;
