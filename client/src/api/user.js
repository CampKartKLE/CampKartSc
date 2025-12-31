import axiosClient from './axiosClient';

export const updateUserProfile = async (profileData) => {
    const { data } = await axiosClient.put('/users/profile', profileData);
    return data;
};

export const updateNotificationPreferences = async (preferences) => {
    const { data } = await axiosClient.put('/users/notifications', { notifications: preferences });
    return data;
};

export const changePassword = async (passwordData) => {
    const { data } = await axiosClient.put('/users/password', passwordData);
    return data;
};
