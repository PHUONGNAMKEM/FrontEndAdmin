import { Button, Result } from "antd"
import { Link } from "react-router-dom";

export const CongratsPage = () => {
    return (
        <div>
            <Result
                className="text-[var(--text-color)]"
                status="success"
                title={<span className="text-[var(--text-color)]">Chúc mừng ! Đã đổi mật khẩu thành công</span>}
                subTitle={<span className="text-[var(--text-color)]">Hiện tại giao diện WEB không hỗ trợ cho nhân viên. Vui lòng follow tài liệu sau để truy cập app di động: <a href="https://huongdantruycap.mobile">https://huongdantruycap.mobile</a></span>}
                extra={[
                    <Button type="primary" key="console">
                        Follow up
                    </Button>,
                ]}
            />
            <div className="flex items-center justify-around text-xl text-center tutorial-mobile-app text-[var(--text-color)]">
                <img src="/images/phone.svg" alt="" className="w-[50%]" />
                <div>
                    <p>Bước 1: Truy cập vào đường link: {<Link to="https://huongdantruycap.mobile">https://huongdantruycap.mobile</Link>}</p>
                    <p>Bước 2: Đăng nhập tài khoản nhân viên của bạn</p>
                    <p>Bước 3: Tận hưởng công việc theo phong cách riêng của bạn</p>
                </div>
            </div>
        </div>
    );

}