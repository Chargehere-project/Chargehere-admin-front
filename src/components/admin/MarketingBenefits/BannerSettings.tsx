import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import styles from '@/styles/admin/BannerSettings.module.css';

const BannerSettings: React.FC = () => {
    const defaultBanners = ['/colla.png', '/game.png', '/style.png']; // 기본 배너 이미지 경로 설정
    const [bannerPreviews, setBannerPreviews] = useState<string[]>(defaultBanners);
    const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>([null, null, null]);
    const [selectedBannerIndex, setSelectedBannerIndex] = useState<number>(0); // 선택된 배너 인덱스 상태

    // S3에서 배너 URL을 가져오는 함수
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await axios.get('/api/admin/getBanners'); // S3에서 배너 URL을 가져오는 API 호출
                const storedBanners = response.data.banners || defaultBanners;
                setBannerPreviews(storedBanners);
                localStorage.setItem('banners', JSON.stringify(storedBanners)); // 로컬 스토리지 업데이트
            } catch (error) {
                console.error('배너 가져오기 실패:', error);
                setBannerPreviews(defaultBanners); // 기본 배너로 설정
            }
        };

        fetchBanners();
    }, []);

    // 셀렉트 박스에서 배너 선택 시
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBannerIndex(Number(event.target.value));
    };

    // 배너 파일 변경 핸들러
    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const localPreviewUrl = URL.createObjectURL(file);
            const newPreviews = [...bannerPreviews];
            const newFiles = [...selectedFiles];
            newPreviews[selectedBannerIndex] = localPreviewUrl;
            newFiles[selectedBannerIndex] = file;

            setBannerPreviews(newPreviews);
            setSelectedFiles(newFiles);
        }
    };

    // 배너 업로드 버튼 클릭 시
    const handleBannerUpload = async () => {
        const file = selectedFiles[selectedBannerIndex];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post('/api/admin/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                const newPreviews = [...bannerPreviews];
                newPreviews[selectedBannerIndex] = response.data.fileUrl; // S3에서 받은 URL로 업데이트
                setBannerPreviews(newPreviews);

                // S3에서 업데이트된 배너 URL 저장
                const storedBanners = JSON.parse(localStorage.getItem('banners') || '[]');
                storedBanners[selectedBannerIndex] = response.data.fileUrl;
                localStorage.setItem('banners', JSON.stringify(storedBanners));
                alert(`배너 ${selectedBannerIndex + 1}이 성공적으로 변경되었습니다.`);
            } catch (error) {
                console.error(`배너 ${selectedBannerIndex + 1} 업로드 실패:`, error);
                alert(`배너 ${selectedBannerIndex + 1} 업로드에 실패했습니다.`);
            }
        }
    };

    // 배너 삭제 핸들러
    const handleDeleteBanner = async () => {
        const newPreviews = [...bannerPreviews];
        const newFiles = [...selectedFiles];
        newPreviews[selectedBannerIndex] = defaultBanners[selectedBannerIndex]; // 기본 배너 이미지로 설정
        newFiles[selectedBannerIndex] = null;

        setBannerPreviews(newPreviews);
        setSelectedFiles(newFiles);

        // 로컬 스토리지에 업데이트
        localStorage.setItem('banners', JSON.stringify(newPreviews));
        alert(`배너 ${selectedBannerIndex + 1}이 기본 이미지로 돌아갔습니다.`);

        // S3에서 해당 배너를 삭제하는 API 호출 필요 (선택 사항)
        try {
            await axios.delete(`/api/admin/deleteBanner`, { data: { index: selectedBannerIndex } });
        } catch (error) {
            console.error('배너 삭제 실패:', error);
        }
    };

    return (
        <div className={styles.container}>
            <label htmlFor="banner-select">배너 선택:</label>
            <select
                style={{ marginBottom: '20px' }}
                id="banner-select"
                value={selectedBannerIndex}
                onChange={handleSelectChange}
                className={styles.selectBox}>
                <option value={0}>배너 1</option>
                <option value={1}>배너 2</option>
                <option value={2}>배너 3</option>
            </select>

            <div className={styles.bannerSection}>
                {bannerPreviews[selectedBannerIndex] && (
                    <div className={styles.preview}>
                        <Image
                            src={bannerPreviews[selectedBannerIndex]}
                            alt={`배너 ${selectedBannerIndex + 1} 미리보기`}
                            width={600}
                            height={300}
                        />
                    </div>
                )}
                <input type="file" onChange={handleBannerChange} />
                <div className={styles.buttonGroup}>
                    <button
                        onClick={handleBannerUpload}
                        disabled={!selectedFiles[selectedBannerIndex]}
                        className={styles.uploadButton}>
                        업로드
                    </button>
                    <button onClick={handleDeleteBanner} className={styles.deleteButton}>
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BannerSettings;
