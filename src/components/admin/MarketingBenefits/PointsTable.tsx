import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import styles from '@/styles/admin/Table.module.css';
import PointsSearch from './PointsSearch';
 import { MdEdit, MdDelete, MdClose } from 'react-icons/md';
 import apiClient from '@/utils/apiClient';

const ITEMS_PER_PAGE = 10; // 한 페이지에 보여줄 항목 수
    const VISIBLE_PAGE_RANGE = 2; // 보이는 페이지 범위

const PointsTable: React.FC = () => {
    const [pointsHistory, setPointsHistory] = useState([]); // 포인트 내역 저장
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
    const [selectedLoginId, setSelectedLoginId] = useState(''); // 선택된 회원의 LoginID
    const [pointsAmount, setPointsAmount] = useState(0); // 포인트 증감 금액
    const [pointsReason, setPointsReason] = useState(''); // 포인트 증감 이유
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [selectedUsers, setSelectedUsers] = useState([]); // 선택된 유저 목록
    const [userSearchQuery, setUserSearchQuery] = useState(''); // 유저 검색어
    const [filteredUsers, setFilteredUsers] = useState([]); // 필터링된 유저 목록
    const [selectAll, setSelectAll] = useState(false); // 전체 선택 상태
    const [users, setUsers] = useState([]); // 유저 목록
    const [searchBy, setSearchBy] = useState('id'); // 기본 검색 기준을 ID로 설정
    const [totalPointsCount, setTotalPointsCount] = useState(0); // 총 포인트 개수 저장
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTotalPages, setSearchTotalPages] = useState(1);
    const [searchCurrentPage, setSearchCurrentPage] = useState(1);
    const [searchParams, setSearchParams] = useState(null); // 검색 조건 저장

    // 포인트 내역 가져오기 함수
    // 포인트 내역 가져오기 함수
    const fetchPointsHistory = async (page: number = 1, params = {}) => {
        setIsLoading(true);
        try {
            let response;
            const queryParams = { ...params, page, limit: ITEMS_PER_PAGE };

            if (params && Object.keys(params).length > 0) {
                // 검색 조건이 있을 경우 searchPoints API 호출
                response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/points/search`, {
                    params: queryParams,
                    withCredentials: true,
                });
            } else {
                // 기본 포인트 내역 API 호출
                response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/points`, {
                    params: { page, limit: ITEMS_PER_PAGE },
                    withCredentials: true,
                });
            }

            setPointsHistory(response.data.points); // 데이터 업데이트
            setTotalPages(response.data.totalPages); // 총 페이지 수 업데이트
            setCurrentPage(page); // 현재 페이지 업데이트
            setIsLoading(false);
        } catch (error) {
            console.error('포인트 내역 가져오기 실패:', error);
            setIsLoading(false);
        }
    };

    // 컴포넌트 마운트 시 1페이지 데이터 로드
    useEffect(() => {
        fetchPointsHistory(1); // 초기 로드 시 1페이지 데이터를 불러옴
    }, []);

    // 총 포인트 개수를 가져오는 함수
    const fetchTotalPointsCount = async () => {
        try {
            const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/points/count`, {
                withCredentials: true, // 쿠키 포함 설정
            });
            setTotalPointsCount(response.data.count); // 총 개수 업데이트
        } catch (error) {
            console.error('총 포인트 개수를 가져오는 데 실패했습니다:', error);
        }
    };

    // 컴포넌트 마운트 시 총 개수 가져오기
    useEffect(() => {
        fetchTotalPointsCount(); // 초기 로드 시 총 개수를 불러옴
    }, []);

    // 검색 핸들러
    const handleSearch = (searchData) => {
        setSearchParams(searchData); // 검색 조건 저장
        fetchPointsHistory(1, searchData); // 검색 시 첫 페이지로 설정
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        fetchPointsHistory(page, searchParams); // 페이지 변경 시 검색 조건 유지
    };

    // 초기화 핸들러
    const handleReset = async () => {
        setSearchParams(null); // 검색 조건 초기화
        setSelectAll(false); // 전체 선택 체크박스 해제
        setSelectedUsers([]); // 선택된 유저 목록 초기화
        await fetchPointsHistory(1); // 전체 목록을 첫 페이지부터 로드
    };

    useEffect(() => {
        fetchPointsHistory(1); // 초기 데이터 로드
    }, []);

    // 한 페이지에 해당하는 포인트 내역 가져오기
    const getCurrentPagePoints = () => {
        return pointsHistory;
    };

    // // 페이지 변경 핸들러
    // const handlePageChange = (page: number) => {
    //     if (page < 1 || page > totalPages) return;
    //     fetchPointsHistory(page); // 페이지 변경 시 해당 페이지 데이터 로드
    // };

    // 페이지 그룹을 계산하여 버튼 목록을 반환하는 함수
    const getPageGroup = () => {
        const pages = [];
        const totalVisiblePages = 5; // 최대 페이지 버튼 수

        // 전체 페이지가 5페이지 이하일 경우 모든 페이지 버튼 표시
        if (totalPages <= totalVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let startPage = Math.max(currentPage - VISIBLE_PAGE_RANGE, 1); // 현재 페이지에서 앞쪽 범위
            let endPage = Math.min(currentPage + VISIBLE_PAGE_RANGE, totalPages); // 현재 페이지에서 뒤쪽 범위

            // 페이지 버튼이 5개가 되도록 조정
            if (endPage - startPage < totalVisiblePages - 1) {
                if (startPage === 1) {
                    // 시작 페이지가 1이면 끝 페이지를 조정
                    endPage = Math.min(startPage + totalVisiblePages - 1, totalPages);
                } else {
                    // 끝 페이지가 totalPages보다 작을 경우 시작 페이지를 조정
                    startPage = Math.max(endPage - totalVisiblePages + 1, 1);
                }
            }

            // 페이지 버튼 추가
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    // 페이지네이션 버튼을 렌더링하는 함수
    const renderPaginationButtons = () => {
        const total = isSearching ? searchTotalPages : totalPages; // 검색 모드와 전체 데이터 모드에 따른 총 페이지 수
        const pages = [];

        // 총 페이지 수가 5 이하인 경우, 모든 페이지를 보여줌
        if (total <= 5) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            // 현재 페이지가 3 이하인 경우, 처음 5개의 페이지를 보여줌
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
            }
            // 현재 페이지가 마지막 3개의 페이지에 가까운 경우, 마지막 5개의 페이지를 보여줌
            else if (currentPage >= total - 2) {
                for (let i = total - 4; i <= total; i++) {
                    pages.push(i);
                }
            }
            // 그 외의 경우, 현재 페이지를 중심으로 앞뒤로 2개의 페이지를 보여줌
            else {
                pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
            }
        }

        return pages.map((page) => (
            <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={currentPage === page ? styles.activePage : ''}
                style={{
                    padding: '8px 12px',
                    margin: '0 5px',
                    backgroundColor: currentPage === page ? '#1890ff' : 'transparent',
                    color: currentPage === page ? 'white' : '#000',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    lineHeight: '24px',
                }}>
                {page}
            </button>
        ));
    };

    // 유저 목록 가져오기 (검색 포함)
    const fetchUsers = async (query = '') => {
        try {
            const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/search`, {
                params: {
                    searchType: searchBy,
                    searchValue: userSearchQuery,
                },
                withCredentials: true, // 쿠키 포함 설정
            });

            // 전체 응답 데이터 출력

            setFilteredUsers(response.data || []); // 데이터가 없으면 빈 배열로 설정
            setUsers(response.data || []);
        } catch (error) {
            console.error('유저 목록 가져오기 실패:', error);
            setFilteredUsers([]); // 에러 발생 시 빈 배열로 설정
            setUsers([]);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchPointsHistory(currentPage);
    }, [currentPage]);

    // 포인트 지급 모달 열기
    const handleOpenModal = () => {
        setIsModalOpen(true);
        setFilteredUsers([]);
        setUserSearchQuery('');
        setSelectedUsers([]);
    };

    // 모달 닫기
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedLoginId('');
        setPointsAmount(0);
        setPointsReason('');
    };

    // 유저 검색 핸들러
    const handleUserSearch = () => {
        fetchUsers(userSearchQuery);
    };

    // 유저 검색 초기화 핸들러
    const handleUserSearchReset = () => {
        setUserSearchQuery('');
        setFilteredUsers([]);
        setSelectedUsers([]);
    };

    // 개별 유저 선택 핸들러 수정
    const handleUserSelect = (user) => {
        setSelectAll(false); // 개별 선택 시 전체 선택 해제
        const isSelected = selectedUsers.some((selectedUser) => selectedUser.LoginID === user.LoginID);

        if (isSelected) {
            setSelectedUsers(selectedUsers.filter((selectedUser) => selectedUser.LoginID !== user.LoginID));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    // 전체 선택 핸들러 수정
    const handleSelectAll = async () => {
        if (selectAll) {
            // If currently selected, clear all selected users
            setSelectedUsers([]);
            setSelectAll(false);
        } else {
            try {
                const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
                    params: { limit: 'all' }, // Fetch all users
                    withCredentials: true,
                });
                setUsers(response.data.users);
                setSelectedUsers(response.data.users.map((user) => ({ LoginID: user.LoginID, Name: user.Name })));
                setSelectAll(true); // Mark as selected
            } catch (error) {
                console.error('전체 선택을 위한 모든 유저 가져오기에 실패했습니다:', error);
            }
        }
    };

    // 개별 유저 제거 핸들러 추가
    const handleUserRemove = (loginID) => {
        setSelectedUsers(selectedUsers.filter((user) => user.LoginID !== loginID));
    };

    // 포인트 지급 저장
    const handleSavePoints = async () => {
        if (!pointsAmount || !pointsReason || selectedUsers.length === 0) {
            alert('모든 필드를 채워주세요.');
            return;
        }

        try {
            for (const user of selectedUsers) {
                await apiClient.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/points`,
                    {
                        loginID: user.LoginID,
                        Amount: pointsAmount,
                        Description: pointsReason,
                    },
                    {
                        withCredentials: true, // 쿠키 포함 설정
                    }
                );
            }
            alert('포인트가 성공적으로 지급되었습니다.');
            fetchPointsHistory(currentPage); // 지급 후 내역 갱신
            closeModal(); // 모달 닫기
        } catch (error) {
            console.error('포인트 지급 실패:', error);
        }
    };

    // 포인트 취소
    const handleCancelPoint = async (pointId, loginId, amount) => {
        try {

            // 서버에 취소 요청 보내기
            const response = await apiClient.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/points/cancel`,
                {
                    pointID: pointId,
                    loginID: loginId,
                    Amount: -Math.abs(amount), // 차감 금액
                    Description: '취소로 인한 차감',
                },
                {
                    withCredentials: true,
                }
            );


            if (response.data && response.data.newPoints) {
                // pointsHistory 상태 업데이트: 취소 내역을 추가하고 기존 내역 수정
                setPointsHistory((prevHistory) => [
                    {
                        PointID: response.data.newPoints.PointID,
                        PointUser: { LoginID: loginId },
                        Description: '취소로 인한 차감',
                        Amount: -Math.abs(amount),
                        ChargeType: 'Deducted',
                        createdAt: new Date().toISOString(),
                        isCancelled: true,
                    },
                    ...prevHistory.map((point) =>
                        point.PointID === pointId ? { ...point, isCancelled: true } : point
                    ),
                ]);

                alert('포인트가 성공적으로 취소되었습니다.');
            } else {
                console.error('취소 항목 생성 실패');
            }
        } catch (error) {
            console.error('포인트 취소 실패:', error);
        }
    };

    // 포인트 유형에 따른 색상 처리
    const getChargeTypeColor = (chargeType: string) => {
        switch (chargeType) {
            case 'Earned':
                return { color: 'green', text: '적립' };
            case 'Used':
                return { color: 'orange', text: '사용' };
            case 'Deducted':
                return { color: 'red', text: '차감' };
            default:
                return { color: 'black', text: chargeType };
        }
    };

    return (
        <div className={styles.container}>
            <PointsSearch onSearch={handleSearch} onReset={handleReset} /> {/* 검색 컴포넌트 추가 */}
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>로그인 ID</th>
                                <th>적립 이유</th>
                                <th>적립 금액</th>
                                <th>변경 유형</th>
                                <th>시간</th>
                                <th>취소</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getCurrentPagePoints().map((point: any, index: number) => {
                                const { color, text } = getChargeTypeColor(point.ChargeType);
                                return (
                                    <tr key={point.PointID}>
                                        <td>{totalPointsCount - ((currentPage - 1) * ITEMS_PER_PAGE + index)}</td>
                                        <td>{point.PointUser?.LoginID || 'N/A'}</td>
                                        <td>{point.Description}</td>
                                        <td>{point.Amount}</td>
                                        <td style={{ color }}>{text}</td>
                                        <td>{new Date(point.createdAt).toLocaleString('ko-KR')}</td>
                                        <td>
                                            <button
                                                style={{
                                                    color: 'white',
                                                    backgroundColor:
                                                        point.ChargeType === 'Deducted' ||
                                                        point.isCancelled ||
                                                        point.ChargeType === 'Used'
                                                            ? '#ccc' // Deducted, 취소된 경우, 또는 Used인 경우 회색(#ccc)
                                                            : '#dc3545', // 그 외에는 빨간색(#dc3545)
                                                    padding: '5px 10px',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor:
                                                        point.ChargeType === 'Deducted' ||
                                                        point.isCancelled ||
                                                        point.ChargeType === 'Used'
                                                            ? 'not-allowed' // 비활성화된 경우 'not-allowed' 커서
                                                            : 'pointer', // 활성화된 경우 클릭 가능한 커서
                                                }}
                                                onClick={() =>
                                                    handleCancelPoint(
                                                        point.PointID,
                                                        point.PointUser?.LoginID,
                                                        point.Amount
                                                    )
                                                }
                                                disabled={
                                                    point.ChargeType === 'Deducted' ||
                                                    point.isCancelled ||
                                                    point.ChargeType === 'Used'
                                                }>
                                                취소
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* 페이지네이션 */}
                    <div style={{ marginTop: '20px', textAlign: 'center', lineHeight: '24px' }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: '8px 12px',
                                margin: '0 5px',
                                backgroundColor: 'transparent',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                border: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}>
                            <IoChevronBackOutline size={18} />
                        </button>

                        {renderPaginationButtons()}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '8px 12px',
                                margin: '0 5px',
                                backgroundColor: 'transparent',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                border: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}>
                            <IoChevronForwardOutline size={18} />
                        </button>

                        {/* 포인트 증감 설정 버튼 (테이블 하단) */}
                        <div style={{ marginTop: '-50px', textAlign: 'right' }}>
                            <button
                                onClick={handleOpenModal}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}>
                                포인트 증감
                            </button>
                        </div>
                    </div>

                    {/* 포인트 변경 모달 */}
                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        contentLabel="포인트 변경"
                        style={{
                            content: {
                                width: '600px',
                                margin: 'auto',
                            },
                        }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>포인트 변경</h2>
                        <p style={{ textAlign: 'center', marginBottom: '20px' }}>- 적립 금액에 음수 / 차감도 가능</p>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {/* 유저 검색 */}
                            <div style={{ marginBottom: '15px', width: '70%' }}>
                                <label>검색 기준:</label>
                                <select
                                    onChange={(e) => setSearchBy(e.target.value)}
                                    value={searchBy}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        marginBottom: '10px',
                                    }}>
                                    <option value="name">이름</option>
                                    <option value="id">아이디</option> {/* LoginID로 검색 */}
                                </select>
                                <input
                                    type="text"
                                    placeholder="사용자 이름 또는 ID 검색"
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        marginBottom: '10px',
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={handleUserSearch}
                                        style={{
                                            marginRight: '10px',
                                            padding: '10px 20px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                        }}>
                                        검색
                                    </button>
                                    <button
                                        onClick={handleUserSearchReset}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                        }}>
                                        초기화
                                    </button>
                                </div>
                            </div>

                            {/* 유저 체크박스 리스트 */}
                            <div style={{ marginBottom: '15px', width: '70%' }}>
                                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                                <label>전체 선택</label>
                                {/* 검색 결과가 있을 때만 개별 체크박스 표시 */}
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.LoginID} // LoginID를 키로 사용
                                        style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.some(
                                                (selectedUser) => selectedUser.LoginID === user.LoginID
                                            )}
                                            onChange={() => handleUserSelect(user)}
                                            style={{ marginRight: '10px' }}
                                        />
                                        {user.Name} ({user.LoginID}) {/* 이름 뒤 LoginID 표시 */}
                                    </div>
                                ))}
                            </div>
                            {/* 선택된 유저 표시 */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxWidth: '70%' }}>
                                {selectedUsers.map((user) => (
                                    <span
                                        key={user.LoginID}
                                        style={{
                                            margin: '5px',
                                            border: '1px solid #ccc',
                                            padding: '5px',
                                            whiteSpace: 'nowrap',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                        }}>
                                        {user.Name} ({user.LoginID})
                                        <button
                                            onClick={() => handleUserRemove(user.LoginID)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                            <MdClose />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div style={{ marginBottom: '15px', width: '70%' }}>
                                <label>적립 이유:</label>
                                <input
                                    type="text"
                                    value={pointsReason}
                                    onChange={(e) => setPointsReason(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        marginBottom: '10px',
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px', width: '70%' }}>
                                <label>적립 금액:</label>
                                <input
                                    type="number"
                                    value={pointsAmount}
                                    onChange={(e) => setPointsAmount(parseInt(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        marginBottom: '10px',
                                    }}
                                />
                            </div>

                            {/* 저장 버튼 */}
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <button
                                    onClick={handleSavePoints}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}>
                                    확인
                                </button>
                                <button
                                    onClick={closeModal}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}>
                                    취소
                                </button>
                            </div>
                        </div>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default PointsTable;
