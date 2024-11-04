const withTM = require('next-transpile-modules')(['rc-util', 'antd']); // 문제 발생 모듈 트랜스파일

module.exports = withTM({
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['sogno-bucket.s3.ap-northeast-2.amazonaws.com'], // S3 도메인 추가
    },
});
