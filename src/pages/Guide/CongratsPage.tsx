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
                    {/* <p>Bước 1: Truy cập vào đường link: {<Link to="https://huongdantruycap.mobile">https://huongdantruycap.mobile</Link>}</p> */}
                    <div className="max-w-md mx-auto">
                        <div className="p-5 bg-white border shadow-sm rounded-2xl border-slate-200">
                            <div className="flex items-start gap-3">

                                <div className="flex-1">
                                    <p className="text-base font-semibold text-slate-900">
                                        Bước 1: Quét QR code
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Dùng camera điện thoại hoặc Zalo để quét.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-center mt-4">
                                <div className="p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200">
                                    <img
                                        className="object-contain w-56 h-56 rounded-lg"
                                        src="/images/qrMobile.jpg"
                                        alt="QR Code"
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-center text-slate-500">
                                Nếu không quét được, hãy tăng độ sáng màn hình hoặc phóng to QR.
                            </div>
                        </div>
                    </div>
                    <p>Bước 2: Đăng nhập tài khoản nhân viên của bạn</p>
                    <p>Bước 3: Tận hưởng công việc theo phong cách riêng của bạn</p>
                </div>
            </div>
        </div>
    );

}