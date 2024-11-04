import React, { useState } from 'react';
import styles from '@/styles/admin/ProductManagement.module.css';

interface NoticeSearchProps {
    onSearch: (data: any) => void;
    onReset: () => void;
}

const NoticeSearch: React.FC<NoticeSearchProps> = ({ onSearch, onReset }) => {
    const [searchValue, setSearchValue] = useState(''); // 공지 내용 검색 값
    const [startDate, setStartDate] = useState(''); // 시작일
    const [endDate, setEndDate] = useState(''); // 종료일

    // 검색 핸들러
    const handleSearch = () => {
        const searchParams = {
            query: searchValue.trim() !== '' ? searchValue : null, // 공지 내용 검색어
            startDate: startDate || null, // 시작일
            endDate: endDate || null, // 종료일
        };

        console.log('searchParams:', searchParams); // 부모 컴포넌트로 전달되는 검색 조건 확인
        onSearch(searchParams); // 부모 컴포넌트로 검색 조건 전달
    };

    // 초기화 핸들러
    const handleReset = () => {
        setSearchValue(''); // 공지 내용 초기화
        setStartDate(''); // 시작일 초기화
        setEndDate(''); // 종료일 초기화
        onReset(); // 부모 컴포넌트로 초기화 요청
    };

    return (
        <div className={styles.searchContainer}>
            <table className={styles.searchTable}>
                <tbody>
                    <tr>
                        {/* 공지 내용 검색 */}
                        <td className={styles.labelCell}>공지 내용</td>
                        <td className={styles.inputCell}>
                            <input
                                type="text"
                                placeholder="검색어 입력"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </td>

                        {/* 작성 기간 */}
                        <td className={styles.labelCell}>작성 기간</td>
                        <td className={styles.inputCell}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className={styles.dateSeparator}>~</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </td>

                        {/* 검색 및 초기화 버튼 */}
                        <td className={styles.buttonGroup} colSpan={2}>
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

export default NoticeSearch;
