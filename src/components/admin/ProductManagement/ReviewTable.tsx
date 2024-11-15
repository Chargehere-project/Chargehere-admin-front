import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { MdEdit, MdDelete } from 'react-icons/md';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { AiOutlineClose } from 'react-icons/ai';
import moment from 'moment-timezone';
import styles from '@/styles/admin/ReviewManagement.module.css';
import ReviewSearch from './ReviewSearch';
import apiClient from '@/utils/apiClient';

const ITEMS_PER_PAGE = 5;

const ReviewTable: React.FC = () => {
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [totalReviews, setTotalReviews] = useState(0); // 총 리뷰 개수 상태 추가
    const [searchParams, setSearchParams] = useState<any>(null); // null일 때는 전체 리스트를 불러오도록 함

    // useEffect(() => {
    //     fetchReviews(currentPage, searchParams);
    // }, [currentPage, searchParams]);

    useEffect(() => {
        fetchReviews(currentPage);
    }, [currentPage]);

    // const fetchReviews = async (page = 1, params: any = null) => {
    //     setIsLoading(true);
    //     try {
    //         const url = params
    //             ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/search`
    //             : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews`;
    //         const response = await axios.get(url, {
    //             params: { page, limit: ITEMS_PER_PAGE, ...params },
    //         });
    //         setReviews(response.data.reviews);
    //         setTotalPages(response.data.totalPages);
    //     } catch (error) {
    //         console.error('리뷰 목록 가져오기 실패:', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const fetchReviews = async (page = 1, searchParams = {}) => {
        setIsLoading(true);
        try {
            const url =
                searchParams && Object.keys(searchParams).length > 0
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/search`
                    : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews`;

            const params = {
                page,
                limit: ITEMS_PER_PAGE,
                ...searchParams,
            };

            console.log('Fetching reviews with params:', params); // 디버깅용

            const response = await apiClient.get(url, { params });

            console.log('Fetched reviews response:', response.data); // 디버깅용
            setReviews(response.data.reviews);
            setTotalPages(response.data.totalPages);
            setTotalReviews(response.data.totalReviews || response.data.reviews.length); // 전체 리뷰 개수 설정
        } catch (error) {
            console.error('리뷰 목록 가져오기 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchReviews(currentPage, searchParams);
    }, [currentPage, searchParams]);


    const handleSearch = (newSearchParams: any) => {
        setCurrentPage(1);
        setSearchParams(newSearchParams); // searchParams 상태 업데이트
        fetchReviews(1, newSearchParams); // 검색 결과로 첫 페이지를 로드
    };

    const handleReset = () => {
        setCurrentPage(1);
        setSearchParams(null); // searchParams를 초기화하여 전체 리스트로 전환
        fetchReviews();
    };

    const handleDeleteReview = async (reviewId) => {
        console.log(`Attempting to delete review with ID: ${reviewId}`);
        const confirmed = window.confirm('이 리뷰를 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            console.log(`DELETE request URL: http://localhost:8000/api/admin/reviews/${reviewId}`);
            const response = await apiClient.delete(`http://localhost:8000/api/admin/reviews/${reviewId}`);
            console.log('Delete response:', response);
            alert('리뷰가 삭제되었습니다.');
            fetchReviews(currentPage);
        } catch (error) {
            console.error('리뷰 삭제 실패:', error.response || error.message);
            alert('리뷰 삭제에 실패했습니다.');
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        fetchReviews(page, searchParams); // searchParams 전달
    };

    const renderPaginationButtons = () => {
        const pages = [];

        if (totalPages <= 5) {
            // 총 페이지 수가 5 이하인 경우 모든 페이지를 보여줌
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                // 현재 페이지가 3 이하인 경우 첫 5개의 페이지를 보여줌
                pages.push(1, 2, 3, 4, 5);
            } else if (currentPage >= totalPages - 2) {
                // 현재 페이지가 마지막 3페이지 중 하나인 경우 마지막 5개의 페이지를 보여줌
                pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // 그 외의 경우 현재 페이지 기준 앞뒤로 2개씩 보여줌
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


    // const toggleReviewStatus = async (reviewId: number, currentStatus: string) => {
    //     const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
    //     try {
    //         await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${reviewId}/status`, {
    //             status: newStatus,
    //         });
    //         fetchReviews(currentPage); // 상태 변경 후 페이지 새로고침
    //     } catch (error) {
    //         console.error('상태 변경 실패:', error);
    //     }
    // };

    const toggleReviewStatus = async (reviewId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
        console.log(`Attempting to update status for review ID: ${reviewId} to ${newStatus}`);
        try {
            const response = await apiClient.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${reviewId}/status`,
                {
                    status: newStatus,
                }
            );
            console.log('Status update response:', response.data);

            setReviews((prev) =>
                prev.map((review) => (review.ReviewID === reviewId ? { ...review, Status: newStatus } : review))
            );
        } catch (error) {
            console.error('상태 변경 실패:', error);
        }
    };

    const openEditModal = (review: any) => {
        setSelectedReview({
            ...review,
            imagePreview: review.Image ? `${process.env.NEXT_PUBLIC_API_URL}${review.Image}` : '',
        });
        setImageFile(null); // 이미지 파일 초기화
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedReview(null);
        setImageFile(null);
        setIsEditModalOpen(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setSelectedReview((prev: any) => ({
                ...prev,
                imagePreview: URL.createObjectURL(file),
            }));
        }
    };

    const removeImagePreview = async () => {
        if (selectedReview?.ReviewID) {
            try {
                await apiClient.delete(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${selectedReview.ReviewID}/image`
                );
                alert('이미지가 성공적으로 삭제되었습니다.');
            } catch (error) {
                console.error('이미지 삭제 실패:', error);
                alert('이미지 삭제에 실패했습니다.');
            }
        }
        setSelectedReview((prev: any) => ({ ...prev, imagePreview: '', ImageFile: null }));
        setImageFile(null);
    };

    const handleSaveReview = async () => {
        try {
            const formData = new FormData();
            formData.append('Content', selectedReview.Content);
            formData.append('Rating', selectedReview.Rating);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            await apiClient.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${selectedReview.ReviewID}`,
                formData
            );

            alert('리뷰가 수정되었습니다.');
            fetchReviews(currentPage); // 페이지 새로고침
            closeEditModal();
        } catch (error) {
            console.error('리뷰 저장 실패:', error);
            alert('리뷰 저장에 실패했습니다.');
        }
    };

    return (
        <div className={styles.container}>
            <ReviewSearch onSearch={handleSearch} onReset={handleReset} /> {/* ReviewSearch 연결 */}
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>로그인 ID</th>
                                <th>상품 ID</th>
                                <th>평점</th>
                                <th>리뷰 내용</th>
                                <th>리뷰 날짜</th>
                                <th>이미지</th>
                                <th>상태</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.length > 0 ? (
                                reviews.map((review: any, index: any) => (
                                    <tr key={review.ReviewID}>
                                        <td>{totalReviews - (currentPage - 1) * ITEMS_PER_PAGE - index}</td>
                                        <td>{review.User.LoginID}</td>
                                        <td>{review.ProductID}</td>
                                        <td>{review.Rating}</td>
                                        <td>
                                            {review.Content.length > 20
                                                ? `${review.Content.slice(0, 20)}...`
                                                : review.Content}
                                        </td>
                                        <td>
                                            {moment(review.CreatedAt)
                                                .tz('Asia/Seoul')
                                                .format('YYYY. MM. DD. A hh:mm:ss')}
                                        </td>

                                        <td>
                                            {review.Image && (
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${review.Image}`}
                                                    alt="리뷰 이미지"
                                                    style={{ width: '150px', height: '50px', objectFit: 'cover' }}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {review.Status === 'deleted' ? (
                                                <span style={{ color: 'red' }}>삭제됨</span>
                                            ) : (
                                                <button
                                                    aria-pressed={review.Status === 'visible'}
                                                    onClick={() => toggleReviewStatus(review.ReviewID, review.Status)}
                                                    style={{
                                                        backgroundColor:
                                                            review.Status === 'visible' ? '#28a745' : '#6c757d',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '5px 10px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                    }}>
                                                    {review.Status === 'visible' ? '활성' : '비활성'}
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <MdEdit
                                                onClick={() => openEditModal(review)}
                                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                            />
                                            <MdDelete
                                                onClick={() => handleDeleteReview(review.ReviewID)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center' }}>
                                        리뷰가 없습니다.
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

                    {/* 리뷰 수정 모달 */}
                    <Modal
                    
                        isOpen={isEditModalOpen}
                        onRequestClose={closeEditModal}
                        ariaHideApp={false} // 필요 시 설정, SSR 앱에서는 false로 설정하는 경우가 있음
                        contentLabel="Edit Review Modal" // 접근성을 위한 레이블
                         style={{
                                content: {
                                    width: '600px',
                                    margin: 'auto',
                                },
                            }}
                        
                    >
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>리뷰 수정</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                                style={{
                                    marginBottom: '15px',
                                    width: '70%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}>
                                <div style={{ width: '30%' }}>
                                    <label>회원 ID:</label>
                                    <input
                                        type="text"
                                        value={selectedReview?.UserID || ''}
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
                                <div style={{ width: '30%' }}>
                                    <label>상품 ID:</label>
                                    <input
                                        type="text"
                                        value={selectedReview?.ProductID || ''}
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
                                <div style={{ width: '30%' }}>
                                    <label>평점:</label>
                                    <input
                                        type="number"
                                        value={selectedReview?.Rating || ''}
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
                            </div>
                            <div style={{ marginBottom: '15px', width: '70%' }}>
                                <label>리뷰 날짜:</label>
                                <input
                                    type="text"
                                    value={
                                        selectedReview
                                            ? moment(selectedReview.CreatedAt)
                                                  .tz('Asia/Seoul')
                                                  .format('YYYY. MM. DD. A hh:mm:ss')
                                            : ''
                                    }
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

                            {/* 이미지 업로드 및 미리보기 */}
                            <div style={{ marginBottom: '15px', width: '70%' }}>
                                <label>리뷰 이미지:</label>
                                <input type="file" onChange={handleImageUpload} />
                                {selectedReview?.imagePreview && (
                                    <div style={{ position: 'relative', marginTop: '10px' }}>
                                        <img
                                            src={selectedReview.imagePreview}
                                            alt="미리보기"
                                            style={{ width: '100%', height: 'auto' }}
                                        />
                                        <AiOutlineClose
                                            onClick={removeImagePreview}
                                            style={{
                                                position: 'absolute',
                                                top: '5px',
                                                right: '5px',
                                                cursor: 'pointer',
                                                color: 'red',
                                                fontSize: '1.5em',
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '15px', width: '70%' }}>
                                <label>리뷰 내용:</label>
                                <textarea
                                    value={selectedReview?.Content || ''}
                                    onChange={(e) =>
                                        setSelectedReview((prev: any) => ({ ...prev, Content: e.target.value }))
                                    }
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
                                    onClick={handleSaveReview}
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
                                    onClick={closeEditModal}
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

export default ReviewTable;
