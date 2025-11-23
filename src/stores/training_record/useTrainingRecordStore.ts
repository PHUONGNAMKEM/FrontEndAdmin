import { create } from "zustand";
import { PaginationMeta } from "src/types/api";
import { createTrainingRecordAPI, deleteTrainingRecordAPI, fetchTrainingRecordAPI, updateTrainingRecordAPI } from "src/services/api.services";
import { TrainingRecord } from "src/types/training_record/TrainingRecord";
import { useEmployeeStore } from "../useEmployeeStore";

interface TrainingRecordStore {
    records: TrainingRecord[];
    meta?: PaginationMeta | null;
    loading: boolean;

    selected: TrainingRecord | null;

    filters: {
        courseId?: string;
        employeeName?: string;
        status?: number;
    };

    fetchRecords: (current?: number, pageSize?: number) => Promise<void>;
    setCourseId: (id: string) => void;
    setStatus: (status: number | null) => void;

    setSelected: (rec: TrainingRecord | null) => void;

    updateRecord: (id: string, data: Partial<TrainingRecord>) => Promise<void>;
    deleteRecord: (id: string) => Promise<void>;
    createRecord: (payload: {
        employeeId: string;
        courseId: string;
        evaluatedBy: string;
        evaluationNote?: string;
    }) => Promise<TrainingRecord>;

    addLocalRecord: (record: TrainingRecord) => void;
}

export const useTrainingRecordStore = create<TrainingRecordStore>((set, get) => ({
    records: [],
    meta: null,
    loading: false,
    selected: null,

    filters: {
        courseId: undefined,
        employeeName: "",
        status: undefined,
    },

    fetchRecords: async (current = 1, pageSize = 10) => {
        set({ loading: true });

        try {
            const res = await fetchTrainingRecordAPI(
                current,
                pageSize,
                get().filters
            );

            const data = res.data[0];
            set({
                records: data.result,
                meta: data.meta,
            });
        } catch (err) {
            console.error("Fetch training records failed:", err);
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    setCourseId: (id) =>
        set((state) => ({
            filters: { ...state.filters, courseId: id },
        })),
    // setEmployeeName: (name) =>
    //     set((state) => ({
    //         filters: { ...state.filters, employeeName: name },
    //     })),
    setStatus: (status: number | null) =>
        set((state) => ({
            filters: { ...state.filters, status: status === null ? undefined : status },
        })),

    setSelected: (rec) => set({ selected: rec }),

    updateRecord: async (id, data) => {
        const res = await updateTrainingRecordAPI(id, data);

        const updated = res.data.data || res.data;

        set({
            records: get().records.map((r) =>
                r.id === id ? { ...r, ...updated } : r
            ),
            selected:
                get().selected?.id === id
                    ? { ...get().selected!, ...updated }
                    : get().selected,
        });
    },

    deleteRecord: async (id) => {
        await deleteTrainingRecordAPI(id);

        set({
            records: get().records.filter((r) => r.id !== id),
            selected:
                get().selected?.id === id ? null : get().selected,
        });
    },

    // createRecord: async (payload) => {
    //     try {
    //         const res = await createTrainingRecordAPI(payload);
    //         const created = res.data?.result || res.data;
    //         console.log(">>> check created record: ", created);
    //         // Thêm vào danh sách hiện tại
    //         set({
    //             records: [...get().records, created],
    //         });

    //         return created;
    //     } catch (err) {
    //         console.error("Create training record failed:", err);
    //         throw err;
    //     }
    // },

    // createRecord: async (payload) => {
    //     try {
    //         const res = await createTrainingRecordAPI(payload);

    //         // Lấy đúng record từ response
    //         const created = res?.data?.result;

    //         console.log(">>> created record:", created);

    //         if (!created) throw new Error("No result from API");

    //         // Lookup employee để lấy fullName, code
    //         const employees = useEmployeeStore.getState().employees;
    //         const emp = employees.find(e => e.id === created.employeeId);

    //         const enrichedRecord = {
    //             ...created,
    //             employeeName: emp?.fullName || "",
    //             // employeeCode: emp?.employeeCode || "",
    //             courseName: "",   // Nếu courseName cần -> tự thêm
    //         };

    //         // Thêm vào danh sách
    //         set({
    //             records: [...get().records, enrichedRecord],
    //         });

    //         return enrichedRecord;

    //     } catch (err) {
    //         console.error("Create training record failed:", err);
    //         throw err;
    //     }
    // },

    // Đây là phiên bản có ghép thêm employeeName để không lỗi
    createRecord: async (payload) => {
        try {
            const res = await createTrainingRecordAPI(payload);

            const created = res?.data?.result;
            if (!created) throw new Error("API không trả về record");

            // Lấy employee info để ghép vào
            const employees = useEmployeeStore.getState().employees;
            const emp = employees.find(e => e.id === created.employeeId);

            // Lấy course name từ records có sẵn
            const existingRec = get().records.find(r => r.courseId === created.courseId);

            const enrichedRecord: TrainingRecord = {
                ...created,
                employeeName: emp?.fullName || "",
                employeeId: emp?.id || "Id này backend không trả, reload lại là được",
                courseName: existingRec?.courseName || "",
                evaluationNote: created.evaluationNote ?? "Ghi chú này cũm không trả, reload lại nhé",
                score: created.score ?? null,
                status: created.status ?? 0
            };

            // PREPEND vào đầu danh sách
            set({
                records: [enrichedRecord, ...get().records],
            });

            return enrichedRecord;

        } catch (err) {
            console.error("Create training record failed:", err);
            throw err;
        }
    },


    addLocalRecord: (record) =>
        set((state) => ({
            records: [record, ...state.records]
        })),

}));
