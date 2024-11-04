// /components/admin/layouts/AdminLayout.tsx

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    MdArrowDropDown,
    MdPerson,
    MdLocalOffer,
    MdShoppingCart,
    MdSettings,
    MdForum,
    MdPayment,
} from 'react-icons/md';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null); // 1depth 메뉴 상태
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null); // 2depth 메뉴 상태
    const router = useRouter();

    useEffect(() => {
        if (router.pathname.startsWith('/admin/users')) {
            setOpenMenu('users');
            setActiveSubMenu(router.pathname);
        } else if (router.pathname.startsWith('/admin/marketing-benefits')) {
            setOpenMenu('marketing');
            setActiveSubMenu(router.pathname);
        } else if (router.pathname.startsWith('/admin/products')) {
            setOpenMenu('products');
            setActiveSubMenu(router.pathname);
        } else if (router.pathname.startsWith('/admin/site-settings')) {
            setOpenMenu('siteSettings');
            setActiveSubMenu(router.pathname);
        } else if (router.pathname.startsWith('/admin/communication')) {
            setOpenMenu('communication');
            setActiveSubMenu(router.pathname);
        } else if (router.pathname.startsWith('/admin/payments')) {
            setOpenMenu('payments');
            setActiveSubMenu(router.pathname);
        }
    }, [router.pathname]);

    const isActive = (path: string) => {
        return router.pathname === path ? styles.selected : '';
    };

    const handleMenuClick = (menu: string, defaultSubMenu: string) => {
        if (openMenu === menu) {
            setOpenMenu(null);
        } else {
            setOpenMenu(menu);
            setActiveSubMenu(defaultSubMenu);
        }
    };

    const handleSubMenuClick = (subMenu: string) => {
        setActiveSubMenu(subMenu);
    };

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h1>Admin</h1>
                </div>
                <ul className={styles.menuList}>
                    {/* 회원 관리 */}
                    <li className={`${openMenu === 'users' ? styles.active : ''} ${styles.sidebarItem}`}>
                        <button
                            className={styles.depth1}
                            onClick={() => handleMenuClick('users', '/admin/users/users')}>
                            <span>
                                <MdPerson className={styles.icon} /> 회원 관리
                            </span>{' '}
                            <MdArrowDropDown className={styles.arrowIcon} />
                        </button>
                        {openMenu === 'users' && (
                            <ul className={styles.subMenu}>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/users/users')} ${
                                        activeSubMenu === '/admin/users/users' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/users/users"
                                        onClick={() => handleSubMenuClick('/admin/users/users')}>
                                        회원 관리
                                    </Link>
                                </li>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/users/inquiries')} ${
                                        activeSubMenu === '/admin/users/inquiries' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/users/inquiries"
                                        onClick={() => handleSubMenuClick('/admin/users/inquiries')}>
                                        1:1 관리
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* 마케팅 및 혜택 관리 */}
                    <li className={`${openMenu === 'marketing' ? styles.active : ''} ${styles.sidebarItem}`}>
                        <button
                            className={styles.depth1}
                            onClick={() => handleMenuClick('marketing', '/admin/marketing-benefits/points')}>
                            <span>
                                <MdLocalOffer className={styles.icon} /> 마케팅 및 혜택 관리
                            </span>{' '}
                            <MdArrowDropDown className={styles.arrowIcon} />
                        </button>
                        {openMenu === 'marketing' && (
                            <ul className={styles.subMenu}>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/marketing-benefits/points')} ${
                                        activeSubMenu === '/admin/marketing-benefits/points' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/marketing-benefits/points"
                                        onClick={() => handleSubMenuClick('/admin/marketing-benefits/points')}>
                                        포인트 관리
                                    </Link>
                                </li>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/marketing-benefits/coupons')} ${
                                        activeSubMenu === '/admin/marketing-benefits/coupons' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/marketing-benefits/coupons"
                                        onClick={() => handleSubMenuClick('/admin/marketing-benefits/coupons')}>
                                        쿠폰 관리
                                    </Link>
                                </li>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/marketing-benefits/banners')} ${
                                        activeSubMenu === '/admin/marketing-benefits/banners' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/marketing-benefits/banners"
                                        onClick={() => handleSubMenuClick('/admin/marketing-benefits/banners')}>
                                        배너 관리
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* 상품 및 카테고리 관리 */}
                    <li className={`${openMenu === 'products' ? styles.active : ''} ${styles.sidebarItem}`}>
                        <button
                            className={styles.depth1}
                            onClick={() => handleMenuClick('products', '/admin/products/products')}>
                            <span>
                                <MdShoppingCart className={styles.icon} /> 상품 및 카테고리 관리
                            </span>{' '}
                            <MdArrowDropDown className={styles.arrowIcon} />
                        </button>
                        {openMenu === 'products' && (
                            <ul className={styles.subMenu}>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/products/products')} ${
                                        activeSubMenu === '/admin/products/products' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/products/products"
                                        onClick={() => handleSubMenuClick('/admin/products/products')}>
                                        상품 관리
                                    </Link>
                                </li>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/products/categories')} ${
                                        activeSubMenu === '/admin/products/categories' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/products/categories"
                                        onClick={() => handleSubMenuClick('/admin/products/categories')}>
                                        카테고리 관리
                                    </Link>
                                </li>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/products/reviews')} ${
                                        activeSubMenu === '/admin/products/reviews' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/products/reviews"
                                        onClick={() => handleSubMenuClick('/admin/products/reviews')}>
                                        리뷰 관리
                                    </Link>
                                </li>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/products/qna')} ${
                                        activeSubMenu === '/admin/products/qna' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/products/qna"
                                        onClick={() => handleSubMenuClick('/admin/products/qna')}>
                                        QnA 관리
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* 사이트 설정 및 디자인 관리 */}
                    <li className={`${openMenu === 'siteSettings' ? styles.active : ''} ${styles.sidebarItem}`}>
                        <button
                            className={styles.depth1}
                            onClick={() => handleMenuClick('siteSettings', '/admin/site-settings/designsettings')}>
                            <span>
                                <MdSettings className={styles.icon} /> 사이트 설정
                            </span>{' '}
                            <MdArrowDropDown className={styles.arrowIcon} />
                        </button>
                        {openMenu === 'siteSettings' && (
                            <ul className={styles.subMenu}>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/site-settings/designsettings')} ${
                                        activeSubMenu === '/admin/site-settings/designsettings' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/site-settings/designsettings"
                                        onClick={() => handleSubMenuClick('/admin/site-settings/designsettings')}>
                                        로고 / 파비콘 관리
                                    </Link>
                                </li>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/site-settings/seo')} ${
                                        activeSubMenu === '/admin/site-settings/seo' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/site-settings/seo"
                                        onClick={() => handleSubMenuClick('/admin/site-settings/seo')}>
                                        SEO 관리
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* 고객 커뮤니케이션 관리 */}
                    <li className={`${openMenu === 'communication' ? styles.active : ''} ${styles.sidebarItem}`}>
                        <button
                            className={styles.depth1}
                            onClick={() => handleMenuClick('communication', '/admin/communication/notices')}>
                            <span>
                                <MdForum className={styles.icon} /> 커뮤니케이션 관리
                            </span>{' '}
                            <MdArrowDropDown className={styles.arrowIcon} />
                        </button>
                        {openMenu === 'communication' && (
                            <ul className={styles.subMenu}>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/communication/notices')} ${
                                        activeSubMenu === '/admin/communication/notices' ? styles.selected : ''
                                    }`}>
                                    <Link
                                        href="/admin/communication/notices"
                                        onClick={() => handleSubMenuClick('/admin/communication/notices')}>
                                        공지사항 관리
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* 결제 관리 */}
                    <li className={`${openMenu === 'payments' ? styles.active : ''} ${styles.sidebarItem}`}>
                        <button
                            className={styles.depth1}
                            onClick={() => handleMenuClick('payments', '/admin/payments')}>
                            <span>
                                <MdPayment className={styles.icon} /> 결제 관리
                            </span>{' '}
                            <MdArrowDropDown className={styles.arrowIcon} />
                        </button>
                        {openMenu === 'payments' && (
                            <ul className={styles.subMenu}>
                                <li
                                    className={`${styles.depth2} ${isActive('/admin/payments')} ${
                                        activeSubMenu === '/admin/payments' ? styles.selected : ''
                                    }`}>
                                    <Link href="/admin/payments" onClick={() => handleSubMenuClick('/admin/payments')}>
                                        결제 관리
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                </ul>
            </aside>

            <main className={styles.mainContent}>{children}</main>
        </div>
    );
};

export default AdminLayout;
