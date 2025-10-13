// import axios from "axios";
import { RcFile } from "antd/es/upload";
import { GoalType } from "../types/Goal/GoalType";
import { TaskType } from "../types/TaskType";
import axios from "./axios.customize";
import dayjs, { Dayjs } from "dayjs";
import { ApiResponse } from "src/types/api";


// Employee
export const fetchEmployeeAPI = (current: number, pageSize: number) => {
    const URL_BACKEND = `/api/employee?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

export const createEmployeeAPI = (formData: FormData) => {
    const URL_BACKEND = "/api/employee";
    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    };
    return axios.post(`${URL_BACKEND}`, formData, config);
};

export const fetchFilteredEmployeesAPI = (filters: Record<string, any>, current = 1, pageSize = 10) => {
    const params = new URLSearchParams({ current: current.toString(), pageSize: pageSize.toString() });
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });
    return axios.get(`/api/employee/filter?${params.toString()}`);
};



// Change Password
export const changePasswordAPI = (oldPassword: string | undefined, newPassword: string | undefined) => {
    const URL_BACKEND = `/api/change-password`;
    const data = {
        oldPassword,
        newPassword
    }
    return axios.post(URL_BACKEND, data);
}

// User
const fetchUserAPI = (current: number, pageSize: number) => {
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

const loginAPI = (email: string, password: string): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/login";
    const data = {
        username: email,
        password: password,
        // delay: 2000
    }

    return axios.post(URL_BACKEND, data)
}

const getAccountAPI = () => {
    const URL_BACKEND = "/api/account";
    return axios.get(URL_BACKEND)
}

const logoutAPI = () => {
    const URL_BACKEND = "/api/logout";
    return axios.post(URL_BACKEND)
}

// Goal
const fetchGoalAPI = () => {
    const URL_BACKEND = "/api/goal";
    return axios.get(URL_BACKEND)
}

const getGoalByIdAPI = (idGoal: string | undefined) => {
    const URL_BACKEND = `/api/goal/${idGoal}`;
    return axios.get(URL_BACKEND)
}

const deleteGoalAPI = (id: number) => {
    const URL_BACKEND = `/api/goal/${id}`;
    return axios.delete(URL_BACKEND)
}

// const createGoalAPI = (title, description, startDate, endDate, isPublic) => {
//     const URL_BACKEND = "/api/goal";
//     const data = {
//         title, description, startDate, endDate, isPublic
//     }

//     return axios.post(URL_BACKEND, data)
// }

interface GoalResponse {
    data: GoalType;
    message: string;
    success: boolean;
    statusCode: number;
}

const createGoalAPI = (title: string, description: string, startDate: string, endDate: string, isPublic: boolean, fileNameBackground: RcFile | null): Promise<GoalResponse> => {
    const URL_BACKEND = "/api/goal/upload";

    let config = {
        headers: {
            // "folder-upload": folder,
            "Content-Type": "multipart/form-data"
        }
    }

    const bodyFormData = new FormData();
    bodyFormData.append("title", title);
    bodyFormData.append("description", description);
    bodyFormData.append("startDate", startDate);
    bodyFormData.append("endDate", endDate);
    bodyFormData.append("isPublic", String(isPublic));

    if (fileNameBackground) {
        bodyFormData.append("background", fileNameBackground);
    }

    return axios.post(URL_BACKEND, bodyFormData, config);
}

// const updateGoalAPI = (id: number, title: string, description: string, endDate: string, isPublic: boolean | null) => {
//     const URL_BACKEND = `/api/goal/${id}`;
//     const data = {
//         title, description, endDate, isPublic
//     }

//     return axios.put(URL_BACKEND, data);
// }

const updateGoalAPI = (id: number, title: string, description: string, endDate: string, isPublic: boolean | null, fileNameBackgroundUpdate: RcFile | null): Promise<GoalResponse> => {
    const URL_BACKEND = `/api/goal/${id}`;

    let config = {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }

    const bodyFormData = new FormData();
    bodyFormData.append("title", title);
    bodyFormData.append("description", description);
    bodyFormData.append("endDate", endDate);
    bodyFormData.append("isPublic", String(isPublic));

    if (fileNameBackgroundUpdate) {
        bodyFormData.append("background", fileNameBackgroundUpdate);
    }

    return axios.put(URL_BACKEND, bodyFormData, config);
}

const getAllTypeofGoal = () => {
    const URL_BACKEND = `/api/type-of-goal`;
    return axios.get(URL_BACKEND);
}

const getTypeofGoalByIdAPI = (idGoal: number) => {
    const URL_BACKEND = `/api/type-of-goal/${idGoal}`;
    return axios.get(URL_BACKEND);
}

const getTaskByIdGoal = (idGoal: string | undefined) => {
    const URL_BACKEND = `api/goal/${idGoal}/task`;
    return axios.get(URL_BACKEND);
}

const changeStatusTask = (idGoal: string | undefined, idTask: number, newStatus: boolean) => {
    const URL_BACKEND = `api/goal/${idGoal}/task/${idTask}/status`;
    const data = {
        isDone: newStatus
    }
    return axios.put(URL_BACKEND, data);
}

const getAllColumnAPI = (idGoal: string | undefined) => {
    const URL_BACKEND = `/api/goal/${idGoal}/column`;
    return axios.get(URL_BACKEND);
}

const createColumnAPI = (idGoal: string | undefined, title: string) => {
    const URL_BACKEND = `/api/goal/${idGoal}/column`;
    const data = {
        title
    }
    return axios.post(URL_BACKEND, data);
}

const deleteColumnAPI = (idGoal: number, idColumn: number) => {
    const URL_BACKEND = `/api/goal/${idGoal}/column/${idColumn}`;
    return axios.delete(URL_BACKEND);
}

const createTaskAPI = (title: string, dueDate: Dayjs, idGoal: string | undefined, idColumn: number) => {
    const URL_BACKEND = `/api/goal/${idGoal}/task`;
    const data = {
        title,
        dueDate,
        idColumn,
    }
    return axios.post(URL_BACKEND, data);
}

const updateTaskColumn = (idGoal: number, idTask: number, newColumnId: number) => {
    const URL_BACKEND = `/api/goal/${idGoal}/task/${idTask}/move`;
    const data = {
        newColumnId
    }
    return axios.put(URL_BACKEND, data);
}

interface taskTarget { idTask: number; priority: number; }
const updateTaskOrders = (idGoal: number, tasks: taskTarget[]) => {
    const URL_BACKEND = `/api/goal/${idGoal}/task/reorder`;
    const data = {
        tasks: tasks
    }
    return axios.put(URL_BACKEND, data);
}

const updateTaskAPI = (idGoal: string, idTask: string, title: string, startDate: Date, dueDate: Date) => {
    const URL_BACKEND = `/api/goal/${idGoal}/task/${idTask}`;
    const data = {
        title,
        startDate,
        dueDate
    }
    return axios.put(URL_BACKEND, data);
}

const updateTitleColumnAPI = (idGoal: string, idColumn: string, title: string) => {
    const URL_BACKEND = `/api/goal/${idGoal}/column/${idColumn}`;
    const data = {
        title
    }
    return axios.put(URL_BACKEND, data);
}

const updateTitleTaskAPI = (idGoal: number | undefined, idTask: number | undefined, title: string, startDate: Dayjs | null, dueDate: Dayjs | null) => {
    const URL_BACKEND = `/api/goal/${idGoal}/task/${idTask}`;
    const data = {
        title,
        startDate,
        dueDate
    }
    return axios.put(URL_BACKEND, data);
}

const deleteTaskAPI = (idGoal: number | undefined, idTask: number | undefined) => {
    const URL_BACKEND = `/api/goal/${idGoal}/task/${idTask}`;
    return axios.delete(URL_BACKEND);
}

const addTypeofGoalToGoalTypeAPI = (idTypeGoal: number, idGoal: number) => {
    const URL_BACKEND = `/api/goal/update/type-of-goal`;
    const data = {
        idTypeGoal,
        idGoal
    }
    return axios.post(URL_BACKEND, data);
}

interface TypeofGoalResponse {
    data: GoalType;
    message: string;
    success: boolean;
    statusCode: number;
}


const createTypeofGoalAPI = (nameType: string, theme: string, idGoal: number | undefined): Promise<TypeofGoalResponse> => {
    const URL_BACKEND = `api/type-of-goal/${idGoal}`;
    const data = {
        nameType,
        theme
    }
    return axios.post(URL_BACKEND, data);
}

const updateTypeofGoalAPI = (nameType: string | undefined, theme: string | undefined, idTypeGoal: number) => {
    const URL_BACKEND = `api/type-of-goal/${idTypeGoal}`;
    const data = {
        nameType,
        theme
    }
    return axios.put(URL_BACKEND, data);
}

const deleteTypeofGoalAPI = (idTypeGoal: number, idGoal: number) => {
    const URL_BACKEND = `api/type-of-goal/`;
    const data = {
        idGoal,
        idTypeGoal
    }
    return axios.delete(URL_BACKEND, { data });
}

const deleteAllTypeofGoalAPI = (idTypeGoal: number) => {
    const URL_BACKEND = `api/type-of-goal/${idTypeGoal}`;
    return axios.delete(URL_BACKEND);
}

export {
    createUserAPI, updateUserAPI, fetchUserAPI, deleteUserAPI,
    registerUserAPI,
    loginAPI, getAccountAPI, logoutAPI, fetchGoalAPI, deleteGoalAPI, createGoalAPI,
    updateGoalAPI, getTypeofGoalByIdAPI, getTaskByIdGoal, changeStatusTask, getAllColumnAPI,
    createColumnAPI, deleteColumnAPI, createTaskAPI, updateTaskColumn, updateTaskOrders,
    updateTitleColumnAPI, updateTitleTaskAPI, deleteTaskAPI, getGoalByIdAPI, getAllTypeofGoal,
    createTypeofGoalAPI, updateTypeofGoalAPI, deleteTypeofGoalAPI, deleteAllTypeofGoalAPI,
    addTypeofGoalToGoalTypeAPI,
}