    import React, { useEffect, useState } from 'react';
    import axios from 'axios';
    import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
    import { MdEdit, MdDelete } from 'react-icons/md'; // edit과 delete 아이콘 사용
    import Modal from 'react-modal'; // 모달 팝업용 패키지 사용
    import Switch from 'react-switch'; // 토글 버튼용 패키지 사용
    import styles from '@/styles/admin/Table.module.css';
    import UserSearch from './UserSearch';
    import apiClient from '@/utils/apiClient';



    // 페이지당 표시할 유저 수
    const ITEMS_PER_PAGE = 10;

    // 페이지 네비게이션에서 표시할 페이지 범위
    const VISIBLE_PAGE_RANGE = 2;

    const UserTable: React.FC = () => {
        // 상태 변수 정의
        const [users, setUsers] = useState<User[]>([]); // 현재 페이지의 유저 목록
        const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
        const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
        const [isLoading, setIsLoading] = useState(true); // 로딩 상태 표시
        const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 (열림/닫힘)
        const [selectedUser, setSelectedUser] = useState<User | null>(null); // 선택된 유저 정보
        const [isSearching, setIsSearching] = useState(false);
        const [searchResults, setSearchResults] = useState<User[]>([]);
        const [searchTotalPages, setSearchTotalPages] = useState(1);
        const [editForm, setEditForm] = useState<EditForm>({
            UserID: 0,
            LoginID: '',
            Name: '',
            Password: '',
            Points: 0,
            PhoneNumber: '',
            Address: '',
        }); // 수정용 인풋 상태 초기값 설정

        // 유저 데이터 타입 정의
        interface User {
            UserID: number;
            LoginID: string;
            Name: string;
            Status: 'Active' | 'Inactive' | 'Withdrawn';
            Points: number;
            JoinDate: string;
            LastLogin: string;
            Password?: string;
            PhoneNumber: string;
            Address: string;
        }

        // 수정용 폼 데이터 타입 정의
        interface EditForm {
            UserID: number;
            LoginID: string;
            Name: string;
            Password?: string;
            Points: number;
            PhoneNumber: string;
            Address: string;
        }
        // 유저 목록을 페이지 단위로 가져오는 함수
        const fetchUsers = async (page: number) => {
            if (isSearching) return; // 검색 중이면 전체 목록을 가져오지 않음

            setIsLoading(true);
            try {
                const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
                    params: { page, limit: ITEMS_PER_PAGE },
                    withCredentials: true,
                });

                setUsers(response.data.users);

                // 첫 페이지 요청 시만 totalPages 설정
                if (page === 1 && response.data.totalPages) {
                    setTotalPages(response.data.totalPages);
                }
            } catch (error) {
                console.error('회원 목록 가져오기 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // 첫 로딩 시 전체 페이지 수와 첫 페이지 데이터 가져오기
        useEffect(() => {
            fetchUsers(currentPage);
        }, [currentPage]);

        // 검색 결과를 처리하는 함수
        const handleSearchResults = (data: User[]) => {
            setIsSearching(true);
            setSearchResults(data);
            setSearchTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE)); // 검색 결과에 맞게 전체 페이지 수 설정
            setCurrentPage(1);
        };

        // 검색 조건 초기화 함수
        const handleReset = () => {
            setIsSearching(false);
            setCurrentPage(1); // 페이지를 1로 설정
            fetchUsers(1); // 첫 페이지의 전체 유저 목록 다시 로드
        };
        
        // 페이지 변경 핸들러
        const handlePageChange = (page: number) => {
            if (page < 1 || page > (isSearching ? searchTotalPages : totalPages)) return; // 유효한 페이지 범위 체크
            setCurrentPage(page); // 페이지 번호 설정
        };

        // 데이터 로드 useEffect
        useEffect(() => {
            if (isSearching) {
                // 검색 중인 경우, 검색 결과에 따른 페이지네이션 적용
                const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                const endIndex = startIndex + ITEMS_PER_PAGE;
                setUsers(searchResults.slice(startIndex, endIndex));
            } else {
                // 검색 중이 아닌 경우에만 전체 유저 목록 가져오기
                fetchUsers(currentPage);
            }
        }, [currentPage, isSearching, searchResults]);

        // 페이지 네비게이션에서 현재 보여줄 페이지 목록 계산
        const getPageGroup = () => {
            const pages = [];
            const startPage = Math.max(currentPage - VISIBLE_PAGE_RANGE, 1);
            const endPage = Math.min(currentPage + VISIBLE_PAGE_RANGE, totalPages);

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
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

        useEffect(() => {
            if (isSearching) {
                const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                const endIndex = startIndex + ITEMS_PER_PAGE;
                setUsers(searchResults.slice(startIndex, endIndex)); // 검색 결과 페이징 처리
            } else {
                fetchUsers(currentPage); // 전체 유저 목록 페이징 처리
            }
        }, [currentPage, isSearching, searchResults]);

        // 유저 정보 수정 핸들러
        const handleEdit = (user: User) => {
            setSelectedUser(user); // 선택된 유저 설정
            setEditForm({
                UserID: user.UserID,
                LoginID: user.LoginID,
                Name: user.Name,
                Password: user.Password || '', // Password가 없을 경우 빈 문자열로 설정
                Points: user.Points,
                PhoneNumber: user.PhoneNumber || '', // PhoneNumber가 없을 경우 빈 문자열로 설정
                Address: user.Address || '', // Address가 없을 경우 빈 문자열로 설정
            });
            setIsModalOpen(true); // 모달 열기
        };

        // 모달 닫기 핸들러
        const closeModal = () => {
            setIsModalOpen(false); // 모달 닫기
            setSelectedUser(null); // 선택된 유저 초기화
        };

        // 유저 정보 수정 완료 핸들러
        const handleSaveEdit = async () => {
            try {
                // API 요청
                await apiClient.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${selectedUser?.UserID}`,
                    editForm,
                    {
                        withCredentials: true, // 쿠키 포함
                    }
                );

                // 성공 시 유저 목록을 다시 가져오기
                fetchUsers(currentPage);

                // 모달 닫기
                closeModal();
            } catch (error) {
                // 오류 메시지 출력
                console.error('유저 정보 수정 실패:', error);

                // 사용자에게 오류 메시지 표시 (예: alert)
                alert('유저 정보 수정에 실패했습니다. 다시 시도해 주세요.');
            }
        };

        // 유저 삭제 핸들러 -> 유저 상태를 '탈퇴'로 변경
        const handleDelete = async (userId: number) => {
            if (window.confirm('해당 유저를 삭제하시겠습니까?')) {
                try {
                    await apiClient.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/status`,
                        { status: 'Withdrawn' },
                        { withCredentials: true } // 쿠키 포함
                    );
                    fetchUsers(currentPage); // 유저 목록 다시 가져오기
                } catch (error) {
                    console.error('유저 상태 변경 실패:', error);
                }
            }
        };

        const handleToggleStatus = async (user: User) => {
            const newStatus = user.Status === 'Active' ? 'Inactive' : 'Active'; // 상태 변경
            try {
                await apiClient.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user.UserID}/status`,
                    { status: newStatus }, // 데이터 객체
                    { withCredentials: true } // 설정 객체
                );
                fetchUsers(currentPage); // 유저 목록 다시 가져오기
            } catch (error) {
                console.error('유저 상태 변경 실패:', error);
            }
        };

        return (
            <div>
                {/* 검색 컴포넌트 */}
                <UserSearch onSearch={handleSearchResults} onReset={handleReset} />

                {/* 로딩 중 표시 */}
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>회원번호</th>
                                    <th>로그인 ID</th>
                                    <th>이름</th>
                                    <th>상태</th>
                                    <th>포인트</th>
                                    <th>가입일</th>
                                    <th>최종접속일</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* 유저 리스트 */}
                                {Array.isArray(users) && users.length > 0 ? (
                                    users.map((user: User) => (
                                        <tr key={user.UserID}>
                                            <td>{user.UserID}</td>
                                            <td>{user.LoginID}</td>
                                            <td>{user.Name}</td>
                                            {/* 상태 토글 버튼 */}
                                            <td>
                                                {user.Status === 'Withdrawn' ? (
                                                    <span style={{ color: 'red' }}>탈퇴</span>
                                                ) : (
                                                    <Switch
                                                        checked={user.Status === 'Active'}
                                                        onChange={() => handleToggleStatus(user)}
                                                        checkedIcon={false}
                                                        uncheckedIcon={false}
                                                    />
                                                )}
                                            </td>
                                            <td>{user.Points}</td>
                                            <td>{user.JoinDate}</td>
                                            <td>{user.LastLogin}</td>
                                            <td>
                                                {/* 수정 버튼 */}
                                                <MdEdit
                                                    onClick={() => handleEdit(user)}
                                                    style={{ cursor: 'pointer', marginRight: '10px' }}
                                                />
                                                {/* 삭제 버튼 */}
                                                <MdDelete
                                                    onClick={() => handleDelete(user.UserID)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center' }}>
                                            회원이 없습니다.
                                        </td>
                                    </tr>
                                )}
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
                        </div>

                        {/* 유저 수정 모달 */}
                        <Modal
                            isOpen={isModalOpen}
                            onRequestClose={closeModal}
                            contentLabel="유저 수정"
                            style={{
                                content: {
                                    width: '600px',
                                    margin: 'auto',
                                },
                            }}>
                            <div className={styles.modalHeader}>회원정보 조회/수정</div>
                            <form className={styles.modalForm}>
                                <div className={styles.formGroup}>
                                    <label>아이디:</label>
                                    <input type="text" value={editForm.LoginID} readOnly className={styles.readOnly} />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>이름:</label>
                                    <input
                                        type="text"
                                        value={editForm.Name}
                                        onChange={(e) => setEditForm({ ...editForm, Name: e.target.value })}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>비밀번호:</label>
                                    <input
                                        type="password"
                                        value={editForm.Password}
                                        onChange={(e) => setEditForm({ ...editForm, Password: e.target.value })}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>포인트:</label>
                                    <input type="number" value={editForm.Points} readOnly className={styles.readOnly} />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>전화번호:</label>
                                    <input
                                        type="text"
                                        value={editForm.PhoneNumber}
                                        onChange={(e) => setEditForm({ ...editForm, PhoneNumber: e.target.value })}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>주소:</label>
                                    <input
                                        type="text"
                                        value={editForm.Address}
                                        onChange={(e) => setEditForm({ ...editForm, Address: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                                    <button type="button" onClick={handleSaveEdit} className={styles.saveButton}>
                                        수정 완료
                                    </button>
                                    <button type="button" onClick={closeModal} className={styles.cancelButton}>
                                        취소
                                    </button>
                                </div>
                            </form>
                        </Modal>
                    </>
                )}
            </div>
        );
    };

    export default UserTable;
