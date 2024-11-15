import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/admin/BannerSettings.module.css';
import apiClient from '@/utils/apiClient';

const BannerSettings: React.FC = () => {
    const [bannerPreviews, setBannerPreviews] = useState<string>('');
    const [selectedFiles, setSelectedFiles] = useState<File | null>(null);
    const [selectedBannerIndex, setSelectedBannerIndex] = useState<number>(0);
    const [selectedCategory, setSelectedCategory] = useState<string>('banner_main');
    const [isUploading, setIsUploading] = useState<boolean>(false); // 업로드 상태 표시

    // S3에서 배너 URL을 가져오는 함수
   const fetchBanners = async () => {
       try {
           const response = await apiClient.get('/api/admin/getBanners', {
               params: { category: selectedCategory, index: selectedBannerIndex },
           });
           setBannerPreviews(response.data.banner || '/default_banner.png'); // 기본 배너 설정
       } catch (error) {
           console.error('Failed to fetch banner:', error);
           setBannerPreviews('/default_banner.png'); // 오류 시 기본 이미지로 설정
       }
   };


    useEffect(() => {
        fetchBanners();
    }, [selectedCategory, selectedBannerIndex]);

    // 카테고리 변경 핸들러
    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
        setBannerPreviews('');
        setSelectedFiles(null);
    };

    // 배너 선택 변경 핸들러
    const handleSelectChange = (event) => {
        setSelectedBannerIndex(Number(event.target.value));
    };

    // 파일 선택 핸들러
    const handleBannerChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFiles(file);
            setBannerPreviews(URL.createObjectURL(file)); // 업로드할 이미지 미리보기
        }
    };

    // 업로드 핸들러
    const handleBannerUpload = async () => {
        if (selectedFiles) {
            setIsUploading(true); // 업로드 시작
            const formData = new FormData();
            formData.append('file', selectedFiles);
            formData.append('category', selectedCategory);
            formData.append('index', String(selectedBannerIndex));

            try {
                // 요청 경로를 '/api/admin/upload/banner'로 설정
                await apiClient.post('/api/admin/upload/banner', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                alert(`배너 ${selectedBannerIndex + 1} 업로드 성공`);
                fetchBanners(); // 최신 이미지로 미리보기 업데이트
            } catch (error) {
                console.error('업로드 실패:', error);
                alert('업로드에 실패했습니다.');
            } finally {
                setIsUploading(false); // 업로드 완료
            }
        }
    };


    return (
        <div className={styles.container}>
            <label htmlFor="category-select">카테고리 선택:</label>
            <select
                id="category-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className={styles.selectBox}>
                <option value="banner_main">전기차</option>
                <option value="banner_shop">쇼핑몰</option>
            </select>

            <label htmlFor="banner-select">배너 선택:</label>
            <select
                id="banner-select"
                value={selectedBannerIndex}
                onChange={handleSelectChange}
                className={styles.selectBox}>
                <option value={0}>배너 1</option>
                <option value={1}>배너 2</option>
                <option value={2}>배너 3</option>
            </select>

            <div className={styles.bannerSection}>
                {bannerPreviews ? (
                    <Image
                        src={bannerPreviews}
                        alt={`배너 ${selectedBannerIndex + 1} 미리보기`}
                        width={600}
                        height={300}
                    />
                ) : (
                    <p>선택한 배너가 없습니다.</p>
                )}
                <input type="file" onChange={handleBannerChange} />
                <div className={styles.buttonGroup}>
                    <button
                        onClick={handleBannerUpload}
                        disabled={!selectedFiles || isUploading}
                        className={styles.uploadButton}>
                        {isUploading ? '업로드 중...' : '업로드'}
                    </button>
                    <button onClick={() => setSelectedFiles(null)} className={styles.deleteButton}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BannerSettings;
