import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdEdit, MdBolt, MdShoppingBag } from 'react-icons/md'; // Edit, Bolt, ShoppingBag 아이콘 사용
import Modal from 'react-modal'; // 모달 컴포넌트
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5'; // 페이지네이션 아이콘
import InquirySearch from './InquirySearch'; // 검색 컴포넌트
import styles from '@/styles/admin/InquiryManagement.module.css';
import apiClient from '@/utils/apiClient';

const ITEMS_PER_PAGE = 10; // 페이지 당 아이템 수
const VISIBLE_PAGE_RANGE = 2; // 보이는 페이지 범위

const InquiryTable: React.FC = () => {
    const [inquiries, setInquiries] = useState([]); // 전체 문의 목록
    const [filteredInquiries, setFilteredInquiries] = useState([]); // 필터링된 문의 목록
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
    const [selectedInquiry, setSelectedInquiry] = useState(null); // 선택된 문의
    const [replyContent, setReplyContent] = useState(''); // 답변 내용
    const [existingReply, setExistingReply] = useState(''); // 기존 답변 내용
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
    const [totalInquiries, setTotalInquiries] = useState(0); // 전체 문의 수
    const [isSearching, setIsSearching] = useState(false); // 검색 모드 상태
    const [searchParams, setSearchParams] = useState({}); // 검색 조건
    const [searchResults, setSearchResults] = useState([]); // 검색 결과 목록
    const [searchTotalPages, setSearchTotalPages] = useState(1); // 검색 결과 페이지 수

    // 페이지별 문의 목록과 전체 개수를 가져오는 함수
    const fetchInquiries = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inquiries`, {
                params: { page, limit: ITEMS_PER_PAGE },
                withCredentials: true,
            });

            console.log('API 응답:', response.data);
            setInquiries(response.data.inquiries);
            setFilteredInquiries(response.data.inquiries);
            setTotalPages(response.data.totalPages);
            setTotalInquiries(response.data.totalItems);
            setIsSearching(false); // 검색 모드 해제
        } catch (error) {
            console.error('문의 목록 가져오기 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 검색 결과를 필터링하는 함수
    const handleSearchResults = async (params) => {
        setSearchParams(params);

        try {
            setIsLoading(true);

            // 서버에 검색 요청을 보내서 필터링된 데이터와 페이지네이션 정보를 가져옴
            const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inquiries/search`, {
                params: {
                    ...params, // query, startDate, endDate 포함한 모든 검색 조건 전달
                    limit: ITEMS_PER_PAGE,
                    page: currentPage, // 현재 페이지 정보 전달
                },
                withCredentials: true,
            });

            console.log('API 응답:', response.data);

            // 검색 결과와 페이지네이션 설정
            setIsSearching(true); // 검색 모드 활성화
            setSearchResults(response.data.inquiries); // 검색 결과 설정
            setSearchTotalPages(response.data.totalPages); // 검색 결과의 전체 페이지 수 설정
            setTotalInquiries(response.data.totalItems); // 검색된 전체 항목 수
            setFilteredInquiries(response.data.inquiries); // 현재 페이지 데이터 설정
        } catch (error) {
            console.error('검색 요청 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 검색 조건 초기화 함수
    const handleReset = () => {
        setFilteredInquiries(inquiries);
        setIsSearching(false);
        setCurrentPage(1);
    };

    // 페이지 변경 함수
    const handlePageChange = (page) => {
        const total = isSearching ? searchTotalPages : totalPages;
        if (page < 1 || page > total) return;
        setCurrentPage(page);

        if (isSearching) {
            // 검색 모드일 경우, 검색 조건과 현재 페이지를 포함하여 검색 요청을 보냄
            handleSearchResults({ ...searchParams, page });
        } else {
            // 일반 모드일 경우 전체 목록에서 페이지네이션
            fetchInquiries(page);
        }
    };

    // 페이지가 변경될 때 데이터를 가져옴
    useEffect(() => {
        if (isSearching) {
            handleSearchResults({ ...searchParams, page: currentPage });
        } else {
            fetchInquiries(currentPage);
        }
    }, [currentPage, isSearching]);

    // 페이지네이션 버튼을 렌더링하는 함수
    const renderPaginationButtons = () => {
        const total = isSearching ? searchTotalPages : totalPages;
        const pages = [];

        if (total <= 5) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
            } else if (currentPage >= total - 2) {
                for (let i = total - 4; i <= total; i++) {
                    pages.push(i);
                }
            } else {
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

    // 문의 답변 모달을 여는 함수
    const handleOpenModal = async (inquiry) => {
        setSelectedInquiry(inquiry);
        setReplyContent(''); // 새로운 질문일 경우 빈 답변 내용으로 초기화
        setExistingReply(''); // 기존 답변 내용 초기화

        // 문의 상태가 "대기중"이 아니면 답변을 불러옵니다.
        if (inquiry.Status !== 'Pending') {
            try {
                const response = await apiClient.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/inquiries/${inquiry.InquiryID}/replies`,
                    { withCredentials: true }
                );

                if (response.data.reply) {
                    setExistingReply(response.data.reply.ReplyContent);
                    setReplyContent(response.data.reply.ReplyContent);
                }
            } catch (error) {
                console.error('기존 답변 불러오기 실패:', error);
            }
        }

        setIsModalOpen(true);
    };

    // 답변 저장 함수
    const handleSaveReply = async () => {
        if (!replyContent.trim()) {
            console.error('답변 내용이 비어 있습니다.');
            return;
        }

        try {
            await apiClient.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/inquiries/${selectedInquiry.InquiryID}/replies`,
                { ReplyContent: replyContent },
                { withCredentials: true }
            );

            const updatedInquiries = inquiries.map((inquiry) => {
                if (inquiry.InquiryID === selectedInquiry.InquiryID) {
                    return { ...inquiry, Status: 'Answered' };
                }
                return inquiry;
            });

            setInquiries(updatedInquiries);
            setFilteredInquiries(updatedInquiries);
            closeModal();
        } catch (error) {
            console.error('답변 저장 실패:', error.response?.data || error.message);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedInquiry(null);
        setReplyContent('');
        setExistingReply('');
    };

    return (
        <div className={styles.container}>
            <InquirySearch onSearch={handleSearchResults} onReset={handleReset} />

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th style={{ width: '100px' }}>로그인 ID</th>
                                <th>문의 유형</th>
                                <th>문의 제목</th>
                                <th>문의 내용</th>
                                <th>문의 상태</th>
                                <th>작성 시간</th>
                                <th>답변하기</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(filteredInquiries) && filteredInquiries.length > 0 ? (
                                filteredInquiries.map((inquiry, index) => (
                                    <tr key={inquiry.InquiryID}>
                                        <td>{totalInquiries - ((currentPage - 1) * ITEMS_PER_PAGE + index)}</td>
                                        <td>{inquiry.User?.LoginID || 'N/A'}</td>
                                        <td>
                                            {inquiry.InquiryType === 'EV' ? (
                                                <MdBolt size={20} />
                                            ) : (
                                                <MdShoppingBag size={20} />
                                            )}
                                        </td>
                                        <td>{inquiry.Title}</td>
                                        <td>{inquiry.Content}</td>
                                        <td>
                                            {inquiry.Status === 'Pending' ? (
                                                <span style={{ color: 'orange' }}>대기중</span>
                                            ) : inquiry.Status === 'Answered' ? (
                                                <span style={{ color: 'green' }}>답변 완료</span>
                                            ) : (
                                                <span style={{ color: 'red' }}>답변 종료</span>
                                            )}
                                        </td>
                                        <td>{new Date(inquiry.CreatedAt).toLocaleString()}</td>
                                        <td>
                                            <MdEdit
                                                onClick={() => handleOpenModal(inquiry)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center' }}>
                                        문의가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

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

                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        contentLabel="답변하기"
                        style={{
                            content: {
                                width: '600px',
                                margin: 'auto',
                            },
                        }}>
                        <h2 style={{ textAlign: 'center', margin: '10px 0', marginBottom: '20px' }}>문의 답변</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                                style={{
                                    marginBottom: '15px',
                                    width: '70%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}>
                                <div style={{ width: '35%', display: 'flex', alignItems: 'center' }}>
                                    <label style={{ width: '20%' }}>문의 ID:</label>
                                    <input
                                        type="text"
                                        value={selectedInquiry?.InquiryID}
                                        readOnly
                                        style={{
                                            width: '60%',
                                            padding: '10px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                        }}
                                    />
                                </div>

                                <div style={{ width: '35%', display: 'flex', alignItems: 'center' }}>
                                    <label style={{ width: '20%' }}>회원 ID:</label>
                                    <input
                                        type="text"
                                        value={selectedInquiry?.User?.LoginID}
                                        readOnly
                                        style={{
                                            width: '60%',
                                            padding: '10px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                        }}
                                    />
                                </div>

                                <div style={{ width: '25%', display: 'flex', alignItems: 'center' }}>
                                    <label style={{ width: '40%' }}>문의 유형:</label>
                                    <input
                                        type="text"
                                        value={selectedInquiry?.InquiryType === 'EV' ? '전기차' : '쇼핑몰'}
                                        readOnly
                                        style={{
                                            width: '60%',
                                            padding: '10px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px', width: '70%' }}>
                                <label>문의 날짜:</label>
                                <input
                                    type="text"
                                    value={selectedInquiry ? new Date(selectedInquiry.CreatedAt).toLocaleString() : ''}
                                    readOnly
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
                                <label>문의 제목:</label>
                                <textarea
                                    value={selectedInquiry?.Title}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        resize: 'none',
                                        marginBottom: '10px',
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px', width: '70%' }}>
                                <label>문의 내용:</label>
                                <textarea
                                    value={selectedInquiry?.Content}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        height: '80px',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        resize: 'none',
                                        marginBottom: '10px',
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px', width: '70%' }}>
                                <label>답변 내용:</label>
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '80px',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        resize: 'none',
                                        marginBottom: '10px',
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <button
                                    onClick={handleSaveReply}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}>
                                    답변 저장
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

export default InquiryTable;
