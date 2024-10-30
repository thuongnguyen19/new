import React, { useEffect, useState } from "react";
import {
    Card,
    Row,
    Col,
    Button,
    Badge,
    Modal,
    message,
    Spin,
    Input,
    Form,
    Radio,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import axios from "axios";

// Interface cho CartItem và Voucher
interface CartItem {
    id: number;
    quantity: number;
    variant: {
        id: number;
        import_price: string;
        list_price: string;
        selling_price: string;
        quantity: number;
        product: {
            id: number;
            name: string;
        };
        image_color: string;
        color: {
            id: number;
            name: string;
        };
        size: {
            id: number;
            name: string;
        };
    } | null;
}

interface Voucher {
    code: string;
    description: string | null;
    start_date: string;
    end_date: string;
    usage_count: number | null;
}

const Pay: React.FC = () => {
    const [paymentProducts, setPaymentProducts] = useState<CartItem[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [originalTotalAmount, setOriginalTotalAmount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOrderLoading, setIsOrderLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [paymentRole, setPaymentRole] = useState<number | null>(null);
    const [discountCode, setDiscountCode] = useState<string>("");
    const [voucherId, setVoucherId] = useState<number | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [discount, setDiscount] = useState<number>(0);
    const [isDiscountApplied, setIsDiscountApplied] = useState<boolean>(false);
    const [pointsToUse, setPointsToUse] = useState<number>(0);
    const [discountLoading, setDiscountLoading] = useState<boolean>(false);
    const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
    const [discountError, setDiscountError] = useState<string>("");

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            message.error("Bạn chưa đăng nhập.");
            navigate("/login");
            return;
        }

        const cartIds = location.state?.cartIds || [];
        const variantId = location.state?.variantId || null;
        const quantity = location.state?.quantity || null;

        if (cartIds.length === 0 && !variantId) {
            message.error("Không có sản phẩm nào được chọn.");
            navigate("/cart");
            return;
        }

        const fetchInformationOrder = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/listInformationOrder",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: variantId
                            ? { variantId, quantity }
                            : { cartIds },
                    },
                );

                if (response.data.status) {
                    const { productpayment, totalAmount, user } =
                        response.data.data;

                    if (user) {
                        setName(user.name || "");
                        setEmail(user.email || "");
                        setPhoneNumber(user.phone_number || "");
                        setAddress(user.address || "");
                    }

                    setPaymentProducts(productpayment);
                    setTotalAmount(totalAmount);
                    setOriginalTotalAmount(totalAmount);
                } else {
                    message.error(response.data.message);
                }
            } catch (error) {
                message.error("Có lỗi xảy ra khi lấy thông tin sản phẩm.");
            } finally {
                setLoading(false);
            }
        };

        const fetchAvailableVouchers = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/vouchers/list",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (response.data.status) {
                    setAvailableVouchers(response.data.data); // Giả sử dữ liệu voucher nằm trong response.data.data
                } else {
                    message.error("Không thể lấy danh sách voucher.");
                }
            } catch (error) {
                message.error("Có lỗi xảy ra khi lấy danh sách voucher.");
            }
        };

        fetchInformationOrder();
        fetchAvailableVouchers(); // Gọi hàm để lấy danh sách voucher
    }, [location.state, navigate]);

    const validateForm = () => {
        const phoneRegex = /^(0|\+84)[35789]\d{8}$/;
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

        if (!name.trim()) {
            message.error("Họ và tên không được để trống");
            return false;
        }

        if (!emailRegex.test(email)) {
            message.error("Email không hợp lệ");
            return false;
        }

        if (!phoneRegex.test(phoneNumber)) {
            message.error(
                "Số điện thoại phải là số hợp lệ của Việt Nam (10 số)",
            );
            return false;
        }

        if (!address.trim()) {
            message.error("Địa chỉ không được để trống");
            return false;
        }

        if (paymentRole === null) {
            message.error("Vui lòng chọn phương thức thanh toán.");
            return false;
        }

        return true;
    };





    

    // Xóa các phần liên quan đến mã giảm giá và chỉ giữ lại logic áp dụng điểm
    const handlePointsApply = () => {
        const pointsDiscount = pointsToUse * 1000; // Quy đổi điểm thành VND
        const discountedTotal = originalTotalAmount - pointsDiscount;

        if (discountedTotal >= 0) {
            setTotalAmount(discountedTotal); // Cập nhật tổng số tiền sau khi áp dụng điểm tích lũy
            message.success("Điểm tích lũy đã được áp dụng.");
        } else {
            message.error("Số điểm nhập vượt quá số tiền cần thanh toán.");
        }
    };








    const handleDiscountCodeChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const newDiscountCode = e.target.value;
        setDiscountCode(newDiscountCode);
        setDiscountError(""); // Xóa lỗi khi người dùng thay đổi mã

        if (!newDiscountCode.trim() || newDiscountCode !== discountCode) {
            setTotalAmount(originalTotalAmount - pointsToUse * 1000);
            setIsDiscountApplied(false);
            setVoucherId(null);
            setDiscount(0);
        }
    };

    const applyDiscount = async (code: string) => {
        setDiscountLoading(true);
        setDiscountError("");
        const token = localStorage.getItem("authToken");

        if (!code.trim()) {
            setDiscountError(
                "Mã giảm giá không hợp lệ. Vui lòng nhập mã khác.",
            );
            setDiscountLoading(false);
            setTotalAmount(originalTotalAmount - pointsToUse * 1000);
            setTotalAmount(originalTotalAmount);
            return;
        }

        const userString = localStorage.getItem("user");
        if (!userString) {
            message.error("Không tìm thấy thông tin người dùng.");
            setDiscountLoading(false);
            setTotalAmount(originalTotalAmount - pointsToUse * 1000);
            return;
        }

        const user = JSON.parse(userString);
        const userId = user.id;

        try {
            const response = await axios.post(
                "http://localhost:8000/api/vouchers/apply",
                {
                    voucher_code: discountCode,
                    order_amount: originalTotalAmount - pointsToUse * 1000,
                    user_id: userId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.data.status) {
                const { voucherId, discount, final_amount } =
                    response.data.data;
                setVoucherId(voucherId);
                setDiscount(discount);
                setTotalAmount(final_amount - pointsToUse * 1000);
                setIsDiscountApplied(true);
                   setDiscountCode(code); 
                message.success("Mã giảm giá đã được áp dụng thành công.");
            } else {
                setDiscountError("Mã không tồn tại hoặc không đủ điều kiện.");
                setTotalAmount(originalTotalAmount - pointsToUse * 1000);
                setIsDiscountApplied(false);
                setVoucherId(null);
                setDiscount(0);
            }
        } catch (error) {
            setDiscountError("Có lỗi xảy ra khi áp dụng mã giảm giá.");
            setTotalAmount(originalTotalAmount - pointsToUse * 1000);
            setIsDiscountApplied(false);
            setVoucherId(null);
            setDiscount(0);
        } finally {
            setDiscountLoading(false);
        }
    };

    const handleOrder = async () => {
        setIsOrderLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token) {
            message.error("Bạn chưa đăng nhập.");
            navigate("/login");
            setIsOrderLoading(false);
            return;
        }

        if (!validateForm()) {
            setIsOrderLoading(false);
            return;
        }

        const orderData = {
            cartIds: location.state?.cartIds || [],
            variantId: location.state?.variantId || null,
            quantity: location.state?.quantity || null,
            recipient_name: name,
            email: email,
            phone_number: phoneNumber,
            recipient_address: address,
            note: (document.getElementById("note") as HTMLTextAreaElement)
                ?.value,
            total_payment: totalAmount,
            payment_role: paymentRole,
            discount_code: discountCode,
            voucherId: voucherId || null,
            used_accum: pointsToUse,
        };

        try {
            const response = await axios.post(
                "http://localhost:8000/api/payment",
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.data.status) {
                message.success("Đặt hàng thành công!");
                if (paymentRole === 1) {
                    navigate("/success");
                } else if (paymentRole === 2 && response.data.data) {
                    window.location.href = response.data.data;
                }
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error("Đã xảy ra lỗi trong quá trình đặt hàng.");
        } finally {
            setIsOrderLoading(false);
        }
    };

    const selectCoupon = (voucherCode: string) => {
        const selectedVoucher = availableVouchers.find(
            (v) => v.code === voucherCode,
        );
        if (selectedVoucher) {
            setDiscountCode(selectedVoucher.code); // Cập nhật discountCode
            setVoucherId(voucherId); // Cập nhật voucherId
            applyDiscount(voucherCode);
            setDiscountError(""); // Xóa lỗi khi người dùng chọn voucher
            const discountedTotal = originalTotalAmount - pointsToUse * 1000;
            setTotalAmount(discountedTotal);
            setIsModalVisible(false); // Đóng modal sau khi chọn voucher
        }
    };

    return (
        <>
            <Header />
            <div style={{ position: "relative" }}>
                {/* Overlay Spinner */}
                {isOrderLoading && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                            zIndex: 1000,
                        }}
                    >
                        <Spin size="large" />
                    </div>
                )}

                {/* Nội dung trang */}
                <div className="tf-page-title">
                    <div className="container-full">
                        <div className="heading text-center">Thanh Toán</div>
                    </div>
                </div>
                <section className="flat-spacing-11">
                    <div className="container">
                        <div className="tf-page-cart-wrap layout-2">
                            <div className="tf-page-cart-item">
                                <h5 className="fw-5 mb_20">
                                    Chi tiết thanh toán
                                </h5>
                                <form className="form-checkout">
                                    <fieldset className="box fieldset">
                                        <label htmlFor="first-name">
                                            Họ Và Tên
                                        </label>
                                        <input
                                            type="text"
                                            id="first-name"
                                            placeholder="Nguyễn Văn A"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                        />
                                    </fieldset>
                                    <fieldset className="box fieldset">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                        />
                                    </fieldset>
                                    <fieldset className="box fieldset">
                                        <label htmlFor="phonenumber">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="text"
                                            id="phonenumber"
                                            value={phoneNumber}
                                            onChange={(e) =>
                                                setPhoneNumber(e.target.value)
                                            }
                                        />
                                    </fieldset>
                                    <fieldset className="box fieldset">
                                        <label htmlFor="address">Địa chỉ</label>
                                        <input
                                            type="text"
                                            id="address"
                                            value={address}
                                            onChange={(e) =>
                                                setAddress(e.target.value)
                                            }
                                        />
                                    </fieldset>
                                    <fieldset className="box fieldset">
                                        <label htmlFor="note">
                                            Ghi chú đơn hàng (Tuỳ chọn)
                                        </label>
                                        <textarea name="note" id="note" />
                                    </fieldset>
                                </form>
                            </div>

                            <div className="tf-page-cart-footer">
                                <div className="tf-cart-footer-inner">
                                    <h5 className="fw-5 mb_20">
                                        Đơn hàng của bạn
                                    </h5>
                                    <div className="pay-page">
                                        <table
                                            style={{
                                                width: "100%",
                                                borderCollapse: "collapse",
                                            }}
                                        >
                                            {/* Table Headers */}
                                            <thead>
                                                <tr>
                                                    <th
                                                        style={{
                                                            padding: "10px",
                                                            textAlign: "left",
                                                            width: "20%",
                                                        }}
                                                    ></th>
                                                    <th
                                                        style={{
                                                            padding: "10px",
                                                            textAlign: "left",
                                                            width: "30%",
                                                        }}
                                                    >
                                                        Tên
                                                    </th>
                                                    <th
                                                        style={{
                                                            padding: "10px",
                                                            textAlign: "left",
                                                            width: "15%",
                                                        }}
                                                    >
                                                        Màu
                                                    </th>
                                                    <th
                                                        style={{
                                                            padding: "10px",
                                                            textAlign: "left",
                                                            width: "15%",
                                                        }}
                                                    >
                                                        Size
                                                    </th>
                                                    <th
                                                        style={{
                                                            padding: "10px",
                                                            textAlign: "left",
                                                            width: "20%",
                                                        }}
                                                    >
                                                        Giá
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paymentProducts.length > 0 ? (
                                                    paymentProducts.map(
                                                        (item) => (
                                                            <tr key={item.id}>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "10px",
                                                                        verticalAlign:
                                                                            "middle",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={
                                                                            item
                                                                                .variant
                                                                                ?.image_color ||
                                                                            ""
                                                                        }
                                                                        alt={
                                                                            item
                                                                                .variant
                                                                                ?.product
                                                                                ?.name ||
                                                                            "Sản phẩm"
                                                                        }
                                                                        style={{
                                                                            width: "100px",
                                                                            height: "100px",
                                                                            objectFit:
                                                                                "cover",
                                                                            borderRadius:
                                                                                "5px",
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "10px",
                                                                        verticalAlign:
                                                                            "middle",
                                                                    }}
                                                                >
                                                                    <p
                                                                        style={{
                                                                            margin: "0",
                                                                        }}
                                                                    >
                                                                        {item
                                                                            .variant
                                                                            ?.product
                                                                            ?.name ||
                                                                            "Tên sản phẩm không xác định"}
                                                                    </p>
                                                                    <p
                                                                        style={{
                                                                            margin: "0",
                                                                            fontSize:
                                                                                "12px",
                                                                            color: "gray",
                                                                        }}
                                                                    >
                                                                        Số
                                                                        lượng:{" "}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </p>
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "10px",
                                                                        verticalAlign:
                                                                            "middle",
                                                                    }}
                                                                >
                                                                    {item
                                                                        .variant
                                                                        ?.color
                                                                        ?.name ||
                                                                        "Không xác định"}
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "10px",
                                                                        verticalAlign:
                                                                            "middle",
                                                                    }}
                                                                >
                                                                    {item
                                                                        .variant
                                                                        ?.size
                                                                        ?.name ||
                                                                        "Không xác định"}
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "10px",
                                                                        verticalAlign:
                                                                            "middle",
                                                                    }}
                                                                >
                                                                    {parseFloat(
                                                                        item
                                                                            .variant
                                                                            ?.selling_price ||
                                                                            "0",
                                                                    ).toLocaleString(
                                                                        "vi-VN",
                                                                    )}{" "}
                                                                    VND
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={5}
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                                padding: "10px",
                                                            }}
                                                        >
                                                            Không có sản phẩm
                                                            nào trong giỏ hàng.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>

                                        <div style={{ marginTop: "20px" }}>
                                            {/* Ô nhập mã giảm giá */}
                                            <input
                                                type="text"
                                                placeholder="Nhập mã giảm giá"
                                                style={{
                                                    marginRight: "10px",
                                                    padding: "8px",
                                                }}
                                                value={discountCode}
                                                onChange={
                                                    handleDiscountCodeChange
                                                }
                                            />
                                            {discountError && (
                                                <p
                                                    style={{
                                                        color: "red",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {discountError}
                                                </p>
                                            )}
                                            <Button
                                                onClick={() =>
                                                    applyDiscount(discountCode)
                                                }
                                                disabled={discountLoading}
                                                style={{
                                                    marginRight: "10px",
                                                    marginTop: "10px",
                                                    padding: "8px",
                                                    backgroundColor: "#999999",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                {discountLoading ? (
                                                    <Spin size="small" />
                                                ) : (
                                                    "Áp dụng mã"
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    setIsModalVisible(true)
                                                }
                                                style={{
                                                    marginTop: "10px",
                                                    padding: "8px",
                                                    backgroundColor: "#996699",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                Chọn mã giảm giá
                                            </Button>
                                        </div>

                                        {/* Ô nhập điểm tích lũy */}
                                        <div style={{ marginTop: "20px" }}>
                                            <input
                                                type="number"
                                                placeholder="Nhập điểm tích lũy"
                                                style={{
                                                    marginRight: "10px",
                                                    padding: "8px",
                                                }}
                                                value={pointsToUse}
                                                onChange={(e) =>
                                                    setPointsToUse(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                            <Button
                                                onClick={handlePointsApply}
                                                style={{
                                                    marginTop: "10px",
                                                    padding: "8px",
                                                    backgroundColor: "#996699",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                Áp dụng điểm
                                            </Button>
                                        </div>

                                        <div className="d-flex justify-content-between line pb_20">
                                            <h6
                                                className="fw-5"
                                                style={{ marginBottom: "20px" }}
                                            >
                                                Tổng tiền gốc:
                                            </h6>
                                            <h6 className="fw-5">
                                                {originalTotalAmount.toLocaleString(
                                                    "vi-VN",
                                                )}{" "}
                                                VND
                                            </h6>
                                        </div>

                                        {isDiscountApplied && (
                                            <>
                                                <div className="d-flex justify-content-between line pb_20">
                                                    <h6
                                                        className="fw-5"
                                                        style={{
                                                            marginBottom:
                                                                "20px",
                                                        }}
                                                    >
                                                        Giảm giá:
                                                    </h6>
                                                    <h6 className="fw-5">
                                                        -{" "}
                                                        {discount.toLocaleString(
                                                            "vi-VN",
                                                        )}{" "}
                                                        VND
                                                    </h6>
                                                </div>
                                                <div className="d-flex justify-content-between line pb_20">
                                                    <h6
                                                        className="fw-5"
                                                        style={{
                                                            marginBottom:
                                                                "20px",
                                                        }}
                                                    >
                                                        Tổng tiền sau giảm:
                                                    </h6>
                                                    <h6 className="fw-5">
                                                        {totalAmount.toLocaleString(
                                                            "vi-VN",
                                                        )}{" "}
                                                        VND
                                                    </h6>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="wd-check-payment">
                                        <div className="fieldset-radio mb_20">
                                            <input
                                                type="radio"
                                                name="payment"
                                                id="bank"
                                                className="tf-check"
                                                value="2"
                                                onChange={(e) =>
                                                    setPaymentRole(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                            <label htmlFor="bank">
                                                Chuyển khoản ngân hàng trực tiếp
                                            </label>
                                        </div>
                                        <div className="fieldset-radio mb_20">
                                            <input
                                                type="radio"
                                                name="payment"
                                                id="delivery"
                                                className="tf-check"
                                                value="1"
                                                onChange={(e) =>
                                                    setPaymentRole(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                            <label htmlFor="delivery">
                                                Thanh toán khi nhận hàng
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        className="tf-btn radius-3 btn-fill btn-icon animate-hover-btn justify-content-center"
                                        onClick={handleOrder}
                                        disabled={isOrderLoading}
                                    >
                                        Đặt hàng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />

            <Modal
                title="Chọn mã giảm giá"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <div style={{ padding: "20px" }}>
                    <Row gutter={[16, 16]}>
                        {availableVouchers.map((voucher) => (
                            <Col xs={24} sm={12} md={8} key={voucher.code}>
                                <Card
                                    title={
                                        <Badge.Ribbon
                                            text="Có sẵn"
                                            color="blue"
                                        />
                                    }
                                    bordered={false}
                                    style={{
                                        borderRadius: "10px",
                                        overflow: "hidden",
                                    }}
                                >
                                    <p>
                                        <strong>
                                            {voucher.description ||
                                                "Mã giảm giá"}
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
                                        <span style={{ color: "red" }}>
                                            Dùng ngay
                                        </span>
                                        <Button
                                            type="link"
                                            onClick={() =>
                                                selectCoupon(voucher.code)
                                            }
                                        >
                                            Chọn
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Modal>
        </>
    );
};

export default Pay;
