import React, { useState } from 'react';
import axios from 'axios';
import styles from '@/styles/admin/InquiryManagement.module.css';

const InquirySearch: React.FC<{ onSearch: (data: any) => void; onReset: () => void }> = ({ onSearch, onReset }) => {
    const [searchType, setSearchType] = useState('LoginID'); // 검색 타입 (아이디 or 문의내용)
    const [searchValue, setSearchValue] = useState(''); // 검색 값
    const [startDate, setStartDate] = useState(''); // 시작일
    const [endDate, setEndDate] = useState(''); // 종료일
    const [status, setStatus] = useState(''); // 상태 값
    const [inquiryType, setInquiryType] = useState(''); // 문의 유형

    // 검색 핸들러
    const handleSearch = () => {
        const searchParams = {
            query: searchValue.trim() !== '' ? searchValue : null, // 검색 값
            searchType, // 검색 타입: 회원 ID 또는 문의 내용
            startDate: startDate || null, // 시작일
            endDate: endDate || null, // 종료일
            status: status || null, // 상태
            inquiryType: inquiryType || null, // 문의 유형
        };

        console.log('searchParams:', searchParams); // 부모 컴포넌트로 전달되는 검색 조건 확인
        onSearch(searchParams); // 부모 컴포넌트로 검색 조건 전달
    };

    // 초기화 핸들러
    const handleReset = () => {
        setSearchType('UserId'); // 검색 타입 초기화
        setSearchValue(''); // 검색 값 초기화
        setStartDate(''); // 시작일 초기화
        setEndDate(''); // 종료일 초기화
        setStatus(''); // 상태 초기화
        setInquiryType(''); // 문의 유형 초기화
        onReset(); // 부모 컴포넌트로 초기화 요청
    };

    return (
        <div className={styles.searchContainer}>
            <table className={styles.searchTable}>
                <tbody>
                    <tr>
                        {/* 조건 검색 */}
                        <td className={styles.labelCell}>조건 검색</td>
                        <td className={styles.inputCell}>
                            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                                <option value="LoginID">로그인 ID</option>
                                <option value="Content">문의 내용</option>
                            </select>
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
                    </tr>

                    <tr>
                        {/* 문의 상태 */}
                        <td className={styles.labelCell}>문의 상태</td>
                        <td className={styles.inputCell}>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">전체</option>
                                <option value="Pending">대기중</option>
                                <option value="Answered">답변 완료</option>
                            </select>
                        </td>

                        {/* 문의 유형 */}
                        <td className={styles.labelCell}>문의 유형</td>
                        <td className={styles.inputCell}>
                            <select value={inquiryType} onChange={(e) => setInquiryType(e.target.value)}>
                                <option value="">전체</option>
                                <option value="EV">전기차</option>
                                <option value="Shop">쇼핑몰</option>
                            </select>
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

export default InquirySearch;
