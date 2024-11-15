import multer from 'multer';
import nc from 'next-connect';
import { uploadBanner, getBanners } from '../../../../controller/admin/UploadController';

const upload = multer();

// Next.js API 라우트 핸들러 설정
const handler = nc()
    .use(upload.single('file')) // Multer로 파일 처리
    .post(async (req, res) => {
        const result = await uploadBanner(req, res);
        if (result.success) {
            res.status(200).json({ message: 'Upload successful', fileUrl: result.fileUrl });
        } else {
            res.status(500).json({ error: 'Upload failed', details: result.error });
        }
    })
    .get(async (req, res) => {
        const result = await getBanners(req, res);
        if (result.success) {
            res.status(200).json({ bannerUrl: result.bannerUrl });
        } else {
            res.status(500).json({ error: 'Failed to fetch banners', details: result.error });
        }
    });

export default handler;

export const config = {
    api: {
        bodyParser: false, // Multer는 자체적으로 body를 처리
    },
};
