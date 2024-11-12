import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../../../contexts/AppContext';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { checkAuth } = useAppContext(); // checkAuth 가져오기

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 쿠키 포함
                body: JSON.stringify({ username, password }),
            });


            if (response.ok) {

                // 인증 상태를 업데이트하기 위해 checkAuth 호출
                await checkAuth();

                // 로그인 성공 후 관리자 페이지로 리디렉션
                router.push('/admin');
            } else {
                setError('로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form
                onSubmit={handleLogin}
                style={{ width: '300px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <h2 style={{ textAlign: 'center' }}>관리자 로그인</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div style={{ marginBottom: '15px' }}>
                    <label>아이디:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>비밀번호:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        required
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                    }}>
                    로그인
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
