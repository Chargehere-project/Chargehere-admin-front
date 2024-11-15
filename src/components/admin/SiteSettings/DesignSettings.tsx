import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '@/styles/admin/DesignSettings.module.css';
import apiClient from '@/utils/apiClient';

const DesignSettings: React.FC = () => {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
    const [selectedFaviconFile, setSelectedFaviconFile] = useState<File | null>(null);

    // Fetch latest logo and favicon from S3
    useEffect(() => {
        const fetchInitialFiles = async () => {
            try {
                const logoResponse = await apiClient.get('/api/admin/files/logo');
                const faviconResponse = await apiClient.get('/api/admin/files/favicon');
                setLogoPreview(logoResponse.data.fileUrl || null);
                setFaviconPreview(faviconResponse.data.fileUrl || null);
            } catch (error) {
                console.error('Failed to fetch initial files:', error);
            }
        };

        fetchInitialFiles();
    }, []);

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const localPreviewUrl = URL.createObjectURL(file);
            setLogoPreview(localPreviewUrl);
            setSelectedLogoFile(file);
        }
    };

    const handleFaviconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const localPreviewUrl = URL.createObjectURL(file);
            setFaviconPreview(localPreviewUrl);
            setSelectedFaviconFile(file);
        }
    };

    const handleFileUpload = async (file: File | null, category: string) => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);

            try {
                const response = await apiClient.post(`/api/admin/upload/${category}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const fileUrl = response.data.fileUrl;

                if (category === 'logo') {
                    setLogoPreview(fileUrl);
                } else if (category === 'favicon') {
                    setFaviconPreview(fileUrl);
                }

                alert(`${category === 'logo' ? '로고' : '파비콘'}가 성공적으로 업로드되었습니다.`);
            } catch (error) {
                console.error(`${category === 'logo' ? '로고' : '파비콘'} 업로드 실패:`, error);
                alert(`${category === 'logo' ? '로고' : '파비콘'} 업로드에 실패했습니다.`);
            }
        }
    };

    const handleDeleteFile = async (category: string) => {
        try {
            await apiClient.delete(`/api/admin/files/${category}`); // 경로에 category를 직접 포함

            if (category === 'logo') {
                setLogoPreview(null);
                setSelectedLogoFile(null);
            } else if (category === 'favicon') {
                setFaviconPreview(null);
                setSelectedFaviconFile(null);
            }

            alert(`${category === 'logo' ? '로고' : '파비콘'}가 삭제되었습니다.`);
        } catch (error) {
            console.error(`${category === 'logo' ? '로고' : '파비콘'} 삭제 실패:`, error);
        }
    };

    return (
        <div className={styles.container}>
            {/* 로고 설정 */}
            <div className={styles.uploadSection}>
                <h3 className={styles.sectionTitle}>로고 설정</h3>
                {logoPreview && (
                    <div className={styles.preview}>
                        <img src={logoPreview} alt="로고 미리보기" width={100} height={100} />
                    </div>
                )}
                <input type="file" onChange={handleLogoChange} />
                <div className={styles.buttonGroup}>
                    <button
                        onClick={() => handleFileUpload(selectedLogoFile, 'logo')}
                        disabled={!selectedLogoFile}
                        className={styles.button}>
                        로고 업로드
                    </button>
                    <button
                        onClick={() => handleDeleteFile('logo')}
                        disabled={!logoPreview}
                        className={styles.deleteButton}>
                        로고 삭제
                    </button>
                </div>
            </div>

            {/* 파비콘 설정 */}
            <div className={styles.uploadSection}>
                <h3 className={styles.sectionTitle}>파비콘 설정</h3>
                {faviconPreview && (
                    <div className={styles.preview}>
                        <img src={faviconPreview} alt="파비콘 미리보기" width={50} height={50} />
                    </div>
                )}
                <input type="file" onChange={handleFaviconChange} />
                <div className={styles.buttonGroup}>
                    <button
                        onClick={() => handleFileUpload(selectedFaviconFile, 'favicon')}
                        disabled={!selectedFaviconFile}
                        className={styles.button}>
                        파비콘 업로드
                    </button>
                    <button
                        onClick={() => handleDeleteFile('favicon')}
                        disabled={!faviconPreview}
                        className={styles.deleteButton}>
                        파비콘 삭제
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DesignSettings;
