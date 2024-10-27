import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Badge, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Voucher {
    code: string;
    description: string | null;
    start_date: string;
    end_date: string;
    usage_count: number | null;
}

const Coupons = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Gọi API để lấy danh sách voucher
        const fetchVouchers = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/vouchers/list",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        },
                    },
                );
                if (response.data.status === "success") {
                    setVouchers(response.data.data);
                } else {
                    message.error("Không thể lấy danh sách voucher.");
                }
            } catch (error) {
                message.error("Đã xảy ra lỗi khi lấy danh sách voucher.");
            }
        };

        fetchVouchers();
    }, []);

    // Hàm xử lý khi nhấn "Dùng ngay"
    const handleUseNow = () => {
        message.info("Chọn mặt hàng để thanh toán");
        navigate("/cart"); // Điều hướng đến trang giỏ hàng
    };

    return (
        <div style={{ padding: "20px" }}>
            <Row gutter={[16, 16]}>
                {vouchers.map((voucher) => (
                    <Col xs={24} sm={12} md={8} key={voucher.code}>
                        <Card
                            title={
                                <Badge.Ribbon
                                    text="Số lượng có hạn"
                                    color="red"
                                />
                            }
                            bordered={false}
                            style={{ borderRadius: "10px", overflow: "hidden" }}
                            extra={
                                <img
                                    src="https://img.lovepik.com/free_png/28/92/96/91b58PICGrVA8cIbCH73m_PIC2018.png_860.png"
                                    alt="Shopee"
                                    style={{ width: "40px" }}
                                />
                            }
                        >
                            <p>
                                <strong>
                                    {voucher.description || "Mã giảm giá"}
                                </strong>
                            </p>
                            <p>Có hiệu lực từ: {voucher.start_date}</p>
                            <p>Hết hạn: {voucher.end_date}</p>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <span
                                    style={{ color: "red", cursor: "pointer" }}
                                    onClick={handleUseNow}
                                >
                                    Dùng ngay
                                </span>
                                </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Coupons;
