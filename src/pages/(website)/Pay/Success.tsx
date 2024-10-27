import React, { useEffect, useState } from "react";
import { message, Spin } from "antd";
import { useLocation } from "react-router-dom";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import axios from "axios";

const Success: React.FC = () => {
    const [status, setStatus] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [messageText, setMessageText] = useState<string>("");
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            message.error("Bạn chưa đăng nhập.");
            setLoading(false);
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const vnp_TxnRef = params.get("vnp_TxnRef");
        const vnp_ResponseCode = params.get("vnp_ResponseCode");
        const vnp_OrderInfo = params.get("vnp_OrderInfo");

        const fetchPaymentResult = async () => {
            if (vnp_TxnRef && vnp_ResponseCode) {
                try {
                    if (vnp_ResponseCode === "24") {
                        setStatus(false);
                        setMessageText(
                            "Đặt hàng thất bại do bạn chưa hoàn tất thanh toán.",
                        );
                        setLoading(false);
                        return;
                    }

                    const response = await axios.get(
                        "http://localhost:8000/api/paymentResult",
                        {
                            params: {
                                vnp_TxnRef,
                                vnp_ResponseCode,
                                vnp_OrderInfo,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    );

                    if (response.data.status) {
                        setStatus(true);
                        setMessageText(
                            response.data.message || "Đặt hàng thành công!",
                        );

                    
                      
                    } else {
                        setStatus(false);
                        setMessageText(
                            response.data.message || "Đặt hàng thất bại.",
                        );
                    }
                } catch (error) {
                    console.error("Lỗi xử lý thanh toán:", error);
                    message.error("Có lỗi xảy ra khi xử lý thanh toán.");
                    setStatus(false);
                    setMessageText("Thanh toán thất bại.");
                } finally {
                    setLoading(false);
                }
            } else {
                setStatus(true);
                setMessageText("Thanh toán khi nhận hàng thành công!");
                setLoading(false);
            }
        };

        fetchPaymentResult();
    }, [location]);

    if (loading) {
        return (
            <div className="loading-container">
                <Spin tip="Đang xử lý thanh toán..." />
            </div>
        );
    }

    return (
        <>
            <Header />
            <div>
                <div className="tf-page-title">
                    <div className="container-full">
                        <div className="heading text-center">
                            Trạng thái thanh toán
                        </div>
                    </div>
                </div>
                <section className="flat-spacing-11">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-4 col-lg-6 col-md-8">
                                <div className="tf-page-cart-checkout">
                                    <div className="d-flex gap-10 align-items-center mb_20">
                                        <img
                                            src={
                                                status
                                                    ? "https://imgur.com/ZKPE11b.jpg"
                                                    : "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Red_x.svg/1024px-Red_x.svg.png"
                                            }
                                            alt="Trạng thái thanh toán"
                                            width={60}
                                        />
                                        <h5 className="fw-5">
                                            {status
                                                ? "Đặt thành công"
                                                : "Đặt thất bại"}
                                        </h5>
                                    </div>
                                    <p className="mb_20">{messageText}</p>
                                    {status && (
                                        <a
                                            href="/"
                                            className="tf-btn mb_20 w-100 btn-fill animate-hover-btn radius-3 justify-content-center"
                                        >
                                            <span>Tiếp tục mua hàng</span>
                                        </a>
                                    )}
                                    <p>
                                        Mọi thắc mắc vui lòng!{" "}
                                        <a
                                            href="contact-1.html"
                                            className="text_primary"
                                        >
                                            Liên hệ Hỗ trợ
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default Success;
