/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: true, // SWC의 최소화 설정 활성화
    compiler: {
        styledComponents: true, // styled-components를 사용하는 경우
    },
    reactStrictMode: true,
};

export default nextConfig;
