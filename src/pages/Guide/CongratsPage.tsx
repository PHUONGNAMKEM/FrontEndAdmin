import { Button, Result } from "antd"

export const CongratsPage = () => {
    return (
        <div>
            <Result
                status="success"
                title="Congratulation! Successfully Changed Password"
                subTitle="Hiện tại giao diện WEB không hỗ trợ cho nhân viên. Vui lòng follow tài liệu sau để truy cập app di động: https://huongdantruycap.mobile"
                extra={[
                    <Button type="primary" key="console">
                        Follow up
                    </Button>,
                ]}
            />
            <div className="text-xl text-center tutorial-mobile-app">

                <p>Bước 1: Tải app</p>
                <p>Bước 2: Đăng nhập....</p>
            </div>
        </div>
    );

}