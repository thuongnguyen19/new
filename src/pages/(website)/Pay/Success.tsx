import React, { useEffect, useState } from "react";
import { message } from "antd";
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
        // Lấy token từ localStorage
        const token = localStorage.getItem("authToken");
        if (!token) {
            message.error("Bạn chưa đăng nhập.");
            return;
        }

        // Lấy các tham số từ URL
        const params = new URLSearchParams(window.location.search);
        const vnp_TxnRef = params.get("vnp_TxnRef"); // Mã giao dịch
        const vnp_ResponseCode = params.get("vnp_ResponseCode"); // Mã phản hồi thanh toán

        // Hàm cập nhật trạng thái thanh toán
        const updatePaymentStatus = async (txnRef: string) => {
            try {
                const response = await axios.put(
                    "http://localhost:8000/api/updatePaymentStatus",
                    {
                        vnp_TxnRef: txnRef,
                        status_payment: 2, // Đặt trạng thái thanh toán thành 2
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Thêm token vào header
                        },
                    },
                );
                console.log("Cập nhật trạng thái thanh toán:", response.data);
            } catch (error) {
                console.error("Cập nhật trạng thái thất bại:", error);
            }
        };

        // Hàm xử lý kết quả thanh toán từ VNPay
        const fetchPaymentResult = async () => {
            if (vnp_TxnRef && vnp_ResponseCode === "00") {
                // Kiểm tra mã giao dịch và mã phản hồi
                try {
                    const response = await axios.get(
                        "http://localhost:8000/api/paymentResult",
                        {
                            params: {
                                vnp_TxnRef, // Mã giao dịch
                                vnp_ResponseCode, // Mã phản hồi thanh toán
                            },
                            headers: {
                                Authorization: `Bearer ${token}`, // Thêm token vào header
                            },
                        },
                    );

                    if (response.data.status) {
                        setStatus(true);
                        setMessageText(
                            response.data.message || "Đặt hàng thành công!",
                        );
                        await updatePaymentStatus(vnp_TxnRef); // Cập nhật trạng thái thanh toán
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
        return <div>Loading...</div>;
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
                                                    : "https://imgur.com/failed.jpg"
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
