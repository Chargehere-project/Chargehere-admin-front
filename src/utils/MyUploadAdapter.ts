// src/utils/MyUploadAdapter.ts
export class MyUploadAdapter {
    private loader: any;
    private handleImageUpload: (file: File) => Promise<string | null>;

    constructor(loader: any, handleImageUpload: (file: File) => Promise<string | null>) {
        this.loader = loader;
        this.handleImageUpload = handleImageUpload;
    }

    upload() {
        return this.loader.file.then(async (file: File) => {
            try {
                const url = await this.handleImageUpload(file);
                if (url) {
                    return { default: url };
                } else {
                    throw new Error('이미지 업로드에 실패했습니다.');
                }
            } catch (error) {
                console.error('이미지 업로드 실패:', error);
                throw error;
            }
        });
    }

    abort() {
        // 업로드 중단 시 추가 로직이 필요하다면 작성하세요.
    }
}
