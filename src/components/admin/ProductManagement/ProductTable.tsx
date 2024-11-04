import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Modal from 'react-modal';
import { MdEdit, MdDelete } from 'react-icons/md';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { AiOutlineClose } from 'react-icons/ai'; // close 버튼 아이콘
import moment from 'moment-timezone';
import 'react-quill/dist/quill.snow.css';
import styles from '@/styles/admin/ProductManagement.module.css';
import ProductSearch from './ProductSearch';



const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
const ITEMS_PER_PAGE = 5; // 한 페이지에 보여줄 항목 수

const ProductTable: React.FC = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: 0,
        discountRate: 0,
        thumbnail: null,
        thumbnailPreview: '',
        description: '',
        status: 'active',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useState({});
    const [totalCount, setTotalCount] = useState(0);

   const fetchProducts = async (page = 1) => {
       const params = {
           page,
           limit: ITEMS_PER_PAGE,
           sort: 'createdAt',
           order: 'DESC',
           ...(searchParams || {}),
       };

       console.log('Fetching products with params:', params); // 디버깅용 로그

       try {
           const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, { params });
           console.log('백엔드에서 받아온 데이터:', response.data.products); // 백엔드 응답 확인

           setProducts(response.data.products);
           setTotalPages(response.data.totalPages);
           setCurrentPage(page);

           // totalCount를 추가하여 상태 업데이트
           setTotalCount(response.data.totalCount); // 전체 상품 수 상태 업데이트

           console.log('Product state after setting:', products); // 상태가 업데이트되었는지 확인
       } catch (error) {
           console.error('상품 목록 가져오기 실패:', error);
       }
   };


    useEffect(() => {
        // 검색 조건이 없을 때만 fetchProducts 호출
        if (!searchParams || Object.keys(searchParams).length === 0) {
            fetchProducts(1);
        }
    }, [searchParams]); // 검색 조건이 변경될 때만 fetchProducts 호출


    const handleSearch = (data, params) => {
        console.log('handleSearch 호출 - 검색 결과:', data);
        console.log('handleSearch 호출 - 검색 조건:', params);
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(1);
        setSearchParams(params);
    };

    useEffect(() => {
        console.log('products 상태 변경으로 인해 리렌더링 발생:', products); // 상태 변경 확인
    }, [products]);

    // 검색 초기화 핸들러
    const handleReset = () => {
        setSearchParams({}); // 검색 조건을 초기화
        fetchProducts(1); // 첫 페이지로 돌아가기
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        fetchProducts(page);
    };

    const renderPaginationButtons = () => {
        const pages = [];
        const totalDisplayedPages = 5; // 총 보일 페이지 수

        // 페이지 번호를 계산합니다.
        let startPage, endPage;

        if (totalPages <= totalDisplayedPages) {
            // 총 페이지가 5페이지 이하일 경우
            startPage = 1;
            endPage = totalPages;
        } else {
            // 총 페이지가 5페이지를 초과하는 경우
            if (currentPage <= 3) {
                startPage = 1;
                endPage = totalDisplayedPages; // 1~5 페이지
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - totalDisplayedPages + 1; // 마지막 5페이지
                endPage = totalPages;
            } else {
                startPage = currentPage - 2; // 현재 페이지 기준으로 2페이지 앞
                endPage = currentPage + 2; // 현재 페이지 기준으로 2페이지 뒤
            }
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


    const handleSaveProduct = async () => {
        try {
            const formData = new FormData();
            formData.append('name', newProduct.name);
            formData.append('price', newProduct.price);
            formData.append('discountRate', newProduct.discountRate);
            formData.append('description', newProduct.description);
            formData.append('status', newProduct.status);
            if (newProduct.thumbnail) {
                formData.append('thumbnail', newProduct.thumbnail);
            }

            if (isEditing && selectedProduct) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${selectedProduct.ProductID}`,
                    formData
                );
                alert('상품이 수정되었습니다.');
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, formData);
                alert('상품이 등록되었습니다.');
            }
            fetchProducts();
            closeModal();
        } catch (error) {
            console.error('상품 저장 실패:', error);
            alert('상품 저장에 실패했습니다.');
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setSelectedProduct(null); // 선택된 상품을 초기화
        setNewProduct({
            name: '',
            price: 0,
            discountRate: 0,
            thumbnail: null,
            thumbnailPreview: '',
            description: '',
            status: 'active',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setIsEditing(true);
        setSelectedProduct(product);
        setNewProduct({
            name: product.ProductName,
            price: product.Price,
            discountRate: product.Discount,
            thumbnail: null,
            thumbnailPreview: product.Image ? `${process.env.NEXT_PUBLIC_API_URL}${product.Image}` : '', // 이미지 경로 또는 빈 문자열
            description: product.DetailInfo,
            status: product.Status,
        });

        setIsModalOpen(true);
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProduct({
                ...newProduct,
                thumbnail: file,
                thumbnailPreview: URL.createObjectURL(file),
            });
        }
    };

    const removeThumbnailPreview = async () => {
        if (isEditing && selectedProduct && selectedProduct.Image) {
            try {
                await axios.delete(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${selectedProduct.ProductID}/thumbnail`
                );
                console.log('서버에서 이미지가 삭제되었습니다.');
            } catch (error) {
                console.error('이미지 삭제 실패:', error);
                alert('이미지 삭제에 실패했습니다.');
            }
        }

        setNewProduct((prev) => ({ ...prev, thumbnail: null, thumbnailPreview: '' }));
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}/status`, {
                status: 'deleted',
            });
            fetchProducts();
        } catch (error) {
            console.error('상품 삭제 실패:', error);
            alert('상품 삭제에 실패했습니다.');
        }
    };

    const toggleProductStatus = async (productId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}/status`, {
                status: newStatus,
            });
            fetchProducts();
        } catch (error) {
            console.error('상태 변경 실패:', error);
            alert('상태 변경에 실패했습니다.');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setNewProduct((prev) => ({ ...prev, thumbnailPreview: '' }));
    };

    const modules = {
        toolbar: [
            [{ header: '1' }, { header: '2' }, { font: [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            ['link', 'image', 'video'],
            ['clean'],
        ],
        clipboard: {
            matchVisual: false,
        },
    };

    const formats = [
        'header',
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
        'video',
    ];

    return (
        <div className={styles.container}>
            {/* ProductSearch 컴포넌트 추가 */}
            <ProductSearch onSearch={handleSearch} onReset={handleReset} />
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>No.</th> {/* No. 열 추가 */}
                        <th>상품아이디</th>
                        <th>카테고리</th>
                        <th>상품이름</th>
                        <th>이미지</th> {/* 이미지 열 추가 */}
                        <th>가격</th>
                        <th>할인율</th>
                        <th>상태</th>
                        <th>시간</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {products && products.length > 0 ? (
                        products.map((product, index) => {
                            console.log('Rendering product:', product); // 제품이 올바르게 렌더링되는지 확인
                            return (
                                <tr key={product.ProductID}>
                                    <td>{totalCount - (currentPage - 1) * ITEMS_PER_PAGE - index}</td> {/* No. 계산 */}
                                    <td>{product.ProductID}</td>
                                    <td>{product.CategoryID}</td>
                                    <td>{product.ProductName}</td>
                                    <td>
                                        {product.Image ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}${product.Image}`}
                                                alt={product.ProductName}
                                                style={{ width: '150px', height: '60px' }} // 이미지 미리보기
                                            />
                                        ) : (
                                            '미리보기 없음'
                                        )}
                                    </td>
                                    <td>{product.Price}</td>
                                    <td>{product.Discount}%</td>
                                    <td>
                                        {product.Status === 'deleted' ? (
                                            <span style={{ color: 'red' }}>삭제됨</span>
                                        ) : (
                                            <button
                                                onClick={() => toggleProductStatus(product.ProductID, product.Status)}
                                                style={{
                                                    backgroundColor:
                                                        product.Status === 'active' ? '#28a745' : '#6c757d',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                }}>
                                                {product.Status === 'active' ? '활성' : '비활성'}
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        {moment(product.createdAt).tz('Asia/Seoul').format('YYYY. MM. DD. A hh:mm:ss')}
                                    </td>
                                    <td>
                                        <MdEdit
                                            onClick={() => openEditModal(product)}
                                            style={{ cursor: 'pointer', marginRight: '10px' }}
                                        />
                                        <MdDelete
                                            onClick={() => handleDeleteProduct(product.ProductID)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="10" style={{ textAlign: 'center' }}>
                                검색된 상품이 없습니다.
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

            <div style={{ textAlign: 'right', marginTop: '-50px' }}>
                <button
                    onClick={openAddModal}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}>
                    상품 등록
                </button>
            </div>

            <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isEditing ? '상품 수정' : '상품 등록'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ marginBottom: '15px', width: '70%' }}>
                        <label>상품이름:</label>
                        <input
                            type="text"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
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
                        <label>가격:</label>
                        <input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) })}
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
                        <label>할인율:</label>
                        <input
                            type="number"
                            value={newProduct.discountRate}
                            onChange={(e) => setNewProduct({ ...newProduct, discountRate: parseInt(e.target.value) })}
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
                        <label>썸네일 이미지:</label>
                        <input type="file" onChange={handleThumbnailChange} />
                        {newProduct.thumbnailPreview && (
                            <div style={{ position: 'relative', marginTop: '10px' }}>
                                <img
                                    src={newProduct.thumbnailPreview}
                                    alt="미리보기"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                                <AiOutlineClose
                                    onClick={removeThumbnailPreview}
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
                        <label>상세내용:</label>
                        <ReactQuill
                            modules={modules}
                            formats={formats}
                            theme="snow"
                            value={newProduct.description}
                            onChange={(value) => setNewProduct({ ...newProduct, description: value })}
                            style={{ height: '200px', marginBottom: '100px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button
                            onClick={handleSaveProduct}
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
        </div>
    );
};

export default ProductTable;
