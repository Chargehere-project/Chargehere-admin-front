import React, { useEffect, useState } from 'react';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import Modal from 'react-modal';
import { MdEdit } from 'react-icons/md'; // 수정 아이콘 사용
import styles from '@/styles/admin/Table.module.css';
import apiClient from '@/utils/apiClient';
import PaymentSearch from './PaymentSearch';

interface Transaction {
    TransactionID: number;
    OrderListID: number;
    UserID: number;
    LoginID: string;
    TotalAmount: number;
    TransactionDate: string;
    TransactionStatus: 'Pending' | 'Completed' | 'Cancelled';
    PaymentAmount: number;
    UsedPoints: number;
    PaymentMethod: string;
    User: {
        LoginID: string;
    };
    createdAt: number;
    OrderList: {
        OrderStatus: string;
    };

    Status: 'Pending' | 'Completed' | 'Cancelled';
}

const ITEMS_PER_PAGE = 10;

const PaymentTable: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [newStatus, setNewStatus] = useState<string>(''); // 새 상태 값
    const [searchParams, setSearchParams] = useState<any>({});


    const fetchTransactions = async (page: number, params?: any) => {
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/api/admin/transactions`, {
                params: { page, limit: ITEMS_PER_PAGE, ...params }, // 검색 파라미터를 포함하여 전달
                withCredentials: true,
            });

            setTransactions(response.data.transactions);
            setTotalTransactions(response.data.totalTransactions);

            if (page === 1 && response.data.totalPages) {
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.error('트랜잭션 목록 가져오기 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleSearch = async (searchParams: any) => {
        try {
            setIsLoading(true);
            await fetchTransactions(1, searchParams); // 첫 번째 페이지에서 검색 파라미터를 포함하여 호출
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSearchParams({}); // 검색 파라미터 초기화
        fetchTransactions(1); // 초기 페이지로 검색
    };


    useEffect(() => {
        fetchTransactions(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const handleViewDetails = (transaction: Transaction) => {
        setSelectedTransaction(transaction);

        // OrderList가 존재하면 OrderStatus를 설정, 아니면 기본값 'Pending'을 설정
        const orderStatus = transaction.OrderList ? transaction.OrderList.OrderStatus : 'Pending';
        setNewStatus(orderStatus);

        setIsModalOpen(true);
    };


    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTransaction(null);
    };

    const handleStatusChange = async () => {
        if (selectedTransaction) {
            try {
                // OrderList의 OrderStatus 업데이트 요청
                await apiClient.put(
                    `/api/admin/transactions/${selectedTransaction.TransactionID}/orderlist/status`, // 경로 수정
                    { status: newStatus }, // 새 상태 값 전송
                    { withCredentials: true }
                );

                // 트랜잭션 목록 갱신
                fetchTransactions(currentPage);
                closeModal();
            } catch (error) {
                console.error('거래 상태 변경 실패:', error);
                alert('거래 상태 변경에 실패했습니다.');
            }
        }
    };

    const renderPaginationButtons = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i);
            }
        } else if (currentPage >= totalPages - 2) {
            for (let i = totalPages - 4; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
        }

        return pages.map((page) => (
            <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={currentPage === page ? styles.activePage : ''}
                style={{
                    padding: '8px 12px',
                    margin: '0 5px',
                    borderRadius: '4px',
                    backgroundColor: currentPage === page ? '#1890ff' : 'transparent',
                    color: currentPage === page ? 'white' : '#000',
                    cursor: 'pointer',
                    border: 'none',
                }}>
                {page}
            </button>
        ));
    };

    return (
        <div>
            <PaymentSearch onSearch={handleSearch} onReset={handleReset} />

            {isLoading ? (
                <p>로딩 중...</p> 
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>트랜잭션 ID</th>
                                <th>주문 ID</th>
                                <th>회원 로그인 ID</th>
                                <th>총 결제금액</th>
                                <th>거래 일시</th>
                                <th>거래 상태</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map((transaction, index) => (
                                    <tr key={transaction.TransactionID}>
                                        <td>{totalTransactions - (currentPage - 1) * ITEMS_PER_PAGE - index}</td>
                                        <td>{transaction.TransactionID}</td>
                                        <td>{transaction.OrderListID}</td>
                                        <td>{transaction.User.LoginID}</td>
                                        <td>{transaction.TotalAmount}</td>
                                        <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                                        <td>
                                            {transaction.OrderList ? transaction.OrderList.OrderStatus : '상태 없음'}
                                        </td>

                                        <td>
                                            <MdEdit
                                                onClick={() => handleViewDetails(transaction)}
                                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center' }}>
                                        트랜잭션이 없습니다.
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

                    {selectedTransaction && (
                        <Modal
                            isOpen={isModalOpen}
                            onRequestClose={closeModal}
                            contentLabel="트랜잭션 상세"
                            style={{
                                content: {
                                    width: '600px',
                                    margin: 'auto',
                                    padding: '20px',
                                    fontSize: '16px',
                                },
                            }}>
                            <div className={styles.modalHeader}>트랜잭션 상세 정보</div>
                            <form className={styles.modalForm}>
                                <div className={styles.formGroup}>
                                    <label>트랜잭션 ID:</label>
                                    <input type="text" value={selectedTransaction.TransactionID} readOnly />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>주문 ID:</label>
                                    <input type="text" value={selectedTransaction.OrderListID} readOnly />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>회원 로그인 ID:</label>
                                    <input type="text" value={selectedTransaction.User.LoginID} readOnly />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>총 결제금액:</label>
                                    <input type="number" value={selectedTransaction.TotalAmount} readOnly />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>결제 금액:</label>
                                    <input type="number" value={selectedTransaction.PaymentAmount} readOnly />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>사용된 포인트:</label>
                                    <input type="number" value={selectedTransaction.UsedPoints} readOnly />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>결제 방법:</label>
                                    <input type="text" value={selectedTransaction.PaymentMethod} readOnly />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>주문 상태:</label>
                                    <input type="text" value={selectedTransaction.OrderList?.OrderStatus} readOnly />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>거래 상태:</label>
                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                        <option value="Pending">진행 중</option>
                                        <option value="Completed">완료</option>
                                        <option value="DeliveryCompleted">배송 완료</option>
                                        <option value="Shipping">배송 중</option>
                                        <option value="Cancelled">취소됨</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                    <button type="button" onClick={handleStatusChange} className={styles.saveButton}>
                                        확인
                                    </button>
                                    <button type="button" onClick={closeModal} className={styles.cancelButton}>
                                        취소
                                    </button>
                                </div>
                            </form>
                        </Modal>
                    )}
                </>
            )}
        </div>
    );
};

export default PaymentTable;
