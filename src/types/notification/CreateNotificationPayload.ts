export interface CreateNotificationPayload {
    type: string;
    title: string;
    content: string;
    actionUrl?: string;
    actorId: string;
    targetUserIds: string[] | null;
}