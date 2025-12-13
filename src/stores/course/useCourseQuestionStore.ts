import { create } from "zustand";
import { CourseQuestion } from "src/types/course/CourseQuestion";
import { fetchCourseQuestionsAPI, createCourseQuestionAPI, updateCourseQuestionAPI, deleteCourseQuestionAPI, } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";

interface CourseQuestionStore {
    questions: CourseQuestion[];
    meta?: PaginationMeta | null;
    loading: boolean;
    fetchQuestions: (courseId: string, current?: number, pageSize?: number, q?: string) => Promise<void>;
    addQuestion: (payload: CourseQuestion) => Promise<void>;
    updateQuestion: (id: string, payload: CourseQuestion) => Promise<void>;
    deleteQuestion: (id: string) => Promise<void>;
    clearQuestions: () => void;
}

export const useCourseQuestionStore = create<CourseQuestionStore>((set) => ({
    questions: [],
    meta: null,
    loading: false,

    fetchQuestions: async (courseId, current = 1, pageSize = 20, q?: string) => {
        set({ loading: true });
        try {
            const res = await fetchCourseQuestionsAPI(courseId, current, pageSize, q);
            const data = res.data[0];
            set({
                questions: data.result,
                meta: data.meta,
            });
        } catch (err) {
            console.error("Fetch course questions failed:", err);
        } finally {
            set({ loading: false });
        }
    },

    addQuestion: async (payload) => {
        try {
            const res = await createCourseQuestionAPI(payload);
            const newQ = res.data.result;
            set((state) => ({
                questions: [...state.questions, newQ],
            }));
        } catch (err) {
            console.error("Thêm câu hỏi cho khóa học thất bại:", err);
            throw err;
        }
    },

    updateQuestion: async (id: string, data: Partial<CourseQuestion>) => {
        try {
            const res = await updateCourseQuestionAPI(id, data);
            const updated = res.data.data?.result || res.data.result || res.data;
            set((state) => ({
                questions: state.questions.map((q) => (q.id === id ? { ...q, ...updated } : q)),
            }));
        } catch (err) {
            console.error("Cập nhật câu hỏi thất bại:", err);
            throw err;
        }
    },

    deleteQuestion: async (id: string) => {
        try {
            const res = await deleteCourseQuestionAPI(id);
            if (res.statusCode === 200 || res.data?.success) {
                set((state) => ({
                    questions: state.questions.filter((q) => q.id !== id),
                }));
            }
            else {
                const message = res.data?.message || res.message || "Xóa câu hỏi thất bại";
                throw new Error(message);
            }
        } catch (err) {
            console.error("Xóa câu hỏi trong khóa học thất bại:", err);
            throw err;
        }
    },

    clearQuestions: () => set({ questions: [], meta: null }),
}));
