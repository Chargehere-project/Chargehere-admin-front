import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../../contexts/AppContext';
import AdminLayout from '@/components/admin/layouts/AdminLayout';

const AdminPage: React.FC = () => {
    const { isAuthenticated } = useAppContext();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login'); // 인증되지 않은 경우 로그인 페이지로 리디렉션
        }
    }, [isAuthenticated, router]);

    return (
        <AdminLayout>
            <h1>관리자 페이지</h1>
            {isAuthenticated && <p>인증된 사용자입니다.</p>}
        </AdminLayout>
    );
};

export default AdminPage;
