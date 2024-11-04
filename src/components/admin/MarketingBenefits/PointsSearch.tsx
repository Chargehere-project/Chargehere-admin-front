import React, { useState } from 'react';
import axios from 'axios';
import styles from '@/styles/admin/PointsManagement.module.css';

const PointsSearch: React.FC<{ onSearch: (data: any) => void; onReset: () => void }> = ({ onSearch, onReset }) => {
    const [loginID, setLoginID] = useState(''); // LoginID 검색
    const [chargeType, setChargeType] = useState(''); // 포인트 변경 유형
    const [startDate, setStartDate] = useState(''); // 시작 날짜
    const [endDate, setEndDate] = useState(''); // 종료 날짜

    // 검색 핸들러
    const handleSearch = async () => {
        if (!loginID && !chargeType && !startDate && !endDate) {
            alert('회원 아이디, 포인트 변경 유형 또는 날짜를 입력하세요.');
            return;
        }

        try {
            // 서버에 전달할 검색 조건 설정
            const params = {
                loginID: loginID.trim() !== '' ? loginID : null,
                chargeType: chargeType || null,
                startDate: startDate || null,
                endDate: endDate || null,
            };

            // 서버에 검색 요청
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/points/search`, {
                params,
            });

            onSearch(response.data); // 검색된 결과를 부모 컴포넌트로 전달
        } catch (error) {
            console.error('검색 실패:', error);
        }
    };

    // 초기화 핸들러
    const handleReset = () => {
        setLoginID(''); // LoginID 초기화
        setChargeType(''); // 포인트 변경 유형 초기화
        setStartDate(''); // 시작일 초기화
        setEndDate(''); // 종료일 초기화
        onReset(); // 부모 컴포넌트로 초기화 요청
    };

    return (
        <div className={styles.searchContainer}>
            <table className={styles.searchTable}>
                <tbody>
                    <tr>
                        {/* 회원 아이디 검색 */}
                        <td className={styles.labelCell}>로그인 ID</td>
                        <td className={styles.inputCell}>
                            <input type="text" value={loginID} onChange={(e) => setLoginID(e.target.value)} />
                        </td>

                        {/* 적립 날짜 범위 */}
                        <td className={styles.labelCell}>적립 날짜</td>
                        <td className={styles.inputCell}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className={styles.dateSeparator}>~</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </td>

                        {/* 포인트 변경 유형 */}
                        <td className={styles.labelCell}>변경 유형</td>
                        <td className={styles.inputCell}>
                            <select value={chargeType} onChange={(e) => setChargeType(e.target.value)}>
                                <option value="">전체</option>
                                <option value="Earned">적립</option>
                                <option value="Used">사용</option>
                                <option value="Deducted">차감</option>
                            </select>
                        </td>

                        {/* 검색 및 초기화 버튼 */}
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

export default PointsSearch;
