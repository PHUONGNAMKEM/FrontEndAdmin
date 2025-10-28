// import axios from "axios";
import { RcFile } from "antd/es/upload";
import { GoalType } from "../types/Goal/GoalType";
import { TaskType } from "../types/TaskType";
import axios from "./axios.customize";
import dayjs, { Dayjs } from "dayjs";
import { ApiResponse } from "src/types/api";
import { Employee } from "src/types/employee/Employee";
import { Department } from "src/types/department/Department";
import { Position } from "src/types/position/Position";
import { Contract } from "src/types/contract/Contract";


// Employee
export const fetchEmployeeAPI = (current: number, pageSize: number): Promise<ApiResponse> => {
    const URL_BACKEND = current && pageSize
        ? `/api/Employee?current=${current}&pageSize=${pageSize}`
        : `/api/Employee`;
    return axios.get(URL_BACKEND);
}

export const createEmployeeAPI = (payload: FormData): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Employee";
    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    };
    return axios.post(`${URL_BACKEND}`, payload, config);
};

export const updateEmployeeAPI = (id: string, payload: FormData): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Employee/${id}`;
    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    };
    // const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, payload, config);
};

//https://hrmadmin.huynhthanhson.io.vn/api/Employee/filter?fields=fullname&q=Hu%E1%BB%B3nh&current=1&pageSize=20
export const fetchFilteredEmployeesAPI = (filters: Record<string, any>, current = 1, pageSize = 10): Promise<ApiResponse> => {
    const params = new URLSearchParams;

    // Lấy ra các key hợp lý - có value, value ko bị null object[key] = value
    const validKeys = Object.keys(filters).filter(
        (key) => filters[key] !== null && filters[key] !== undefined && filters[key] !== ""
    );

    // Object.keys trả về mảng các key hợp lý -> thêm các key hợp lý vào fields
    // if (validKeys.length > 0) {
    //     params.append("fields", validKeys.join(','));
    // }

    // Thêm các query (key=value) vào url cách 1 (ở đây có validKeys rồi nên dùng lại luôn)
    validKeys.forEach((key) => {
        params.append(key, filters[key]);
    });

    // Thêm các query (key=value) vào url cách 2
    // Object.entries(filters).forEach(([key, value]) => {
    //     if (value) params.append(key, value);
    // });

    params.append("current", current.toString());
    params.append("pageSize", pageSize.toString());
    return axios.get(`/api/Employee/filter?${params.toString()}`);
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

export const createDepartmentAPI = (payload: Department): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Department";
    return axios.post(`${URL_BACKEND}`, payload);
}

export const updateDepartmentAPI = (id: string, payload: Partial<Department>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Department/${id}`;
    const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, data);
}

export const deleteDepartmentAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Department/${id}`;
    return axios.delete(`${URL_BACKEND}`);
}

// Position
export const fetchPositionAPI = (current: number, pageSize: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Position?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

export const createPositionAPI = (payload: Position): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Position";
    return axios.post(`${URL_BACKEND}`, payload);
}

export const updatePositionAPI = (id: string, payload: Partial<Position>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Position/${id}`;
    const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, data);
}

export const deletePositionAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Position/${id}`;
    return axios.delete(`${URL_BACKEND}`);
}

// Contract
export const fetchContractAPI = (current: number, pageSize: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Contract?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

export const fetchContractExpiresAPI = (current: number, pageSize: number, withinDays: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Contract/expiring?withinDays=${withinDays}&current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

export const createContractAPI = (payload: Contract): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Contract";
    return axios.post(`${URL_BACKEND}`, payload);
}

export const updateContractAPI = (id: string, payload: Partial<Contract>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Contract/${id}`;
    const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, data);
}

export const deleteContractAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Contract/${id}`;
    return axios.delete(`${URL_BACKEND}`);
}

// Request
export const fetchRequestAPI = (current: number, pageSize: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Request?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

export const updateRequestStatusAPI = (id: string, newStatus: string | number, approverUserId: string, reason: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Request/process/${id}`;
    return axios.put(URL_BACKEND, { newStatus, approverUserId, reason });
};

// User
export const fetchUserAPI = (current: number, pageSize: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Users/Search?current=${current}&pageSize=${pageSize}`;
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