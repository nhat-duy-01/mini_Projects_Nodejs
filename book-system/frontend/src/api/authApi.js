import axiosClient from './axiosClient';

export const loginApi = (data) => {
  return axiosClient.post('/auth/login', data);
};

export const registerApi = (data) => {
  return axiosClient.post('/auth/register', data);
};

export const getMeApi = () => {
  return axiosClient.get('/auth/me');
};

export const updateProfileApi = (data) => {
  return axiosClient.put('/auth/profile', data);
};

export const forgotPasswordApi = (data) => {
  return axiosClient.post('/auth/forget-password', data);
};

export const changePasswordApi = (data) => {
  return axiosClient.put('/auth/change-password', data);
};
