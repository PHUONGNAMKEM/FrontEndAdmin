import { createPositionAPI, deletePositionAPI, fetchPositionAPI, updatePositionAPI } from "src/services/api.services";
import { hubConnection, startConnection } from "src/services/signalr";
import { PaginationMeta } from "src/types/api";
import { Position } from "src/types/position/Position";

import { create } from "zustand";

interface PositionStore {
    positions: Position[];
    meta?: PaginationMeta | null;
    searchText: string;
    isModalOpen: boolean;
    fetchPosition: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    addPosition?: (payload: Position) => Promise<void>;
    updatePosition?: (id: string, data: Partial<Position>) => Promise<void>;
    deletePosition?: (id: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const usePositionStore = create<PositionStore>((set, get) => {

    // Tự động kết nối SignalR khi store được tạo
    startConnection();

    // Lắng nghe realtime từ backend ASP.NET Core
    hubConnection.on("PositionChanged", ({ action, data }) => {
        const positions = get().positions;

        if (action === "create") {
            set({ positions: [...positions, data] });
        }

        if (action === "update") {
            set({
                positions: positions.map((p) =>
                    p.id === data.id ? { ...p, ...data } : p
                ),
            });
        }

        if (action === "delete") {
            set({
                positions: positions.filter((p) => p.id !== data.id),
            });
        }
    });

    return {

        positions: [],
        meta: null,
        searchText: "",
        isModalOpen: false,

        fetchPosition: async (current = 1, pageSize = 10, q = "") => {
            try {
                const res = await fetchPositionAPI(current, pageSize, q);
                const data = res.data[0];
                const positions = data.result;
                const meta = data.meta;
                console.log(">>> check res: ", res)
                console.log(">>> check positions: ", positions)

                set({ positions, meta });
            } catch (err: any) {
                console.error("Fetch positions failed:", err);
                throw err;
            }
        },

        addPosition: async (payload) => {
            try {
                const res = await createPositionAPI(payload);
                const created = res.data.data || res.data;
                if (created) {
                    set({ positions: [...get().positions, created] });
                }
                return created;
            } catch (err: any) {
                console.error("Thêm mới vị trí thất bại:", err);
                throw err;
            }
        },

        updatePosition: async (id, data) => {
            try {
                const res = await updatePositionAPI(id, data);
                const updated = res.data.data || res.data;

                // Cập nhật trong state
                set({
                    positions: get().positions.map((e) =>
                        e.id === id ? { ...e, ...updated } : e
                    ),
                });
            } catch (err: any) {
                console.error("Cập nhật vị trí thất bại:", err);
                throw err;
            }
        },

        deletePosition: async (id) => {
            try {
                const res = await deletePositionAPI(id);
                if (res.statusCode === 200 || res.data?.success) {
                    // Cập nhật lại store
                    set({
                        positions: get().positions.filter((e) => e.id !== id),
                    });
                }
                set({ positions: get().positions.filter((e) => e.id !== id), });
            } catch (err: any) {
                console.error("Xóa vị trí thất bại:", err);
                throw err;
            }
        },

        setModalOpen: (value) => set({ isModalOpen: value }),
    };
});

// import { create } from "zustand";
// import {
//     createPositionAPI,
//     deletePositionAPI,
//     fetchPositionAPI,
//     updatePositionAPI
// } from "src/services/api.services";

// import { PaginationMeta } from "src/types/api";
// import { Position } from "src/types/position/Position";

// import { startConnection, hubConnection } from "src/services/signalr";

// interface PositionStore {
//     positions: Position[];
//     meta?: PaginationMeta | null;
//     isModalOpen: boolean;

//     fetchPosition: (current?: number, pageSize?: number) => Promise<void>;
//     addPosition?: (payload: Position) => Promise<void>;
//     updatePosition?: (id: string, data: Partial<Position>) => Promise<void>;
//     deletePosition?: (id: string) => Promise<void>;
//     setModalOpen: (value: boolean) => void;
// }

// export const usePositionStore = create<PositionStore>((set, get) => {

//     // Tự động kết nối SignalR khi store được tạo
//     startConnection();

//     // Lắng nghe realtime từ backend ASP.NET Core
//     hubConnection.on("PositionChanged", ({ action, data }) => {
//         const positions = get().positions;

//         if (action === "create") {
//             set({ positions: [...positions, data] });
//         }

//         if (action === "update") {
//             set({
//                 positions: positions.map((p) =>
//                     p.id === data.id ? { ...p, ...data } : p
//                 ),
//             });
//         }

//         if (action === "delete") {
//             set({
//                 positions: positions.filter((p) => p.id !== data.id),
//             });
//         }
//     });

//     return {
//         positions: [],
//         meta: null,
//         isModalOpen: false,

//         // Load danh sách positions
//         fetchPosition: async (current = 1, pageSize = 10) => {
//             try {
//                 const res = await fetchPositionAPI(current, pageSize);

//                 const data = res.data[0];
//                 const positions = data.result;
//                 const meta = data.meta;

//                 set({ positions, meta });
//             } catch (err) {
//                 console.error("Fetch positions failed:", err);
//                 throw err;
//             }
//         },

//         // CRUD không cần setState → backend sẽ bắn realtime
//         addPosition: async (payload) => {
//             try {
//                 const res = await createPositionAPI(payload);
//                 return res.data.data || res.data;
//             } catch (err) {
//                 console.error("Thêm vị trí thất bại:", err);
//                 throw err;
//             }
//         },

//         updatePosition: async (id, data) => {
//             try {
//                 const res = await updatePositionAPI(id, data);
//                 return res.data.data || res.data;
//             } catch (err) {
//                 console.error("Cập nhật vị trí thất bại:", err);
//                 throw err;
//             }
//         },

//         deletePosition: async (id) => {
//             try {
//                 const res = await deletePositionAPI(id);
//                 return res.data;
//             } catch (err) {
//                 console.error("Xóa vị trí thất bại:", err);
//                 throw err;
//             }
//         },

//         // Modal
//         setModalOpen: (value) => set({ isModalOpen: value }),
//     };
// });
