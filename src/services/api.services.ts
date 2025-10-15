// import axios from "axios";
import { RcFile } from "antd/es/upload";
import { GoalType } from "../types/Goal/GoalType";
import { TaskType } from "../types/TaskType";
import axios from "./axios.customize";
import dayjs, { Dayjs } from "dayjs";
import { ApiResponse } from "src/types/api";
import { Employee } from "src/types/employee/Employee";


// Employee
export const fetchEmployeeAPI = (current: number, pageSize: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Employee?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

export const createEmployeeAPI = (payload: Employee): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Employee";
    // const config = {
    //     headers: {
    //         "Content-Type": "multipart/form-data",
    //     },
    // };
    return axios.post(`${URL_BACKEND}`, payload);
};

export const updateEmployeeAPI = (id: string, payload: Partial<Employee>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Employee/${id}`;
    // const config = {
    //     headers: {
    //         "Content-Type": "multipart/form-data",
    //     },
    // };
    const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, data);
};

export const fetchFilteredEmployeesAPI = (filters: Record<string, any>, current = 1, pageSize = 10): Promise<ApiResponse> => {
    const params = new URLSearchParams({ current: current.toString(), pageSize: pageSize.toString() });
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });
    return axios.get(`/api/employee/filter?${params.toString()}`);
};

export const deleteEmployeeAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Employee/${id}`;

    return axios.delete(`${URL_BACKEND}`);
};


// Change Password
export const changePasswordAPI = (currentPassword: string | undefined, newPassword: string | undefined): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Auth/change-password`;
    const data = {
        currentPassword,
        newPassword
    }
    return axios.post(URL_BACKEND, data);
}


// Department
export const fetchDepartmentAPI = (current: number, pageSize: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Department?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

// Position
export const fetchPositionAPI = (current: number, pageSize: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Position?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

// User
export const fetchUserAPI = (current: number, pageSize: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/user?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}


const createUserAPI = (username: string, email: string, password: string) => {
    const URL_BACKEND = "/api/user";
    const data = {
        fullName: username,
        email: email,
        password: password,
    }

    return axios.post(URL_BACKEND, data);
}

const updateUserAPI = (_id: string, fullName: string, phone: string) => {
    const URL_BACKEND = "/api/user";
    const data = {
        _id: _id,
        fullName: fullName,
        phone: phone
    }

    return axios.put(URL_BACKEND, data)
}

const deleteUserAPI = (_id: string) => {
    const URL_BACKEND = `/api/user/${_id}`;
    return axios.delete(URL_BACKEND)
}

// const fetchUserAPI = (current: number, pageSize: number) => {
//     const URL_BACKEND = `/api/user?current=${current}&pageSize=${pageSize}`;
//     return axios.get(URL_BACKEND)
// }

const registerUserAPI = (username: string, email: string, password: string) => {
    const URL_BACKEND = "/api/user/register";
    const data = {
        username,
        email,
        password,
    }

    return axios.post(URL_BACKEND, data)
}

export const loginAPI = (email: string, password: string): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Auth/login";
    const data = {
        username: email,
        password: password,
        // delay: 2000
    }

    return axios.post(URL_BACKEND, data)
}

export const getAccountAPI = (): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Auth/me";
    return axios.get(URL_BACKEND)
}

const logoutAPI = () => {
    const URL_BACKEND = "/api/logout";
    return axios.post(URL_BACKEND)
}