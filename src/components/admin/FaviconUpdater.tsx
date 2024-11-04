import { useEffect, useState } from 'react';
import Head from 'next/head';

const FaviconUpdater: React.FC = () => {
    const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

    useEffect(() => {
        // localStorage에서 파비콘 URL 가져오기
        const savedFaviconUrl = localStorage.getItem('faviconUrl');
        setFaviconUrl(savedFaviconUrl || '/default-favicon.ico'); // 기본 파비콘 경로 설정
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedFaviconUrl = localStorage.getItem('faviconUrl');
            setFaviconUrl(updatedFaviconUrl || '/default-favicon.ico');
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <Head>
            <link rel="icon" href={faviconUrl || '/default-favicon.ico'} type="image/x-icon" />
        </Head>
    );
};

export default FaviconUpdater;
