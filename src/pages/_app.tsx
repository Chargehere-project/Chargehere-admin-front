import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();

    useEffect(() => {
        // 현재 경로가 /admin으로 시작하고, /admin/login이 아닌지 확인
        const isAdminPage = router.pathname.startsWith('/admin') && router.pathname !== '/admin/login';

        if (isAdminPage) {
            const token = localStorage.getItem('adminToken');

            if (!token) {
                // 토큰이 없으면 로그인 페이지로 리디렉션
                router.push('/admin/login');
                return;
            }

            const checkAuth = async () => {
                try {
                    // 토큰 유효성 확인 요청
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } catch (error) {
                    // 토큰이 유효하지 않으면 로그아웃 처리 후 로그인 페이지로 이동
                    localStorage.removeItem('adminToken');
                    router.push('/admin/login');
                }
            };

            checkAuth();
        }
    }, [router]);

    return <Component {...pageProps} />;
}
