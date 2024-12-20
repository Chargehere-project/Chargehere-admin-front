import React, { useState, useEffect } from 'react';
import styles from '@/styles/admin/Table.module.css';

const CouponSearch: React.FC<{
    onSearch: (data: any) => void;
    onReset: () => void;
    couponOptions: any[]; // couponOptions을 props로 받습니다.
}> = ({ onSearch, onReset, couponOptions = [] }) => {
    const [selectedCoupon, setSelectedCoupon] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchBy, setSearchBy] = useState('LoginID');
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        const criteria = {
            couponId: selectedCoupon ? parseInt(selectedCoupon, 10) : null,
            startDate: startDate || null,
            endDate: endDate || null,
            searchBy: searchBy || null,
            searchQuery: searchQuery || null,
        };
        onSearch(criteria);
    };

    const handleReset = () => {
        setSelectedCoupon('');
        setStartDate('');
        setEndDate('');
        setSearchBy('LoginID');
        setSearchQuery('');
        onReset();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
    }, [couponOptions]);

    return (
        <div className={styles.searchContainer}>
            <table className={styles.searchTable}>
                <tbody>
                    <tr>
                        <td className={styles.labelCell}>검색 기준</td>
                        <td className={styles.inputCell}>
                            <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                                <option value="LoginID">회원 아이디</option>
                                <option value="userName">회원 이름</option>
                            </select>
                            <input
                                type="text"
                                placeholder="검색어 입력"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </td>

                        <td className={styles.labelCell}>기간</td>
                        <td className={styles.inputCell}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className={styles.dateSeparator}>~</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </td>

                        <td className={styles.labelCell}>쿠폰</td>
                        <td className={styles.inputCell}>
                            <select value={selectedCoupon} onChange={(e) => setSelectedCoupon(e.target.value)}>
                                <option value="">전체</option>
                                {couponOptions.map((coupon) => (
                                    <option key={coupon.CouponID} value={coupon.CouponID}>
                                        {coupon.CouponName}
                                    </option>
                                ))}
                            </select>
                        </td>

                        <td colSpan={4} className={styles.buttonGroup}>
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

export default CouponSearch;
