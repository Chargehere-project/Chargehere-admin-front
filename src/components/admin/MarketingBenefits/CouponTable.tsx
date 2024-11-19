import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { MdEdit, MdDelete, MdClose } from 'react-icons/md';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import styles from '@/styles/admin/CouponManagement.module.css';
import CouponSearch from './CouponSearch';
import apiClient from '@/utils/apiClient';

const ITEMS_PER_PAGE = 10; // 페이지당 항목 수

const CouponTable: React.FC = () => {
    const [coupons, setCoupons] = useState([]); // 발급된 쿠폰 목록
    const [couponList, setCouponList] = useState([]); // 쿠폰 리스트 (모달 전용)
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
    const [modalType, setModalType] = useState(''); // 모달 타입
    const [newCoupon, setNewCoupon] = useState({
        name: '',
        discountAmount: 0,
        startDate: '',
        expiry: '',
        status: 'active',
    }); // 새로운 쿠폰 생성 데이터
    const [users, setUsers] = useState([]); // 유저 목록 (쿠폰 발급용)
    const [userSearchQuery, setUserSearchQuery] = useState(''); // 유저 검색어
    const [filteredUsers, setFilteredUsers] = useState([]); // 필터링된 유저 목록
    const [selectedUsers, setSelectedUsers] = useState([]); // 선택된 유저 정보
    const [selectedCoupon, setSelectedCoupon] = useState(null); // 선택된 쿠폰 정보
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [searchCriteria, setSearchCriteria] = useState({
        // 쿠폰 검색 기준
        name: '',
        startDate: '',
        endDate: '',
        status: 'active',
    });

    // 필터링 상태
    const [filterName, setFilterName] = useState(''); // 쿠폰명 필터
    const [filterStartDate, setFilterStartDate] = useState(''); // 시작일 필터
    const [filterEndDate, setFilterEndDate] = useState(''); // 종료일 필터
    const [filterStatus, setFilterStatus] = useState(''); // 상태 필터
    const [searchBy, setSearchBy] = useState('name'); // 검색 기준 초기값을 이름으로 설정
    const [selectAll, setSelectAll] = useState(false);
    const [totalCoupons, setTotalCoupons] = useState(0); // 전체 쿠폰 개수
    const [totalUserCoupons, setTotalUserCoupons] = useState(0); // UserCoupon 총 개수 상태 추가
    const [couponOptions, setCouponOptions] = useState([]); // 쿠폰 옵션 목록
    const [allCoupons, setAllCoupons] = useState([]); // 전체 쿠폰 목록

    // useEffect를 사용하여 총 쿠폰 수를 한 번만 가져오기
    useEffect(() => {
        const fetchTotalCoupons = async () => {
            try {
                const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/coupons`, {
                    params: { fetchTotalCount: 'true' },
                    withCredentials: true, // 쿠키 포함 설정
                });

                if (response.data.totalItems) {
                    setTotalCoupons(response.data.totalItems);
                } else {
                    console.warn('totalItems가 응답에 없습니다');
                }
            } catch (error) {
                console.error('총 쿠폰 개수 가져오기 실패:', error);
            }
        };

        fetchTotalCoupons();
    }, []);

    // 검색 핸들러
    const handleSearch = (criteria) => {
        setSearchCriteria(criteria); // 검색 기준을 상태로 설정
        setCurrentPage(1); // 검색 후 첫 페이지로 이동
        fetchCoupons(1, criteria); // 첫 페이지와 검색 조건으로 데이터 가져오기
    };

    // 페이지 변경 시 현재 페이지와 검색 기준을 사용하여 fetchCoupons 호출
    const handlePageChange = (page) => {
        // 선택한 페이지가 현재 페이지와 같다면 재조회하지 않음
        if (page === currentPage || page < 1 || page > totalPages) return;
        setCurrentPage(page);
        fetchCoupons(page, searchCriteria); // 다른 페이지로 이동할 때만 데이터를 가져옴
    };

    // 페이지나 검색 조건이 변경될 때마다 fetchCoupons 호출
    // useEffect(() => {
    //     fetchCoupons(currentPage, searchCriteria); // 현재 페이지와 검색 기준으로 데이터 가져오기
    // }, [currentPage, searchCriteria]);

    useEffect(() => {
        fetchCouponOptions();
    }, []); // CouponTable 컴포넌트 초기 로드 시 한 번만 실행

    // 쿠폰 목록 불러오기 함수 (검색 기준과 페이지를 함께 사용)
    const fetchCoupons = async (page = 1, criteria = {}) => {
        setIsLoading(true);
        try {
            const filteredCriteria = Object.fromEntries(
                Object.entries(criteria).filter(([_, value]) => value != null && value !== '')
            );

            const endpoint =
                Object.keys(filteredCriteria).length > 0
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/coupons/search`
                    : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/coupons/issued`;

            const response = await apiClient.get(endpoint, {
                params: {
                    page, // 현재 페이지 번호
                    limit: ITEMS_PER_PAGE, // 페이지당 항목 수
                    ...filteredCriteria,
                },
                withCredentials: true, // 쿠키 포함 설정
            });

            if (response.data && Array.isArray(response.data.issuedCoupons || response.data)) {
                const couponData = response.data.issuedCoupons || response.data;
                const totalItems = response.data.totalItems || 0;

                const couponsWithUserInfo = couponData.map((coupon, index) => ({
                    ...coupon,
                    loginId: coupon.UserDetail?.LoginID || 'ID 없음',
                    userName: coupon.UserDetail?.Name || '유저 없음',
                    displayNo: totalItems - ((page - 1) * ITEMS_PER_PAGE + index), // No. 계산
                }));

                setCoupons(couponsWithUserInfo);
                setTotalPages(response.data.totalPages || 1); // 검색 결과에 맞는 총 페이지 수
                setTotalCoupons(totalItems); // 검색 결과에 맞는 총 항목 수
                setCurrentPage(page); // 현재 페이지 상태 설정
            } else {
                setCoupons([]);
                setTotalPages(1); // 검색 결과가 없을 경우 페이지 수를 1로 설정
                console.warn('쿠폰 데이터 형식이 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('쿠폰 목록 가져오기 실패:', error);
            setCoupons([]);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    // // 페이지 변경될 때마다 데이터 새로 가져오기
    // useEffect(() => {
    //     fetchCoupons(currentPage, searchCriteria); // 현재 페이지와 검색 기준으로 데이터 가져오기
    // }, [currentPage, searchCriteria]); // searchCriteria 추가

    // 유저 쿠폰 총 개수 가져오기
    const fetchTotalUserCouponsCount = async () => {
        try {
            const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/coupons/count`, {
                withCredentials: true, // 쿠키 포함 설정
            });
            setTotalUserCoupons(response.data.count);
        } catch (error) {
            console.error('UserCoupon 총 개수 가져오기 실패:', error);
        }
    };

    // 컴포넌트 마운트 시 총 개수 가져오기
    useEffect(() => {
        fetchTotalUserCouponsCount(); // 총 개수 가져오는 함수 호출
        fetchCoupons(currentPage); // 기존 쿠폰 데이터도 로드
    }, [currentPage]);

    // 초기화 핸들러
    const handleReset = () => {
        // 검색 조건을 초기화하고 초기 페이지로 돌아가기
        setSearchCriteria({ name: '', startDate: '', endDate: '', status: '' }); // 초기 값으로 설정
        fetchCoupons(1, { name: '', startDate: '', endDate: '', status: '' }); // 빈 검색 조건으로 첫 번째 페이지를 로드합니다
    };

    // 쿠폰 리스트 불러오기 함수
    const fetchCouponList = async (page = 1, name = '', startDate = '', endDate = '', status = '') => {
        setIsLoading(true);
        try {
            // 전체 상태로 설정된 경우, status 값을 undefined로 변경하여 필터링을 적용하지 않음
            const adjustedStatus = status === '전체' ? undefined : status;

            const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/coupons`, {
                params: {
                    page,
                    limit: ITEMS_PER_PAGE,
                    name,
                    startDate,
                    endDate,
                    status: adjustedStatus, // 조정된 status 값을 사용
                },
                withCredentials: true,
            });

            setCouponList(response.data.coupons);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
            setIsLoading(false);
        } catch (error) {
            console.error('쿠폰 리스트 가져오기 실패:', error);
            setIsLoading(false);
        }
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

    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setCoupons(allCoupons.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(allCoupons.length / ITEMS_PER_PAGE));
    }, [currentPage, allCoupons]);

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchCoupons(currentPage);
    }, [currentPage]);

    // 모달 열기
    const openModal = (type: string, coupon = null) => {
        setModalType(type);
        setFilterStatus('전체');
        if (coupon) {
            setSelectedCoupon({
                id: coupon.CouponID,
                name: coupon.CouponName,
                discountAmount: coupon.DiscountAmount,
                startDate: coupon.StartDate,
                expiry: coupon.ExpirationDate,
                status: coupon.Status,
            });
        } else {
            setNewCoupon({ name: '', discountAmount: 0, startDate: '', expiry: '', status: 'active' });
            setSelectedCoupon(null); // 초기화
        }
        setIsModalOpen(true);
        if (type === 'list') {
            fetchCouponList(currentPage);
        } else if (type === 'issue') {
            fetchCouponList();
            setFilteredUsers([]);
            setSelectedUsers([]);
            setUserSearchQuery('');
        }
    };

    // // 모달 닫기
    // const closeModal = () => {
    //     setIsModalOpen(false);
    //     setModalType('');
    //     setSelectedCoupon(null);
    //     setSelectedUsers([]); // 선택된 유저 초기화
    //     setFilteredUsers([]); // 유저 목록 초기화

    //     fetchCouponOptions(); // 쿠폰 옵션 목록을 새로고침
    //     if (modalType === 'list') {
    //         fetchCoupons(currentPage);
    //     }
    // };

    // 모달 닫기
    const closeModal = () => {
        setIsModalOpen(false);
        setModalType('');
        fetchCouponOptions(); // 최신 쿠폰 옵션 목록 불러오기
    };

    // useEffect(() => {
    //     if (!isModalOpen) {
    //         fetchCoupons(currentPage);
    //     }
    // }, [isModalOpen, currentPage]);

    // 필터 적용 함수
    const handleFilterApply = () => {
        const status = filterStatus === '' ? undefined : filterStatus; // 전체 선택 시 상태 필터를 undefined로 설정
        fetchCouponList(1, filterName, filterStartDate, filterEndDate, status); // 필터링 조건 전달
    };

    // 필터 초기화 함수 추가
    const handleFilterReset = () => {
        setFilterName('');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterStatus('전체');
        fetchCouponList(1); // 필터 없이 모든 쿠폰 가져오기
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

    // 새로운 쿠폰 생성 처리
    const handleCreateCoupon = async () => {
        try {
            const response = await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/coupons`, newCoupon, {
                withCredentials: true, // 쿠키 포함 설정
            });
            if (response.data.message === '쿠폰이 성공적으로 생성되었습니다.') {
                alert('쿠폰이 생성되었습니다.');
                fetchCouponOptions(); // 쿠폰 생성 후 쿠폰 목록 새로 가져오기
                setSelectedCoupon(null);
                setNewCoupon({ name: '', discountAmount: 0, startDate: '', expiry: '', status: 'active' });
                closeModal(); // 모달 닫기
            } else if (response.data.message === '중복된 쿠폰명이 있습니다.') {
                alert('이미 존재하는 쿠폰 이름입니다.');
            }
        } catch (error) {
            console.error('쿠폰 생성 실패:', error);
            alert('쿠폰 생성에 실패했습니다.');
        }
    };

    // 쿠폰 옵션 목록 불러오기
    const fetchCouponOptions = async () => {
        try {
            const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/coupons`, {
                withCredentials: true,
            });
            setCouponOptions(response.data.coupons || []);
        } catch (error) {
            console.error('쿠폰 옵션 가져오기 실패:', error);
        }
    };

    // 쿠폰 수정 처리
    const handleEditCoupon = async () => {
        if (!selectedCoupon?.id) {
            console.error('쿠폰 ID가 정의되지 않았습니다.');
            return;
        }
        try {
            await apiClient.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/coupons/${selectedCoupon.id}`,
                {
                    name: selectedCoupon.name,
                    discountAmount: selectedCoupon.discountAmount,
                    startDate: selectedCoupon.startDate,
                    expiry: selectedCoupon.expiry,
                    status: selectedCoupon.status,
                },
                {
                    withCredentials: true, // 쿠키 포함 설정
                }
            );
            fetchCouponList(currentPage);
            openModal('list');
        } catch (error) {
            console.error('쿠폰 수정 실패:', error);
        }
    };

    // 쿠폰 삭제 처리 - 상태를 deleted로 변경
    const handleDeleteCoupon = async (couponId: number) => {
        try {
            await apiClient.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/coupons/${couponId}/status`,
                {
                    status: 'deleted',
                },
                {
                    withCredentials: true, // 쿠키 포함 설정
                }
            );
            alert('쿠폰이 삭제되었습니다.');
            fetchCouponList(currentPage);
        } catch (error) {
            console.error('쿠폰 삭제 실패:', error);
            alert('쿠폰 삭제에 실패했습니다.');
        }
    };

    // 쿠폰 발급 처리
    const handleIssueCoupon = async () => {
        if (selectedUsers.length === 0) {
            alert('발급할 유저를 선택하세요.');
            return;
        }
        if (!selectedCoupon || !selectedCoupon.CouponID) {
            alert('쿠폰을 선택하세요.');
            return;
        }

        try {
            for (const user of selectedUsers) {
                const loginID = user.LoginID;

                const response = await apiClient.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/coupons/issue`,
                    {
                        loginID, // User의 LoginID
                        userID: user.UserID, // User의 ID
                        couponID: selectedCoupon.CouponID,
                        issuedAt: new Date().toISOString(),
                        isUsed: false,
                    },
                    {
                        withCredentials: true, // 쿠키 포함 설정
                    }
                );

                if (response.data.message !== '쿠폰이 성공적으로 발급되었습니다.') {
                    throw new Error(response.data.message);
                }
            }
            alert('쿠폰 발급이 완료되었습니다.');
            fetchCoupons(currentPage);
            closeModal();
        } catch (error) {
            console.error('쿠폰 발급 실패:', error);
            alert('쿠폰 발급에 실패했습니다.');
        }
    };

    // 쿠폰 발급 모달에서 쿠폰 선택 핸들러
    const handleCouponSelection = (event) => {
        const selectedCouponId = event.target.value;
        const selected = couponList.find((c) => c.CouponID === parseInt(selectedCouponId));
        setSelectedCoupon(selected || null);
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

    const renderPaginationButtons = () => {
        const pages = [];
        let startPage, endPage;

        if (totalPages <= 5 || currentPage <= 3) {
            startPage = 1;
            endPage = Math.min(5, totalPages);
        } else if (currentPage + 2 >= totalPages) {
            startPage = totalPages - 4;
            endPage = totalPages;
        } else {
            startPage = currentPage - 2;
            endPage = currentPage + 2;
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={currentPage === i ? styles.activePage : ''}
                    style={{
                        padding: '8px 12px',
                        margin: '0 5px',
                        backgroundColor: currentPage === i ? '#1890ff' : 'transparent',
                        color: currentPage === i ? 'white' : '#000',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        border: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        lineHeight: '24px',
                    }}>
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className={styles.container}>
            <CouponSearch onSearch={handleSearch} onReset={handleReset} couponOptions={couponOptions} />
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>쿠폰명</th>
                                <th>회원 ID</th>
                                <th>회원 이름</th>
                                <th>사용 여부</th>
                                <th>발급일</th>
                                <th>사용일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon, index) => (
                                <tr key={coupon.UserCouponID}>
                                    <td>{totalUserCoupons - ((currentPage - 1) * ITEMS_PER_PAGE + index)}</td>
                                    <td>{coupon.Coupon ? coupon.Coupon.CouponName : '쿠폰 없음'}</td>
                                    <td>{coupon.loginId}</td>
                                    <td>{coupon.userName}</td>
                                    <td style={{ color: coupon.IsUsed ? 'red' : 'orange' }}>
                                        {coupon.IsUsed ? '사용됨' : '미사용'}
                                    </td>
                                    <td>{new Date(coupon.createdAt).toLocaleString()}</td>
                                    <td>{coupon.IsUsed ? new Date(coupon.updatedAt).toLocaleString() : '-'}</td>
                                </tr>
                            ))}
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

                    {/* 모달 버튼들 */}
                    <div style={{ marginTop: '-50px', textAlign: 'right' }}>
                        <button
                            onClick={() => openModal('create')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                marginRight: '10px',
                            }}>
                            쿠폰 생성
                        </button>
                        <button
                            onClick={() => openModal('issue')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                marginRight: '10px',
                            }}>
                            쿠폰 발급
                        </button>
                        <button
                            onClick={() => openModal('list')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}>
                            쿠폰 리스트
                        </button>
                    </div>

                    {/* 모달 창 */}
                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        style={{
                            content: {
                                width: modalType === 'list' ? '1000px' : '600px', // modalType에 따라 width 설정
                                margin: 'auto',
                            },
                        }}>
                        {/* 쿠폰 생성 모달 */}
                        {modalType === 'create' && (
                            <div>
                                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>쿠폰 생성</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ marginBottom: '15px', width: '70%' }}>
                                        <label>쿠폰명:</label>
                                        <input
                                            type="text"
                                            placeholder="쿠폰명"
                                            value={newCoupon.name}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
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
                                        <label>할인 금액:</label>
                                        <input
                                            type="number"
                                            placeholder="할인 금액"
                                            value={newCoupon.discountAmount}
                                            onChange={(e) =>
                                                setNewCoupon({
                                                    ...newCoupon,
                                                    discountAmount: parseInt(e.target.value),
                                                })
                                            }
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
                                        <label>시작일:</label>
                                        <input
                                            type="date"
                                            value={newCoupon.startDate}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
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
                                        <label>종료일:</label>
                                        <input
                                            type="date"
                                            value={newCoupon.expiry}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                                marginBottom: '10px',
                                            }}
                                        />
                                    </div>

                                    {/* 상태 선택 */}
                                    <div style={{ marginBottom: '15px', width: '70%' }}>
                                        <label>상태:</label>
                                        <select
                                            value={newCoupon.status}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, status: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                                marginBottom: '10px',
                                            }}>
                                            <option value="active">Active</option>
                                            <option value="expired">Expired</option>
                                            <option value="deleted">Deleted</option>
                                        </select>
                                    </div>

                                    {/* 버튼 그룹 */}
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button
                                            onClick={handleCreateCoupon}
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
                            </div>
                        )}

                        {/* 쿠폰 발급 모달 */}
                        {modalType === 'issue' && (
                            <div>
                                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>쿠폰 발급</h2>
                                <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    - 검색 기준 없이 검색하면 모든 유저리스트가 나타남
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {/* 쿠폰 선택 */}
                                    <div style={{ marginBottom: '15px', width: '70%' }}>
                                        <label>쿠폰 선택:</label>
                                        <select
                                            onChange={handleCouponSelection}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                                marginBottom: '10px',
                                            }}>
                                            <option value="">선택하세요</option>
                                            {couponList.map((coupon) => (
                                                <option key={coupon.CouponID} value={coupon.CouponID}>
                                                    {coupon.CouponName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

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

                                    {/* 버튼 그룹 */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            marginTop: '20px',
                                        }}>
                                        <button
                                            onClick={handleIssueCoupon}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                            }}>
                                            쿠폰 발급
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
                            </div>
                        )}
                        {/* 쿠폰 리스트 모달 */}
                        {modalType === 'list' && (
                            <div>
                                <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>쿠폰 리스트</h2>

                                {/* 필터링 옵션 UI */}
                                <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
                                    <p className={styles.labelCell}>쿠폰명</p>
                                    <input
                                        type="text"
                                        placeholder="쿠폰명 검색"
                                        value={filterName}
                                        onChange={(e) => setFilterName(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleFilterApply(); // 엔터 키를 눌렀을 때 필터 적용 함수 호출
                                            }
                                        }}
                                    />
                                    <p className={styles.labelCell}>쿠폰 기간</p>
                                    <input
                                        type="date"
                                        placeholder="시작일"
                                        value={filterStartDate}
                                        onChange={(e) => setFilterStartDate(e.target.value)}
                                    />
                                    <input
                                        type="date"
                                        placeholder="종료일"
                                        value={filterEndDate}
                                        onChange={(e) => setFilterEndDate(e.target.value)}
                                    />
                                    <p className={styles.labelCell}>쿠폰 상태</p>
                                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                        <option value="">전체</option> {/* 전체 옵션 추가 */}
                                        <option value="active">Active</option>
                                        <option value="expired">Expired</option>
                                        <option value="deleted">Deleted</option>
                                    </select>
                                    <button
                                        onClick={handleFilterApply}
                                        className={styles.button}
                                        style={{ marginLeft: '50px' }}>
                                        검색
                                    </button>
                                    {/* 필터 초기화 버튼 추가 */}
                                    <button
                                        onClick={handleFilterReset}
                                        className={`${styles.button} ${styles.cancelButton}`}>
                                        초기화
                                    </button>
                                </div>

                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>쿠폰명</th>
                                            <th>할인 금액</th>
                                            <th>유효기간</th>
                                            <th>상태</th>
                                            <th>사용된 쿠폰 수</th>
                                            <th>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {couponList.map((coupon) => (
                                            <tr key={coupon.CouponID}>
                                                <td>{coupon.CouponName}</td>
                                                <td>{coupon.DiscountAmount || '할인 금액 없음'}</td>
                                                <td>
                                                    {coupon.StartDate && coupon.ExpirationDate
                                                        ? `${new Date(coupon.StartDate).toLocaleString()} ~ ${new Date(
                                                              coupon.ExpirationDate
                                                          ).toLocaleString()}`
                                                        : '유효기간 없음'}
                                                </td>
                                                <td
                                                    style={{
                                                        color:
                                                            coupon.Status === 'active'
                                                                ? 'green'
                                                                : coupon.Status === 'expired'
                                                                ? 'orange'
                                                                : 'red',
                                                    }}>
                                                    {coupon.Status === 'active'
                                                        ? '활성'
                                                        : coupon.Status === 'expired'
                                                        ? '만료'
                                                        : '삭제'}
                                                </td>
                                                <td>{coupon.usedCount}</td>
                                                <td>
                                                    <MdEdit
                                                        onClick={() => openModal('edit', coupon)}
                                                        style={{ cursor: 'pointer', marginRight: '10px' }}
                                                    />
                                                    <MdDelete
                                                        onClick={() => handleDeleteCoupon(coupon.CouponID)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {/* 쿠폰 수정 모달 */}
                        {modalType === 'edit' && selectedCoupon && (
                            <div>
                                <h2>쿠폰 수정</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ marginBottom: '15px', width: '70%' }}>
                                        <label>쿠폰명:</label>
                                        <input
                                            type="text"
                                            value={selectedCoupon.name}
                                            onChange={(e) =>
                                                setSelectedCoupon({ ...selectedCoupon, name: e.target.value })
                                            }
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
                                        <label>할인 금액:</label>
                                        <input
                                            type="number"
                                            value={selectedCoupon.discountAmount}
                                            onChange={(e) =>
                                                setSelectedCoupon({
                                                    ...selectedCoupon,
                                                    discountAmount: parseInt(e.target.value),
                                                })
                                            }
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
                                        <label>시작일:</label>
                                        <input
                                            type="date"
                                            value={selectedCoupon.startDate}
                                            onChange={(e) =>
                                                setSelectedCoupon({ ...selectedCoupon, startDate: e.target.value })
                                            }
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
                                        <label>종료일:</label>
                                        <input
                                            type="date"
                                            value={selectedCoupon.expiry}
                                            onChange={(e) =>
                                                setSelectedCoupon({ ...selectedCoupon, expiry: e.target.value })
                                            }
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                                marginBottom: '10px',
                                            }}
                                        />
                                    </div>

                                    {/* 상태 수정 */}
                                    <div style={{ marginBottom: '15px', width: '70%' }}>
                                        <label>상태:</label>
                                        <select
                                            value={selectedCoupon.status}
                                            onChange={(e) =>
                                                setSelectedCoupon({ ...selectedCoupon, status: e.target.value })
                                            }
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                                marginBottom: '10px',
                                            }}>
                                            <option value="active">Active</option>
                                            <option value="expired">Expired</option>
                                            <option value="deleted">Deleted</option>
                                        </select>
                                    </div>

                                    {/* 수정 버튼 */}
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button
                                            onClick={handleEditCoupon}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                            }}>
                                            저장
                                        </button>
                                        <button
                                            onClick={() => openModal('list')}
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
                            </div>
                        )}
                    </Modal>
                </>
            )}
        </div>
    );
};

export default CouponTable;
