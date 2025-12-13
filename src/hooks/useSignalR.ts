import { useEffect, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { notification } from "antd";

const clean = (s: string) => s.replace(/^"|"$/g, "");

export const useSignalR = () => {
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const queryClient = useQueryClient();

    const forceLogout = useCallback(
        async (reason?: string) => {
            try {
                // 1) Thông báo
                notification.warning({
                    message: "Phiên đăng nhập đã thay đổi",
                    description:
                        reason ??
                        "Tài khoản của bạn vừa được cập nhật quyền/trạng thái. Vui lòng đăng nhập lại.",
                    placement: "topRight",
                    duration: 4,
                });

                // 2) Clear token
                localStorage.clear();

                // 3) Clear cache account để UI về Guest ngay
                queryClient.setQueryData(["account"], undefined);
                await queryClient.invalidateQueries({ queryKey: ["account"] });

                // 4) Stop hub
                await connectionRef.current?.stop();

                // 5) Redirect login
                // (để notification kịp hiện)
                setTimeout(() => {
                    window.location.href = "/login";
                }, 300);
            } catch (e) {
                console.error("forceLogout error:", e);
                window.location.href = "/login";
            }
        },
        [queryClient]
    );

    useEffect(() => {
        const tokenRaw = localStorage.getItem("access_token");
        if (!tokenRaw) return;

        const conn = new signalR.HubConnectionBuilder()
            .withUrl("https://hrmadmin.huynhthanhson.io.vn/hubs/auth", {
                accessTokenFactory: () => clean(localStorage.getItem("access_token") || ""),
            })
            .withAutomaticReconnect()
            .build();

        // Khi đổi quyền/status: bạn muốn logout luôn
        conn.on("ForceRefreshToken", async () => {
            await forceLogout();
        });

        // (OPTION) nếu sau này backend có event ForceLogout riêng:
        // conn.on("ForceLogout", async (msg?: string) => {
        //   await forceLogout(msg);
        // });

        conn
            .start()
            .then(() => console.log("SignalR Connected!"))
            .catch((err) => console.error("SignalR Connection Error:", err));

        connectionRef.current = conn;

        return () => {
            connectionRef.current?.off("ForceRefreshToken");
            // connectionRef.current?.off("ForceLogout");
            connectionRef.current?.stop();
        };
    }, [forceLogout]);

    return null;
};
