import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Modal from 'react-modal';
import { MdEdit, MdDelete } from 'react-icons/md';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { AiOutlineClose } from 'react-icons/ai';
import moment from 'moment-timezone';
import styles from '@/styles/admin/ProductManagement.module.css';
import ProductSearch from './ProductSearch';
import apiClient from '@/utils/apiClient';
import { Editor } from '@tinymce/tinymce-react';
import { MyUploadAdapter } from '@/utils/MyUploadAdapter';

const ITEMS_PER_PAGE = 5;

const handleImageUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await apiClient.post('/api/admin/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.fileUrl;
    } catch (error) {
        console.error('이미지 업로드 실패:', error);
        return null;
    }
};

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

    const customUploadAdapter = useCallback((loader) => {
        return new MyUploadAdapter(loader, handleImageUpload);
    }, []);

    useEffect(() => {
        import('@tinymce/tinymce-react')
            .then((EditorModule) => {
                setEditor(EditorModule.Editor);
            })
            .catch((error) => {
                console.error('TinyMCE 로드 중 오류:', error);
            });
    }, []);

    if (!editor) {
        return <div>로딩 중...</div>;
    }

    const handleDescriptionChange = (content: string) => {
        setNewProduct((prevProduct) => ({
            ...prevProduct,
            description: content,
        }));
    };

    const fetchProducts = async (page = 1) => {
        const params = {
            page,
            limit: ITEMS_PER_PAGE,
            sort: 'createdAt',
            order: 'DESC',
            ...(searchParams || {}),
        };

        try {
            const response = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
                params,
                withCredentials: true,
            });

            setProducts(response.data.products);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('상품 목록 가져오기 실패:', error);
        }
    };

    useEffect(() => {
        if (!searchParams || Object.keys(searchParams).length === 0) {
            fetchProducts(1);
        }
    }, [searchParams]);

    const handleSearch = (data, params) => {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(1);
        setSearchParams(params);
    };

    const handleImageUpload = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await apiClient.post('/api/admin/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.fileUrl;
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            return null;
        }
    };

    const handleReset = () => {
        setSearchParams({});
        fetchProducts(1);
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        fetchProducts(page);
    };

    const renderPaginationButtons = () => {
        const pages = [];
        const totalDisplayedPages = 5;

        let startPage, endPage;

        if (totalPages <= totalDisplayedPages) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= 3) {
                startPage = 1;
                endPage = totalDisplayedPages;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - totalDisplayedPages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - 2;
                endPage = currentPage + 2;
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
            formData.append('price', newProduct.price.toString());
            formData.append('discountRate', newProduct.discountRate.toString());
            formData.append('description', newProduct.description);
            formData.append('status', newProduct.status);
            if (newProduct.thumbnail) {
                formData.append('thumbnail', newProduct.thumbnail);
            }

            if (isEditing && selectedProduct) {
                await apiClient.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${selectedProduct.ProductID}`,
                    formData,
                    { withCredentials: true }
                );
                alert('상품이 수정되었습니다.');
            } else {
                await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, formData, {
                    withCredentials: true,
                });
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
        setSelectedProduct(null);
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
            thumbnailPreview: product.Image ? `${process.env.NEXT_PUBLIC_API_URL}${product.Image}` : '',
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
                await apiClient.delete(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${selectedProduct.ProductID}/thumbnail`,
                    {
                        withCredentials: true,
                    }
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
            await apiClient.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}/status`,
                {
                    status: 'deleted',
                },
                {
                    withCredentials: true,
                }
            );
            fetchProducts();
        } catch (error) {
            console.error('상품 삭제 실패:', error);
            alert('상품 삭제에 실패했습니다.');
        }
    };

    const toggleProductStatus = async (productId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await apiClient.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}/status`,
                {
                    status: newStatus,
                },
                {
                    withCredentials: true,
                }
            );
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

    return (
        <div className={styles.container}>
            <ProductSearch onSearch={handleSearch} onReset={handleReset} />
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>상품아이디</th>
                        <th>카테고리</th>
                        <th>상품이름</th>
                        <th>이미지</th>
                        <th>가격</th>
                        <th>할인율</th>
                        <th>상태</th>
                        <th>시간</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {products && products.length > 0 ? (
                        products.map((product, index) => (
                            <tr key={product.ProductID}>
                                <td>{totalCount - (currentPage - 1) * ITEMS_PER_PAGE - index}</td>
                                <td>{product.ProductID}</td>
                                <td>{product.CategoryID}</td>
                                <td>{product.ProductName}</td>
                                <td>
                                    {product.Image ? (
                                        <img
                                            src={product.Image}
                                            alt={product.ProductName}
                                            style={{ width: '150px', height: '60px' }}
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
                                                backgroundColor: product.Status === 'active' ? '#28a745' : '#6c757d',
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
                                <td>{moment(product.createdAt).tz('Asia/Seoul').format('YYYY. MM. DD. A hh:mm:ss')}</td>
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
                        ))
                    ) : (
                        <tr>
                            <td colSpan={10} style={{ textAlign: 'center' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ marginBottom: '15px', width: '70%' }}>
                            <label>상세내용:</label>
                            <Editor
                                apiKey="your-tinymce-api-key" // TinyMCE API 키를 사용합니다.
                                value={newProduct.description}
                                init={{
                                    height: 500,
                                    menubar: true,
                                    plugins: ['image', 'link', 'lists', 'media'],
                                    toolbar:
                                        'undo redo | formatselect | bold italic | alignleft aligncenter alignright | image | link | bullist numlist',
                                    images_upload_url: '/api/upload', // 이미지 업로드 URL 설정
                                }}
                                onEditorChange={handleDescriptionChange}
                            />
                        </div>
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
