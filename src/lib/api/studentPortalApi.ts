import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('sasms_token');
    console.log('[API Debug] Using token:', token ? `${token.substring(0, 10)}...` : 'NONE');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Student Profile
export const getStudentProfile = async () => {
    const res = await axios.get(`${API_URL}/student/profile`, { headers: getAuthHeader() });
    return res.data;
};

export const updateStudentProfile = async (data: any) => {
    const res = await axios.put(`${API_URL}/student/profile`, data, { headers: getAuthHeader() });
    return res.data;
};

export const uploadStudentAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await axios.post(`${API_URL}/student/profile/avatar`, formData, {
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

// Admissions
export const getAdmissionsSummary = async () => {
    const res = await axios.get(`${API_URL}/student/admissions`, { headers: getAuthHeader() });
    return res.data;
};

// Fees
export const getStudentFees = async () => {
    const res = await axios.get(`${API_URL}/student/fees`, { headers: getAuthHeader() });
    return res.data;
};


// Complaints
export const getStudentComplaints = async () => {
    const res = await axios.get(`${API_URL}/student/complaints`, { headers: getAuthHeader() });
    return res.data;
};

export const createStudentComplaint = async (data: any) => {
    const res = await axios.post(`${API_URL}/student/complaints`, data, { headers: getAuthHeader() });
    return res.data;
};

export const addComplaintMessage = async (complaintId: string, message: string) => {
    const res = await axios.post(`${API_URL}/student/complaints/${complaintId}/messages`, { message }, { headers: getAuthHeader() });
    return res.data;
};

// Activities
export const getStudentActivities = async () => {
    const res = await axios.get(`${API_URL}/student/activities`, { headers: getAuthHeader() });
    return res.data;
};

export const joinActivity = async (activityId: string) => {
    const res = await axios.post(`${API_URL}/student/activities/${activityId}/join`, {}, { headers: getAuthHeader() });
    return res.data;
};

export const leaveActivity = async (activityId: string) => {
    const res = await axios.delete(`${API_URL}/student/activities/${activityId}/leave`, { headers: getAuthHeader() });
    return res.data;
};

// Attendance
export const scanAttendance = async (data: { sessionId: string; studentLatitude: number; studentLongitude: number }) => {
    const res = await axios.post(`${API_URL}/attendance/scan`, data, { headers: getAuthHeader() });
    return res.data;
};

// Notifications
export const getStudentNotifications = async () => {
    const res = await axios.get(`${API_URL}/student/notifications`, { headers: getAuthHeader() });
    return res.data;
};

// Fee Payment
export const payStudentFee = async (feeId: string, amountPaid: number, receiptFile: File, receiptNumber?: string) => {
    const formData = new FormData();
    formData.append('feeId', feeId);
    formData.append('amountPaid', amountPaid.toString());
    formData.append('receipt', receiptFile);
    if (receiptNumber) formData.append('receiptNumber', receiptNumber);
    const res = await axios.post(`${API_URL}/student/fees/pay`, formData, {
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};
