import { useEffect, useState } from "react";
import { fetchOrders, Order } from "../../../Interface/Order";
import { useNavigate, useParams } from "react-router-dom";
import { Input, message, Modal } from "antd";
import axiosInstance from "../../../configs/axios";

const Od_Detail = () => {
    // State để theo dõi tab hiện tại
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState("details"); // Mặc định là 'details'

    // Hàm để chuyển tab
    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
    };

    const orderStatusMap: { [key: number]: string } = {
        1: "Đang chờ xác nhận",
        2: "Đã xác nhận",
        3: "Đang giao hàng",
        4: "Giao hàng thành công",
        5: "Giao hàng thất bại",
        6: "Hoàn thành",
        7: "Đã hủy",
    };

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState<number | null>(null); // Lưu id của đơn hàng cần hủy
    const [cancelReason, setCancelReason] = useState<string>(""); // Lý do hủy đơn hàng
    const perPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            message.error("Bạn chưa đăng nhập.");
            navigate("/login");
            return;
        }

        // Gọi API lấy danh sách đơn hàng
        const loadOrderDetails = async () => {
            try {
                const { data, total_pages } = await fetchOrders(page, perPage);
                const a = data.filter((order) => order.id == Number(id));
                setOrders(a);
                setLoading(false);
                setTotalPages(total_pages);
            } catch (err) {
                setError("Lỗi khi tải danh sách đơn hàng");
                setLoading(false);
            }
        };

        loadOrderDetails();
    }, [navigate, id, page, perPage]);

    // Hàm hiển thị modal và lưu id đơn hàng cần hủy
    const showCancelModal = (orderId: number) => {
        setCancelOrderId(orderId);
        setIsModalVisible(true);
    };

    // Hàm hủy đơn hàng
    const handleCancelOrder = async () => {
        if (!cancelOrderId) {
            message.error("Đơn hàng không hợp lệ.");
            return;
        }

        // Kiểm tra nếu lý do hủy đơn hàng trống
        if (!cancelReason.trim()) {
            message.error("Lý do hủy không được để trống.");
            return;
        }

        try {
            const token = localStorage.getItem("authToken"); // Lấy token từ localStorage
            if (!token) {
                message.error("Bạn chưa đăng nhập.");
                return;
            }
            // Gọi API GET để hủy đơn hàng với `cancel_id`
            const response = await axiosInstance.get(`/purchasedOrders`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Gửi token trong headers
                },
                params: {
                    cancel_id: cancelOrderId, // Truyền cancel_id lên API
                    note: cancelReason, // Không bắt buộc gửi note, chỉ kiểm tra
                },
            });

            message.success(
                response.data.message || "Đơn hàng đã hủy thành công.",
            );
            setIsModalVisible(false);
            setCancelReason(""); // Xóa lý do đã nhập
        } catch (error) {
            message.error("Không thể hủy đơn hàng.");
        }
    };

    // Hàm xử lý khi người dùng nhập lý do hủy
    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCancelReason(e.target.value);
    };

    // Hàm xử lý khi người dùng nhấn nút xác nhận
    const handleConfirmReceived = async (orderId: number) => {
        try {
            const token = localStorage.getItem("authToken"); // Lấy token từ localStorage
            if (!token) {
                message.error("Bạn chưa đăng nhập.");
                return;
            }
            const response = await axiosInstance.get("/purchasedOrders", {
                params: {
                    complete_id: orderId,
                },
                headers: {
                    Authorization: `Bearer ${token}`, // Gửi token trong headers
                },
            });

            if (response.status === 200) {
                message.success(response.data.message);

                // Cập nhật trạng thái đơn hàng trong state
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id === orderId
                            ? { ...order, status: "6" }
                            : order,
                    ),
                );
            } else {
                message.error("Có lỗi xảy ra khi xác nhận đơn hàng.");
            }
        } catch (error) {
            message.error("Không thể kết nối với server.");
        }
    };

    // Hàm tính tổng giá trị đơn hàng
    const calculateTotalPrice = (order: Order) => {
        return order.order_detail.reduce((total, item) => {
            return total + item.selling_price * item.quantity;
        }, 0);
    };

    if (loading) {
        return <p>Đang tải trang...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <>
            <section className="flat-spacing-11">
                <div className="col-lg-15">
                    {orders.map((order) => (
                        <div className="wd-form-order">
                            <div className="order-head">
                                <figure className="img-product">
                                    <img
                                        src={
                                            order.order_detail[0]?.product_image
                                        }
                                        alt={
                                            order.order_detail[0]?.product_name
                                        }
                                    />
                                </figure>
                                <div className="content">
                                    {/* <div className="badge">Đang giao hàng</div> */}
                                    <h6 className="mt-2 fw-5">
                                        Đơn hàng #{order.id}
                                    </h6>
                                </div>
                            </div>
                            <div className="tf-grid-layout md-col-2 gap-15">
                                <div className="item">
                                    <div className="text-2 text_black-2">
                                        Thời gian đặt hàng
                                    </div>
                                    <div className="text-2 mt_4 fw-6">
                                        {order.created_at}
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="text-2 text_black-2">
                                        Họ và tên khách hàng
                                    </div>
                                    <div className="text-2 mt_4 fw-6">
                                        {order.recipient_name}
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="text-2 text_black-2">
                                        Địa chỉ
                                    </div>
                                    <div className="text-2 mt_4 fw-6">
                                        {order.recipient_address}
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="text-2 text_black-2">
                                        Số điện thoại
                                    </div>
                                    <div className="text-2 mt_4 fw-6">
                                        {order.phone_number}
                                    </div>
                                </div>
                            </div>
                            <div className="widget-tabs style-has-border widget-order-tab">
                                <ul className="widget-menu-tab">
                                    {/* Tab Chi tiết đơn hàng */}
                                    <li
                                        className={`item-title ${activeTab === "details" ? "active" : ""}`}
                                        onClick={() =>
                                            handleTabClick("details")
                                        }
                                    >
                                        <span className="inner">
                                            Chi tiết đơn hàng
                                        </span>
                                    </li>

                                    {/* Tab Lịch sử đơn hàng */}
                                    <li
                                        className={`item-title ${activeTab === "history" ? "active" : ""}`}
                                        onClick={() =>
                                            handleTabClick("history")
                                        }
                                    >
                                        <span className="inner">
                                            Lịch sử đơn hàng
                                        </span>
                                    </li>
                                </ul>

                                <div className="widget-content-tab">
                                    {/* Nội dung tab Chi tiết đơn hàng */}
                                    {activeTab === "details" && (
                                        <div className="widget-content-inner active">
                                            {order.order_detail.map((item) => (
                                                <div
                                                    className="order-head"
                                                    key={item.id}
                                                >
                                                    <div
                                                        className="product-details-container"
                                                        style={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "center",
                                                        }}
                                                    >
                                                        {/* Phần thông tin sản phẩm */}
                                                        <div
                                                            className="product-info"
                                                            style={{
                                                                display: "flex",
                                                            }}
                                                        >
                                                            <figure
                                                                className="img-product"
                                                                style={{
                                                                    marginRight:
                                                                        "15px",
                                                                }}
                                                            >
                                                                <img
                                                                    src={
                                                                        item.product_image
                                                                    }
                                                                    alt={
                                                                        item.product_name
                                                                    }
                                                                    style={{
                                                                        width: "100px",
                                                                        height: "100px",
                                                                        objectFit:
                                                                            "cover",
                                                                    }}
                                                                />
                                                            </figure>
                                                            <div className="content">
                                                                <div className="text-2 fw-6">
                                                                    {
                                                                        item.product_name
                                                                    }
                                                                </div>
                                                                <div className="mt_4">
                                                                    <span className="fw-6">
                                                                        Màu sắc:
                                                                    </span>{" "}
                                                                    {
                                                                        item
                                                                            .product_variant
                                                                            .color
                                                                            .name
                                                                    }
                                                                </div>
                                                                <div className="mt_4">
                                                                    <span className="fw-6">
                                                                        Kích
                                                                        thước:
                                                                    </span>{" "}
                                                                    {
                                                                        item
                                                                            .product_variant
                                                                            .size
                                                                            .name
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Phần giá và số lượng */}
                                                        <div
                                                            className="product-price-quantity"
                                                            style={{
                                                                textAlign:
                                                                    "right",
                                                            }}
                                                        >
                                                            <div
                                                                className="quantity"
                                                                style={{
                                                                    marginBottom:
                                                                        "8px",
                                                                    fontWeight:
                                                                        "bold",
                                                                }}
                                                            >
                                                                x{item.quantity}
                                                            </div>
                                                            <div className="price">
                                                                <span
                                                                    style={{
                                                                        color: "red",
                                                                        fontSize:
                                                                            "15px",
                                                                        fontWeight:
                                                                            "bold",
                                                                    }}
                                                                >
                                                                    {new Intl.NumberFormat(
                                                                        "vi-VN",
                                                                        {
                                                                            style: "currency",
                                                                            currency:
                                                                                "VND",
                                                                        },
                                                                    ).format(
                                                                        item.selling_price,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div
                                                className="total-price"
                                                style={{ textAlign: "right" }}
                                            >
                                                Tổng tiền:
                                                <span
                                                    style={{
                                                        color: "red",
                                                        fontSize: "15px",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {new Intl.NumberFormat(
                                                        "vi-VN",
                                                        {
                                                            style: "currency",
                                                            currency: "VND",
                                                        },
                                                    ).format(
                                                        calculateTotalPrice(
                                                            order,
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Nội dung tab Lịch sử đơn hàng */}
                                    {activeTab === "history" && (
                                        <div className="widget-content-tab">
                                            {/* Nội dung tab Lịch sử đơn hàng */}
                                            {activeTab === "history" && (
                                                <div className="widget-content-inner active">
                                                    <div className="widget-timeline">
                                                        <ul className="timeline">
                                                            {/* Kiểm tra nếu đơn hàng đã bị hủy */}
                                                            {Number(
                                                                order.status,
                                                            ) === 7 ? (
                                                                // Khi đơn hàng bị hủy, chỉ hiển thị trạng thái "Đã hủy"
                                                                <li>
                                                                    <div className="timeline-badge success"></div>
                                                                    <div className="timeline-box">
                                                                        <a
                                                                            className="timeline-panel"
                                                                            href="javascript:void(0);"
                                                                        >
                                                                            <div
                                                                                className="text-2 fw-6"
                                                                                style={{
                                                                                    color: "green",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    orderStatusMap[7]
                                                                                }
                                                                            </div>
                                                                            <span>
                                                                                {
                                                                                    order.updated_at
                                                                                }
                                                                            </span>
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            ) : (
                                                                // Khi đơn hàng chưa bị hủy, hiển thị các trạng thái bình thường
                                                                Object.keys(
                                                                    orderStatusMap,
                                                                ).map((key) => {
                                                                    const statusKey =
                                                                        Number(
                                                                            key,
                                                                        );
                                                                    const currentStatus =
                                                                        Number(
                                                                            order.status,
                                                                        );

                                                                    // Không hiển thị trạng thái "Đã hủy" (7) nếu đơn hàng chưa bị hủy
                                                                    if (
                                                                        statusKey ===
                                                                        7
                                                                    )
                                                                        return null;

                                                                    // Ẩn trạng thái "Giao hàng thất bại" (5) trừ khi status từ backend là 5
                                                                    if (
                                                                        statusKey ===
                                                                            5 &&
                                                                        currentStatus !==
                                                                            5
                                                                    )
                                                                        return null;

                                                                    // Ẩn "Giao hàng thành công" (4) và "Hoàn thành" (6) khi có "Giao hàng thất bại" (5)
                                                                    if (
                                                                        currentStatus ===
                                                                            5 &&
                                                                        (statusKey ===
                                                                            4 ||
                                                                            statusKey ===
                                                                                6)
                                                                    )
                                                                        return null;

                                                                    const isCompleted =
                                                                        statusKey <=
                                                                        currentStatus;

                                                                    return (
                                                                        <li
                                                                            key={
                                                                                statusKey
                                                                            }
                                                                        >
                                                                            <div
                                                                                className={`timeline-badge ${isCompleted ? "success" : ""}`}
                                                                            ></div>
                                                                            <div className="timeline-box">
                                                                                <a
                                                                                    className="timeline-panel"
                                                                                    href="javascript:void(0);"
                                                                                >
                                                                                    <div
                                                                                        className="text-2 fw-6"
                                                                                        style={{
                                                                                            color: isCompleted
                                                                                                ? "green"
                                                                                                : "gray", // Màu cho trạng thái đã hoàn thành
                                                                                        }}
                                                                                    >
                                                                                        {
                                                                                            orderStatusMap[
                                                                                                statusKey
                                                                                            ]
                                                                                        }
                                                                                    </div>
                                                                                    {isCompleted && (
                                                                                        <span>
                                                                                            {
                                                                                                order.updated_at
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                                </a>
                                                                            </div>
                                                                        </li>
                                                                    );
                                                                })
                                                            )}

                                                            {/* Nút hủy đơn chỉ hiện khi trạng thái là "Đang chờ xác nhận" */}
                                                            {Number(
                                                                order.status,
                                                            ) === 1 && (
                                                                <div
                                                                    style={{
                                                                        textAlign:
                                                                            "right",
                                                                        marginTop:
                                                                            "10px",
                                                                    }}
                                                                >
                                                                    <a
                                                                        className="view-btn"
                                                                        style={{
                                                                            backgroundColor:
                                                                                "black",
                                                                            color: "white",
                                                                            padding:
                                                                                "10px",
                                                                            cursor: "pointer",
                                                                            width: "120px",
                                                                            display:
                                                                                "inline-block",
                                                                            textAlign:
                                                                                "center",
                                                                        }}
                                                                        onClick={() =>
                                                                            showCancelModal(
                                                                                order.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Hủy đơn
                                                                        hàng
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {/* Nút xác nhận chỉ hiện khi trạng thái là "Giao hàng thành công" */}
                                                            {Number(
                                                                order.status,
                                                            ) === 4 && (
                                                                <div
                                                                    style={{
                                                                        textAlign:
                                                                            "right",
                                                                        marginTop:
                                                                            "10px",
                                                                    }}
                                                                >
                                                                    <a
                                                                        className="view-btn"
                                                                        style={{
                                                                            backgroundColor:
                                                                                "black",
                                                                            color: "white",
                                                                            padding:
                                                                                "10px",
                                                                            cursor: "pointer",
                                                                            width: "120px",
                                                                            display:
                                                                                "inline-block",
                                                                            textAlign:
                                                                                "center",
                                                                        }}
                                                                        onClick={() =>
                                                                            handleConfirmReceived(
                                                                                order.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Đã nhận
                                                                        được
                                                                        hàng
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </ul>

                                                        {/* Modal hủy đơn hàng */}
                                                        <Modal
                                                            title="Lý do hủy đơn hàng"
                                                            open={
                                                                isModalVisible
                                                            }
                                                            onOk={
                                                                handleCancelOrder
                                                            }
                                                            onCancel={() =>
                                                                setIsModalVisible(
                                                                    false,
                                                                )
                                                            }
                                                            okText="Xác nhận"
                                                            cancelText="Hủy"
                                                        >
                                                            <Input.TextArea
                                                                value={
                                                                    cancelReason
                                                                }
                                                                onChange={
                                                                    handleReasonChange
                                                                }
                                                                placeholder="Nhập lý do hủy đơn hàng"
                                                                rows={4}
                                                            />
                                                        </Modal>
                                                    </div>
                                                </div>
                                            )}
                                            <Modal
                                                title="Lý do hủy đơn hàng"
                                                open={isModalVisible}
                                                onOk={handleCancelOrder}
                                                onCancel={() =>
                                                    setIsModalVisible(false)
                                                }
                                                okText="Xác nhận"
                                                cancelText="Hủy"
                                            >
                                                <Input.TextArea
                                                    value={cancelReason}
                                                    onChange={
                                                        handleReasonChange
                                                    }
                                                    placeholder="Nhập lý do hủy đơn hàng"
                                                    rows={4}
                                                />
                                            </Modal>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default Od_Detail;
