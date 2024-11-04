    import React, { useEffect, useState } from 'react';
    import axios from 'axios';
    import { MdEdit, MdBolt, MdShoppingBag } from 'react-icons/md'; // Edit, Bolt, ShoppingBag 아이콘 사용
    import Modal from 'react-modal'; // 모달 컴포넌트
    import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5'; // 페이지네이션 아이콘
    import InquirySearch from './InquirySearch'; // 검색 컴포넌트
    import styles from '@/styles/admin/InquiryManagement.module.css';

    const ITEMS_PER_PAGE = 10; // 페이지 당 아이템 수
    const VISIBLE_PAGE_RANGE = 2; // 보이는 페이지 범위

    const InquiryTable: React.FC = () => {
        // 상태 정의
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

        // 페이지가 변경될 때 API 호출
        useEffect(() => {
            fetchInquiries(currentPage); // 페이지가 변경되면 데이터를 가져옴
        }, [currentPage]);

        // 페이지별 문의 목록과 전체 개수를 가져오는 함수
        const fetchInquiries = async (page = 1) => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inquiries`, {
                    params: {
                        page,
                        limit: ITEMS_PER_PAGE,
                    },
                });

                console.log('API 응답:', response.data);
                setInquiries(response.data.inquiries);
                setFilteredInquiries(response.data.inquiries);
                setTotalPages(response.data.totalPages);
                setTotalInquiries(response.data.totalItems);
            } catch (error) {
                console.error('문의 목록 가져오기 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // 페이지 변경 시 데이터를 가져옴
        useEffect(() => {
            fetchInquiries(currentPage);
        }, [currentPage]);

        // 전체 문의 수를 가져오는 함수
        useEffect(() => {
            const fetchTotalInquiries = async () => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inquiries/count`);
                    setTotalInquiries(response.data.count);
                } catch (error) {
                    console.error('총 문의 개수를 가져오는데 실패했습니다:', error);
                }
            };

            fetchTotalInquiries();
        }, []);


        // 검색 결과를 필터링하는 함수
        const handleSearchResults = (searchParams) => {
            console.log('검색 조건:', searchParams);

            // 검색 조건이 없으면 전체 목록을 보여줌
            if (
                !searchParams.query &&
                !searchParams.status &&
                !searchParams.inquiryType &&
                !searchParams.startDate &&
                !searchParams.endDate
            ) {
                console.log('검색 조건이 없으므로 전체 목록을 복구합니다.');
                setFilteredInquiries(inquiries); // 조건이 없으면 전체 데이터로 복구
                return;
            }

            // 필터링 로직
            const filtered = inquiries.filter((inquiry) => {
                // 회원 LoginID 또는 내용 검색 필터링
                const queryMatches = searchParams.query
                    ? (inquiry.User &&
                        inquiry.User.LoginID &&
                        inquiry.User.LoginID.toLowerCase().includes(searchParams.query.toLowerCase())) || // LoginID 필터링
                    (inquiry.Title && inquiry.Title.toLowerCase().includes(searchParams.query.toLowerCase())) ||
                    (inquiry.Content && inquiry.Content.toLowerCase().includes(searchParams.query.toLowerCase()))
                    : true;

                // 상태 필터링
                const statusMatches = searchParams.status ? inquiry.Status === searchParams.status : true;

                // 문의 유형 필터링
                const typeMatches = searchParams.inquiryType ? inquiry.InquiryType === searchParams.inquiryType : true;

                // 작성 기간 필터링
                const dateMatches =
                    searchParams.startDate && searchParams.endDate
                        ? new Date(inquiry.CreatedAt) >= new Date(searchParams.startDate) &&
                        new Date(inquiry.CreatedAt) <= new Date(searchParams.endDate)
                        : true;

                return queryMatches && statusMatches && typeMatches && dateMatches;
            });

            console.log('필터링된 결과:', filtered);
            setFilteredInquiries(filtered.length > 0 ? filtered : []);
        };

        // 검색 조건 초기화 함수
        const handleReset = () => {
            setFilteredInquiries(inquiries); // 검색 초기화 시 전체 목록으로 복구
        };

        // 문의 상태를 한국어로 변환하는 함수
        const getStatusInKorean = (status: string) => {
            switch (status) {
                case 'Pending':
                    return <span style={{ color: 'orange' }}>대기중</span>;
                case 'Answered':
                    return <span style={{ color: 'green' }}>답변 완료</span>;
                case 'Closed':
                    return <span style={{ color: 'red' }}>답변 종료</span>;
                default:
                    return status;
            }
        };

        // 문의 유형에 따라 아이콘을 렌더링하는 함수
        const renderInquiryTypeIcon = (type: string) => {
            return type === 'EV' ? <MdBolt size={20} /> : <MdShoppingBag size={20} />;
        };

        // 페이지 변경 함수
        const handlePageChange = (page: number) => {
            if (page < 1 || page > totalPages) return;
            setCurrentPage(page);
        };

        // 페이지 그룹을 계산하여 버튼 목록을 반환하는 함수
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
            const pages = getPageGroup();
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

        // 긴 텍스트를 자르는 함수
        const shortenText = (text: string, limit: number) => {
            if (text.length > limit) {
                return `${text.slice(0, limit)}...`;
            }
            return text;
        };

        // 문의 답변 모달을 여는 함수
        const handleOpenModal = async (inquiry: any) => {
            setSelectedInquiry(inquiry); // 선택된 문의 설정
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/inquiries/${inquiry.InquiryID}/replies`
                );
                if (response.data.reply) {
                    setExistingReply(response.data.reply.ReplyContent); // 기존 답변 불러오기
                    setReplyContent(response.data.reply.ReplyContent); // 기존 답변 내용 설정
                }
            } catch (error) {
                console.error('기존 답변 불러오기 실패:', error);
            }
            setIsModalOpen(true); // 모달 열기
        };

        // 답변 모달 닫기 함수
        const closeModal = () => {
            setIsModalOpen(false);
            setSelectedInquiry(null);
            setReplyContent('');
            setExistingReply('');
        };

        // 답변 저장 함수
        const handleSaveReply = async () => {
            if (!replyContent || replyContent.trim() === '') {
                console.error('답변 내용이 비어 있습니다.');
                return;
            }

            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/inquiries/${selectedInquiry.InquiryID}/replies`,
                    { ReplyContent: replyContent }
                );

                const updatedInquiries = inquiries.map((inquiry) => {
                    if (inquiry.InquiryID === selectedInquiry.InquiryID) {
                        return { ...inquiry, Status: 'Answered' }; // 답변 완료 상태 업데이트
                    }
                    return inquiry;
                });

                setInquiries(updatedInquiries); // 전체 문의 목록 갱신
                setFilteredInquiries(updatedInquiries); // 필터링된 목록 갱신
                closeModal(); // 모달 닫기
            } catch (error) {
                console.error('답변 저장 실패:', error.response?.data || error.message);
            }
        };

        return (
            <div className={styles.container}>
                {/* 검색 컴포넌트 */}
                <InquirySearch onSearch={handleSearchResults} onReset={handleReset} />

                {/* 로딩 중 표시 */}
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        {/* 문의 목록 테이블 */}
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
                                    filteredInquiries.map((inquiry: any, index: number) => (
                                        <tr key={inquiry.InquiryID}>
                                            <td>{totalInquiries - ((currentPage - 1) * ITEMS_PER_PAGE + index)}</td>
                                            <td>{inquiry.User?.LoginID || 'N/A'}</td>
                                            <td>{renderInquiryTypeIcon(inquiry.InquiryType)}</td>
                                            <td>{shortenText(inquiry.Title, 20)}</td>
                                            <td>{shortenText(inquiry.Content, 30)}</td>
                                            <td>{getStatusInKorean(inquiry.Status)}</td>
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

                        {/* 답변 모달 */}
                        <Modal isOpen={isModalOpen} onRequestClose={closeModal} contentLabel="답변하기">
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
