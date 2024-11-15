// // pages/api/admin/files/[banner].js
// import { getBanners } from '../../../../controller/admin/UploadController';

// export default async function handler(req, res) {
//     const { banner } = req.query;

//     const result = await getBanners(banner);
//     if (result.success) {
//         res.status(200).json({ fileUrl: result.bannerUrl });
//     } else {
//         res.status(500).json({ error: 'Failed to fetch banner', details: result.error });
//     }
// }
