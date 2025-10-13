export interface ApiResponse<T = any> {
    statusCode: number;
    message: string;
    data: T | null;
    success?: boolean;
}

export interface PaginationMeta {
    current: number;
    pageSize: number;
    total: number;
    pages: number;
}