import React, { useState } from 'react';
import apiClient from '@/utils/apiClient';
import styles from '@/styles/admin/Table.module.css';

const PaymentSearch: React.FC<{ onSearch: (data: any) => void; onReset: () => void }> = ({ onSearch, onReset }) => {
    // 검색 관련 상태 변수 정의
    const [searchType, setSearchType] = useState('loginID'); // 검색 타입 (회원 로그인 ID)
    const [searchValue, setSearchValue] = useState(''); // 검색 값 입력
    const [startDate, setStartDate] = useState(''); // 시작일 설정
    const [endDate, setEndDate] = useState(''); // 종료일 설정
    const [status, setStatus] = useState(''); // 거래 상태 설정

    // 검색 버튼 클릭 시 실행되는 함수 (서버로 검색 조건 전송)
    const handleSearch = async () => {
        // 검색 조건이 모두 비어있으면 경고 메시지 표시
        if (!searchValue && (!startDate || !endDate) && !status) {
            alert('검색어, 기간, 또는 상태를 입력하세요.');
            return;
        }

        try {
            // 서버에 전달할 검색 조건 설정
            const params = {
                searchType, // 'loginID', 'name' 등
                searchValue, // 검색어
                startDate, // 시작일
                endDate, // 종료일
                status, // 거래 상태
            };

            const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/transactions/search`, {
                params,
                withCredentials: true,
            });
            onSearch(response.data); // 검색 결과를 부모 컴포넌트로 전달
        } catch (error) {
            console.error('검색 실패:', error); // 오류 출력
        }
    };





    // 초기화 버튼 클릭 시 실행되는 함수 (검색 조건 초기화)
    const handleReset = () => {
        setSearchType('loginID'); // 검색 타입 초기화
        setSearchValue(''); // 검색어 초기화
        setStartDate(''); // 시작일 초기화
        setEndDate(''); // 종료일 초기화
        setStatus(''); // 거래 상태 초기화
        onReset(); // 부모 컴포넌트에 초기화 요청
    };

    // 엔터 키 핸들러
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={styles.searchContainer}>
            <table className={styles.searchTable}>
                <tbody>
                    <tr>
                        {/* 조건 검색 - 검색 타입 및 검색어 입력 */}
                        <td className={styles.labelCell}>조건검색</td>
                        <td className={styles.inputCell}>
                            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                                <option value="loginID">회원 로그인 ID</option>
                            </select>
                            <input
                                type="text"
                                placeholder="검색어 입력"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </td>

                        {/* 거래일 - 시작일과 종료일 입력 */}
                        <td className={styles.labelCell}>거래일시</td>
                        <td className={styles.inputCell}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className={styles.dateSeparator}>~</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </td>

                        {/* 거래 상태 선택 */}
                        <td className={styles.labelCell}>거래 상태</td>
                        <td className={styles.inputCell}>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">전체</option>
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Shipping">Shipping</option>
                                <option value="DeliveryCompleted">DeliveryCompleted</option>
                            </select>
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

export default PaymentSearch;
