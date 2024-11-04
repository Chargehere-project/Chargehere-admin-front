import React from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout'; // AdminLayout import
import ProductTable from '@/components/admin/ProductManagement/ProductTable';


const ProductPage: React.FC = () => {
    return (
        <AdminLayout>
            <h1 style={{ marginBottom: '30px' }}>상품 관리</h1>
            <ProductTable/>
        </AdminLayout>
    );
};

export default ProductPage; // React 컴포넌트를 기본 내보내기 (default export)
