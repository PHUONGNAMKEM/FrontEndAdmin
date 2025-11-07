export interface CourseQuestion {
    id?: string;
    courseId: string;
    courseName?: string;
    content: string;
    a: string;
    b: string;
    c: string;
    d: string;
    correct: "A" | "B" | "C" | "D";
}