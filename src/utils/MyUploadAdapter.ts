import axios from 'axios';

interface UploadAdapter {
    upload(): Promise<{ default: string }>;
    abort(): void;
}

export class MyUploadAdapter implements UploadAdapter {
    private loader: any;
    private uploadUrl: string;

    constructor(loader: any, uploadUrl: string) {
        this.loader = loader;
        this.uploadUrl = uploadUrl;
    }

    // 업로드 메서드 (파일을 업로드하고 URL을 반환)
    async upload(): Promise<{ default: string }> {
        const file = this.loader.file;
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(this.uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return {
                default: response.data.fileUrl, // 서버에서 반환한 이미지 URL
            };
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            throw error;
        }
    }

    // 업로드 취소 메서드
    abort(): void {
        console.log('Upload canceled');
    }
}

// 업로드 어댑터를 TinyMCE에 맞게 처리하는 함수
const customUploadAdapter = (loader: any) => {
    return new MyUploadAdapter(loader, '/api/admin/upload-image'); // 업로드 URL
};

export default customUploadAdapter;
