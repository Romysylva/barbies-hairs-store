import bcrypt from 'bcryptjs';
export const users = [
    {
        name: 'Promise Sylva',
        email: 'admin@example.com',
        password: bcrypt.hashSync('12345678', 12),
        passwordConfirm: '12345678',
        isAdmin: true,
        roles: ['admin'],
        location: 'Ikot Ekpene',
        preferences: {
            theme: 'dark',
            notification: true,
            language: 'en',
        },
        photo: 'admin.jpg',
    },
    {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: bcrypt.hashSync('12345678', 12),
        passwordConfirm: '12345678',
        roles: ['user'],
        location: 'Uyo',
        preferences: {
            theme: 'light',
            notification: true,
            language: 'en',
        },
        photo: 'default.jpg',
    },
    {
        name: 'John Smith',
        email: 'john@example.com',
        password: bcrypt.hashSync('12345678', 12),
        passwordConfirm: '12345678',
        roles: ['staff'],
        location: 'Abuja',
        preferences: {
            theme: 'light',
            notification: false,
            language: 'en',
        },
        photo: 'default.jpg',
    },
];
