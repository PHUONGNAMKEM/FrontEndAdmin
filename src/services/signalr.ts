import * as signalR from "@microsoft/signalr";

// let token = localStorage.getItem("access_token") || "";
// console.log(">>> Check token SignalR: ", token);

export const hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("https://hrmadmin.huynhthanhson.io.vn/notificationHubTable", {
        accessTokenFactory: () => {
            const newToken = localStorage.getItem("access_token") || "";
            console.log(">>> SignalR sending token: ", newToken);
            return newToken;
        }, // Hàm này sẽ được gọi mỗi khi kết nối hoặc reconnect, trả về token mới nhất, Nó trả token để SignalR tự gắn vào query string khi chuyển sang WebSocket.
        // transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
    }) // URL từ backend ASP.NET Core
    .withAutomaticReconnect() // tự động reconnect khi mất kết nối
    .build(); // tạo đối tượng HubConnection

// Bắt đầu kết nối 
export const startConnection = async () => {
    // 1. CHƯA CÓ TOKEN → KHÔNG START
    const token = localStorage.getItem("access_token") || "";
    if (!token) {
        console.log("[SignalR] No token, skip startConnection");
        return;
    }

    try {
        if (hubConnection.state === signalR.HubConnectionState.Disconnected) {
            await hubConnection.start();
            console.log("SignalR connected");
        }
    } catch (err: any) {
        console.error("SignalR Connection Error: ", err);

        const msg = err?.message || "";
        const status = err?.statusCode;

        // 2. NẾU 401 THÌ DỪNG, KHÔNG RETRY NỮA
        if (status === 401 || msg.includes("401")) {
            console.log("[SignalR] Unauthorized (401), stop retrying.");
            return;
        }

        // Các lỗi khác mới retry
        setTimeout(startConnection, 3000);
    }
};

export const stopConnection = async () => {
    try {
        await hubConnection.stop();
        console.log("SignalR stopped");
    } catch (e) {
        console.error("Stop SignalR error", e);
    }
};
