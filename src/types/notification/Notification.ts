export interface Notification {
    id: string;
    type: string;
    title: string;
    content: string;
    createdAt: string;
    actorId: string;
    actorName: string;
    actionUrl?: string;
}