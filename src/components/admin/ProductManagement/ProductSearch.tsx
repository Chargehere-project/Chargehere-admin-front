import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import styles from '@/styles/admin/ProductManagement.module.css';

const ProductSearch: React.FC<{ onSearch: (data: any, params: any) => void; onReset: () => void }> = ({
    onSearch,
    onReset,
}) => {
    const [searchType, setSearchType] = useState('name'); // 검색 기준: 상품 아이디 또는 상품 이름
    const [searchValue, setSearchValue] = useState(''); // 검색 입력값
    const [status, setStatus] = useState(''); // 상태 필터
    const [startDate, setStartDate] = useState(''); // 시작 날짜
    const [endDate, setEndDate] = useState(''); // 종료 날짜

    // 검색 핸들러
    // 페이지당 보여줄 아이템 개수 상수
    const ITEMS_PER_PAGE = 10;

    const handleSearch = async () => {
        const params = {
            [searchType]: searchValue.trim() !== '' ? searchValue : null,
            status: status || null,
            startDate: startDate ? moment(startDate).format('YYYY-MM-DD') : null,
            endDate: endDate ? moment(endDate).format('YYYY-MM-DD') : null,
            page: 1,
            limit: ITEMS_PER_PAGE,
        };

        console.log('검색 요청 파라미터:', params); // 상품 ID 및 기간 필터 확인용 로그

        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/search`, {
                params,
            });
            onSearch(response.data, params);
        } catch (error) {
            console.error('검색 실패:', error);
        }
    };






    // 초기화 핸들러
    const handleReset = () => {
        setSearchType('productId'); // 검색 기준 초기화
        setSearchValue(''); // 검색값 초기화
        setStatus(''); // 상태 초기화
        setStartDate(''); // 시작일 초기화
        setEndDate(''); // 종료일 초기화
        onReset(); // 부모 컴포넌트의 초기화 함수 호출
    };

    return (
        <div className={styles.searchContainer}>
            <table className={styles.searchTable}>
                <tbody>
                    <tr>
                        {/* 검색 기준 선택 셀렉트박스 */}
                        <td className={styles.labelCell}>검색 기준</td>
                        <td className={styles.inputCell}>
                            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                                <option value="name">상품 이름</option>
                                <option value="productId">상품 ID</option>
                            </select>
                        </td>

                        {/* 검색 입력 필드 */}
                        <td className={styles.inputCell}>
                            <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                        </td>

                        {/* 상태 선택 셀렉트박스 */}
                        <td className={styles.labelCell}>상태</td>
                        <td className={styles.inputCell}>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">전체</option>
                                <option value="active">활성</option>
                                <option value="inactive">비활성</option>
                                <option value="deleted">삭제됨</option>
                            </select>
                        </td>

                        {/* 등록 기간 필터 */}
                        <td className={styles.labelCell}>등록 날짜</td>
                        <td className={styles.inputCell}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className={styles.dateSeparator}>~</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </td>

                        {/* 검색 및 초기화 버튼 */}
                        <td className={styles.buttonGroup}>
                            <button onClick={handleSearch} className={styles.button}>
                                검색
                            </button>
                            <button onClick={handleReset} className={`${styles.button} ${styles.cancelButton}`}>
                                초기화
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ProductSearch;
