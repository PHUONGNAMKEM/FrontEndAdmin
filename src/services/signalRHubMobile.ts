import * as signalR from "@microsoft/signalr";

let token = localStorage.getItem("access_token") || "";
console.log(">>> Check token SignalR: ", token);

export const hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("https://hrmadmin.huynhthanhson.io.vn/notificationHub", {
        accessTokenFactory: () => token, // Hàm này sẽ được gọi mỗi khi kết nối hoặc reconnect, trả về token mới nhất, Nó trả token để SignalR tự gắn vào query string khi chuyển sang WebSocket.
        // transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
    }) // URL từ backend ASP.NET Core
    .withAutomaticReconnect() // tự động reconnect khi mất kết nối
    .build(); // tạo đối tượng HubConnection

// Bắt đầu kết nối 
export const startConnection = async () => {
    try {
        if (hubConnection.state === "Disconnected") {
            await hubConnection.start(); // chỉ start khi connection đang ở trạng thái Disconnected
            console.log("SignalR connected");
        }
    } catch (err) {
        console.error("SignalR Connection Error: ", err);
        setTimeout(startConnection, 3000);
    }
};
