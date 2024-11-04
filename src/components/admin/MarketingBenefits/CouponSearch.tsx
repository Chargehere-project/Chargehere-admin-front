import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '@/styles/admin/Table.module.css';

const CouponSearch: React.FC<{
    onSearch: (data: any) => void;
    onReset: () => void;
    fetchCouponOptions: () => void;
}> = ({ onSearch, onReset, fetchCouponOptions }) => {
    const [selectedCoupon, setSelectedCoupon] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchBy, setSearchBy] = useState('LoginID');
    const [searchQuery, setSearchQuery] = useState('');
    const [couponOptions, setCouponOptions] = useState([]);

    // 쿠폰 옵션 불러오기
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/coupons`);
                console.log('Fetched Coupons on mount:', response.data); // 추가된 로그
                setCouponOptions(response.data.coupons || []);
            } catch (error) {
                console.error('쿠폰 옵션 가져오기 실패:', error);
            }
        };
        fetchCoupons();
    }, []);

    // // 쿠폰 목록 업데이트
    // useEffect(() => {
    //     fetchCouponOptions(); // 부모에서 전달받은 함수로 쿠폰 목록 업데이트
    //     console.log('Updated coupon options:', couponOptions); // 추가된 로그
    // }, [fetchCouponOptions]);

    // 검색 핸들러
    const handleSearch = () => {
        const criteria = {
            couponId: selectedCoupon ? parseInt(selectedCoupon, 10) : null,
            startDate: startDate || null,
            endDate: endDate || null,
            searchBy: searchBy || null,
            searchQuery: searchQuery || null,
        };
        onSearch(criteria);
        console.log('검색 조건:', criteria);
    };

    // 초기화 핸들러
    const handleReset = () => {
        setSelectedCoupon('');
        setStartDate('');
        setEndDate('');
        setSearchBy('LoginID');
        setSearchQuery('');
        onReset();
    };

    return (
        <div className={styles.searchContainer}>
            <table className={styles.searchTable}>
                <tbody>
                    <tr>
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
                        <td className={styles.labelCell}>기간</td>
                        <td className={styles.inputCell}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className={styles.dateSeparator}>~</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </td>
                        <td className={styles.labelCell}>검색 기준</td>
                        <td className={styles.inputCell}>
                            <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                                <option value="LoginID">아이디</option>
                                <option value="userName">이름</option>
                            </select>
                            <input
                                type="text"
                                placeholder="검색어 입력"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
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
