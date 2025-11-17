export interface UpdateNotificationPayload {
    type: string;
    title: string;
    content: string;
    actionUrl?: string;
    // actorId: string;
    targetUserIds: string[] | null;
    userId: string | null;
}