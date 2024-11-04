// /src/pages/api/admin/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import multer from 'multer';
import AWS from 'aws-sdk';

// Multer 설정
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 파일 크기 제한 (2MB)
});

// AWS S3 설정
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // AWS Access Key ID
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // AWS Secret Access Key
    region: process.env.AWS_REGION, // S3 버킷 리전
});

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
    onError(error, req, res) {
        console.error('API Route Error:', error);
        res.status(501).json({ error: `Something went wrong: ${error.message}` });
    },
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    },
});

apiRoute.use(upload.single('file'));

apiRoute.post(async (req: NextApiRequest & { file: Express.Multer.File }, res: NextApiResponse) => {
    const file = req.file;
    if (!file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME, // S3 버킷 이름
        Key: `uploads/${Date.now()}_${file.originalname}`, // 업로드할 파일 이름
        Body: file.buffer,
        ContentType: file.mimetype, // 파일의 MIME 타입
    };

    try {
        const data = await s3.upload(params).promise(); // S3에 파일 업로드
        res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl: data.Location, // S3에서 파일의 URL
        });
    } catch (error) {
        console.error('S3 Upload Error:', error);
        res.status(500).json({ error: 'Error uploading file to S3' });
    }
});

export const config = {
    api: {
        bodyParser: false,
    },
};

export default apiRoute;
