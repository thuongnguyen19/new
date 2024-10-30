import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Badge, message, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CopyOutlined } from "@ant-design/icons";

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
        // Fetch vouchers list from API
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

    // Handle "Use Now" button click
    const handleUseNow = () => {
        message.info("Chọn mặt hàng để thanh toán");
        navigate("/cart"); // Navigate to cart page
    };

    // Handle copying voucher code to clipboard
    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        message.success("Đã sao chép mã giảm giá!");
    };

    return (
        <div style={{ padding: "20px" }}>
            <Row gutter={[16, 16]}>
                {vouchers.map((voucher) => (
                    <Col xs={24} sm={12} md={8} key={voucher.code}>
                        <Card
                            title={
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Badge.Ribbon
                                        text="Số lượng có hạn"
                                        color="red"
                                    />
                                    <Tooltip title="Sao chép mã">
                                        <span
                                            style={{
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                color: "blue",
                                            }}
                                            onClick={() =>
                                                handleCopyCode(voucher.code)
                                            }
                                        >
                                            {voucher.code}{" "}
                                            <CopyOutlined
                                                style={{ marginLeft: 5 }}
                                            />
                                        </span>
                                    </Tooltip>
                                </div>
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
