import { create } from "zustand";
import { fetchCourseAPI, createCourseAPI, updateCourseAPI, deleteCourseAPI, } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { Course } from "src/types/course/Course";

interface CourseStore {
    courses: Course[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchCourses: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    addCourse?: (payload: Partial<Course>) => Promise<void>;
    updateCourse?: (id: string, data: Partial<Course>) => Promise<void>;
    deleteCourse?: (id: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
    courses: [],
    meta: null,
    isModalOpen: false,

    fetchCourses: async (current = 1, pageSize = 10, q = "") => {
        try {
            const res = await fetchCourseAPI(current, pageSize, q);
            const data = res.data[0];
            const courses = data.result;
            const meta = data.meta;
            set({ courses, meta });
        } catch (err: any) {
            console.error("Fetch courses failed:", err);
            throw err;
        }
    },

    addCourse: async (payload) => {
        try {
            const res = await createCourseAPI(payload);
            const created = res.data.data || res.data;
            if (created) {
                set({ courses: [...get().courses, created] });
            }
        } catch (err: any) {
            console.error("Thêm khóa học thất bại:", err);
            throw err;
        }
    },

    updateCourse: async (id, data) => {
        try {
            const res = await updateCourseAPI(id, data);
            const updated = res.data.data || res.data;
            set({
                courses: get().courses.map((e) => (e.id === id ? { ...e, ...updated } : e)),
            });
        } catch (err: any) {
            console.error("Cập nhật khóa học thất bại:", err);
            throw err;
        }
    },

    deleteCourse: async (id) => {
        try {
            const res = await deleteCourseAPI(id);
            if (res.statusCode === 200 || res.data?.success) {
                set({ courses: get().courses.filter((e) => e.id !== id) });
            }
            else {
                const message = res.data?.message || res.message || "Xóa khóa học thất bại";
                throw new Error(message);
            }
        } catch (err: any) {
            console.error("Xóa khóa học thất bại:", err);
            throw err;
        }
    },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));
