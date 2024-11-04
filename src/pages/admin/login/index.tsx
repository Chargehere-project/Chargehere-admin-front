import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

   const handleLogin = async (e: React.FormEvent) => {
       e.preventDefault();
       try {
           // 백엔드 서버 URL 환경 변수 사용
           const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/login`, {
               username,
               password,
           });
           const { token } = response.data;

           // JWT 토큰을 로컬 스토리지에 저장
           localStorage.setItem('adminToken', token);

           // 로그인 성공 시 관리자 페이지로 이동
           router.push('/admin');
       } catch (error) {
           setErrorMessage('로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.');
       }
   };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form
                onSubmit={handleLogin}
                style={{ width: '300px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <h2 style={{ textAlign: 'center' }}>관리자 로그인</h2>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

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
