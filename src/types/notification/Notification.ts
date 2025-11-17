export interface Notification {
    id: string;
    userId: string;
    userName: string;
    type: string; // general / warning / info
    title: string;
    content: string;
    readAt: string | null;
    createdAt: string;
    actorId: string | null;
    actorName: string | null;
    actionUrl: string | null;
}