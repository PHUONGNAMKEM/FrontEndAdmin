export interface Course {
    id: string;
    name: string;
    classCode?: string | null;
    passThreshold: number;
    createdAt: string;
    questionCount: number;
}
