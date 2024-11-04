import React, { useState } from 'react';
import axios from 'axios';
import styles from '@/styles/admin/Table.module.css';

const UserSearch: React.FC<{ onSearch: (data: any) => void; onReset: () => void }> = ({ onSearch, onReset }) => {
    // 검색 관련 상태 변수 정의
    const [searchType, setSearchType] = useState('name'); // 검색 타입 (이름 또는 아이디)
    const [searchValue, setSearchValue] = useState(''); // 검색 값 입력
    const [startDate, setStartDate] = useState(''); // 시작일 설정
    const [endDate, setEndDate] = useState(''); // 종료일 설정
    const [status, setStatus] = useState(''); // 유저 상태 설정

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
                searchType,
                searchValue: searchValue.trim() !== '' ? searchValue : null, // 검색어가 있으면 전달, 없으면 null
                startDate: startDate || null, // 시작일이 없으면 null
                endDate: endDate || null, // 종료일이 없으면 null
                status: status || null, // 상태가 없으면 null
            };

            // 서버에 검색 요청
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/search`, { params });
            onSearch(response.data); // 검색 결과를 부모 컴포넌트로 전달
        } catch (error) {
            console.error('검색 실패:', error); // 검색 실패 시 에러 메시지 출력
        }
    };

    // 초기화 버튼 클릭 시 실행되는 함수 (검색 조건 초기화)
    const handleReset = () => {
        setSearchType('name'); // 검색 타입 초기화
        setSearchValue(''); // 검색어 초기화
        setStartDate(''); // 시작일 초기화
        setEndDate(''); // 종료일 초기화
        setStatus(''); // 유저 상태 초기화
        onReset(); // 부모 컴포넌트에 초기화 요청
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
                                <option value="name">회원 이름</option>
                                <option value="id">회원 아이디</option>
                            </select>
                            <input
                                type="text"
                                placeholder="검색어 입력"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </td>

                        {/* 가입일 - 시작일과 종료일 입력 */}
                        <td className={styles.labelCell}>가입일</td>
                        <td className={styles.inputCell}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className={styles.dateSeparator}>~</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </td>

                        {/* 유저 상태 선택 */}
                        <td className={styles.labelCell}>유저 상태</td>
                        <td className={styles.inputCell}>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">전체</option>
                                <option value="Active">활성</option>
                                <option value="Inactive">비활성</option>
                                <option value="Withdrawn">탈퇴</option>
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

export default UserSearch;
