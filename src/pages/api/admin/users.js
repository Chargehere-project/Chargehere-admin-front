import User from '@/models/user';
import { Op } from 'sequelize';

export default async function handler(req, res) {
    const { searchTerm, searchType, startDate, endDate } = req.query;
    console.log('Request query:', { searchTerm, searchType, startDate, endDate });

    const where = {
        ...(searchType === 'name' && { name: { [Op.like]: `%${searchTerm}%` } }),
        ...(searchType === 'id' && { username: { [Op.like]: `%${searchTerm}%` } }),
        ...(startDate &&
            endDate && {
                joinDate: {
                    [Op.between]: [startDate, endDate],
                },
            }),
    };

    try {
        const users = await User.findAll({ where });

        // 상태 값을 한글로 변환
        const usersWithKoreanStatus = users.map((user) => ({
            ...user.toJSON(),
            Status: user.Status === 'Active' ? '활성' : user.Status === 'Inactive' ? '비활성' : '탈퇴',
        }));

        console.log('Fetched users with Korean status:', usersWithKoreanStatus); // 변환된 데이터를 로그로 출력
        res.status(200).json(usersWithKoreanStatus); // 변환된 데이터를 클라이언트에 전달
    } catch (error) {
        console.error('Error fetching users:', error); // 에러 로그 출력
        res.status(500).json({ error: '서버에서 데이터를 가져오는 데 실패했습니다.' });
    }
}
