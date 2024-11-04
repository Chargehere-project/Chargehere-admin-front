module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    rules: {
        // 타입 오류 관련 규칙을 비활성화
        '@typescript-eslint/no-explicit-any': 'off', // 'any' 사용 경고 비활성화
        '@typescript-eslint/explicit-module-boundary-types': 'off', // 함수의 반환 타입 명시 경고 비활성화
        '@typescript-eslint/no-non-null-assertion': 'off', // Non-null assertion 경고 비활성화
        '@typescript-eslint/no-unused-vars': 'off', // 미사용 변수 경고 비활성화
    },
};
