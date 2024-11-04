import { DataTypes } from 'sequelize';
import sequelize from '../../config/database'; // config/database.js 파일 경로에 맞게 수정

const User = sequelize.define(
    'User',
    {
        UserId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        LoginID: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        Name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        Password: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Points: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        JoinDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        PhoneNumber: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        Address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Status: {
            type: DataTypes.ENUM('Active', 'Inactive', 'Withdrawn'), // 유저 상태 필드 추가
            defaultValue: 'Active', // 기본값은 Active
            allowNull: false,
        },
    },
    {
        tableName: 'User',
        timestamps: false,
    }
);


export default User;
