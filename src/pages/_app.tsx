// src/pages/_app.tsx
import '../styles/globals.css'; // 전역 스타일이 최상단에 위치

import { AppProvider } from '../../contexts/AppContext';

function MyApp({ Component, pageProps }) {
    return (
        <AppProvider>
            <Component {...pageProps} />
        </AppProvider>
    );
}

export default MyApp;
