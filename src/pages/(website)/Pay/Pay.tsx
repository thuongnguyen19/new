import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import axios from "axios";

// Interface cho CartItem
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

const Pay: React.FC = () => {
    const [paymentProducts, setPaymentProducts] = useState<CartItem[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [paymentRole, setPaymentRole] = useState<number | null>(null);

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
                } else {
                    message.error(response.data.message);
                }
            } catch (error) {
                message.error("Có lỗi xảy ra khi lấy thông tin sản phẩm.");
            } finally {
                setLoading(false);
            }
        };

        fetchInformationOrder();
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

    const handlePaymentChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setPaymentRole(Number(event.target.value));
    };

    const handleOrder = async () => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            message.error("Bạn chưa đăng nhập.");
            navigate("/login");
            return;
        }

        if (!validateForm()) {
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
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Header />
            <div>
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
                                    <div className="box grid-2">
                                        <fieldset className="fieldset">
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
                                    </div>
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
                                        {/* Thông tin sản phẩm */}
                                        <table
                                            style={{
                                                width: "100%",
                                                borderCollapse: "collapse",
                                            }}
                                        >
                                            {/* Table head */}
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
                                            {/* Table body */}
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
                                        <br />
                                        <div className="d-flex justify-content-between line pb_20">
                                            <h6 className="fw-5">Tổng tiền</h6>
                                            <h6 className="total fw-5">
                                                {totalAmount.toLocaleString(
                                                    "vi-VN",
                                                )}{" "}
                                                VND
                                            </h6>
                                        </div>
                                    </div>

                                    <div className="wd-check-payment">
                                        <div className="fieldset-radio mb_20">
                                            <input
                                                type="radio"
                                                name="payment"
                                                id="bank"
                                                className="tf-check"
                                                value="2"
                                                onChange={handlePaymentChange}
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
                                                onChange={handlePaymentChange}
                                            />
                                            <label htmlFor="delivery">
                                                Thanh toán khi nhận hàng
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        className="tf-btn radius-3 btn-fill btn-icon animate-hover-btn justify-content-center"
                                        onClick={handleOrder}
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
        </>
    );
};

export default Pay;
