import React, { useState } from 'react';
import axios from 'axios';
import styles from '@/styles/admin/DesignSettings.module.css';


const DesignSettings: React.FC = () => {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
    const [selectedFaviconFile, setSelectedFaviconFile] = useState<File | null>(null);

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const localPreviewUrl = URL.createObjectURL(file);
            setLogoPreview(localPreviewUrl);
            setSelectedLogoFile(file);
        }
    };

    // const handleLogoUpload = async () => {
    //     if (selectedLogoFile) {
    //         const formData = new FormData();
    //         formData.append('file', selectedLogoFile);
    //         try {
    //             const response = await axios.post('/api/admin/upload', formData, {
    //                 headers: { 'Content-Type': 'multipart/form-data' },
    //             });
    //             const logoUrl = response.data.fileUrl;
    //             setLogoPreview(logoUrl);
    //             localStorage.setItem('logoUrl', logoUrl);
    //             alert('로고가 성공적으로 변경되었습니다.');
    //         } catch (error) {
    //             console.error('로고 업로드 실패:', error);
    //             alert('로고 업로드에 실패했습니다.');
    //         }
    //     }
    // };

    const handleLogoUpload = async () => {
        if (selectedLogoFile) {
            const formData = new FormData();
            formData.append('file', selectedLogoFile);
            try {
                const response = await axios.post('/api/admin/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const logoUrl = response.data.fileUrl;
                setLogoPreview(logoUrl);
                localStorage.setItem('logoUrl', logoUrl); // S3 URL 저장
                alert('로고가 성공적으로 변경되었습니다.');
            } catch (error) {
                console.error('로고 업로드 실패:', error);
                alert('로고 업로드에 실패했습니다.');
            }
        }
    };

    const handleDeleteLogo = () => {
        setLogoPreview(null);
        setSelectedLogoFile(null);
        localStorage.removeItem('logoUrl');
        alert('로고가 삭제되었습니다.');
    };

    const handleFaviconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const localPreviewUrl = URL.createObjectURL(file);
            setFaviconPreview(localPreviewUrl);
            setSelectedFaviconFile(file);
        }
    };

    const handleFaviconUpload = async () => {
        if (selectedFaviconFile) {
            const formData = new FormData();
            formData.append('file', selectedFaviconFile);
            try {
                const response = await axios.post('/api/admin/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const faviconUrl = response.data.fileUrl;
                setFaviconPreview(faviconUrl);
                localStorage.setItem('faviconUrl', faviconUrl); // S3 URL 저장
                alert('파비콘이 성공적으로 변경되었습니다.');
            } catch (error) {
                console.error('파비콘 업로드 실패:', error);
                alert('파비콘 업로드에 실패했습니다.');
            }
        }
    };

    const handleDeleteFavicon = () => {
        setFaviconPreview(null);
        setSelectedFaviconFile(null);
        localStorage.removeItem('faviconUrl');
        alert('파비콘이 삭제되었습니다.');
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
                    <button onClick={handleLogoUpload} disabled={!selectedLogoFile} className={styles.button}>
                        로고 업로드
                    </button>
                    <button onClick={handleDeleteLogo} disabled={!logoPreview} className={styles.deleteButton}>
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
                    <button onClick={handleFaviconUpload} disabled={!selectedFaviconFile} className={styles.button}>
                        파비콘 업로드
                    </button>
                    <button onClick={handleDeleteFavicon} disabled={!faviconPreview} className={styles.deleteButton}>
                        파비콘 삭제
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DesignSettings;
