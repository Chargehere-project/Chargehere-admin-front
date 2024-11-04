import React, { useState } from 'react';
import styles from '@/styles/admin/ReviewManagement.module.css';

const ReviewSearch: React.FC<{ onSearch: (data: any) => void; onReset: () => void }> = ({ onSearch, onReset }) => {
    const [searchType, setSearchType] = useState('Content');
    const [searchValue, setSearchValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');

    const handleSearch = () => {
        const searchParams = {
            query: searchValue.trim() !== '' ? searchValue : null,
            searchType,
            startDate: startDate || null,
            endDate: endDate || null,
            status: status || null,
        };
        onSearch(searchParams);
    };

    const handleReset = () => {
        setSearchType('Content');
        setSearchValue('');
        setStartDate('');
        setEndDate('');
        setStatus('');
        onReset();
    };

    return (
        <div className={styles.searchContainer}>
            <table className={styles.searchTable}>
                <tbody>
                    <tr>
                        <td className={styles.labelCell}>조건 검색</td>
                        <td className={styles.inputCell}>
                            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                                <option value="ReviewID">리뷰 ID</option>
                                <option value="UserID">회원 아이디</option>
                                <option value="Content">리뷰 내용</option>
                            </select>
                            <input
                                type="text"
                                placeholder="검색어 입력"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </td>
                        <td className={styles.labelCell}>리뷰 날짜</td>
                        <td className={styles.inputCell}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className={styles.dateSeparator}>~</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </td>
                        <td className={styles.labelCell}>리뷰 상태</td>
                        <td className={styles.inputCell}>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">전체</option>
                                <option value="visible">활성</option>
                                <option value="hidden">비활성</option>
                                <option value="deleted">삭제됨</option>
                            </select>
                        </td>
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

export default ReviewSearch;
