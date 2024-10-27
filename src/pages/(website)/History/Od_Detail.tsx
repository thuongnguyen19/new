import { useEffect, useState } from "react";
import {
    fetchOrders,
    Order,
    Review,
    submitReview,
} from "../../../Interface/Order";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, message, Modal, Rate } from "antd";
import axiosInstance from "../../../configs/axios";

const Od_Detail = () => {
    const { id } = useParams<{ id: string }>();

    const orderStatusMap: { [key: number]: string } = {
        1: "Đang chờ xác nhận",
        2: "Đã xác nhận",
        3: "Đang giao hàng",
        4: "Giao hàng thành công",
        5: "Giao hàng thất bại",
        6: "Hoàn thành",
        7: "Đã hủy",
    };

    const paymentRoleMap: { [key: number]: string } = {
        1: "COD",
        2: "VNPay",
        3: "MoMo",
    };

    const statusPaymentMap: { [key: number]: string } = {
        1: "Chưa thanh toán",
        2: "Đã thanh toán",
    };

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const [reviewsState, setReviewsState] = useState<{
        [key: number]: { rating: number; content: string };
    }>({});
    // const [hasReviewed, setHasReviewed] = useState<{ [key: number]: boolean }>({});
    const [selectedProduct, setSelectedProduct] = useState<{
        id_order: number;
        id_product: number;
        id_variant: number;
    } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState<string>("");
    const perPage = 1000;
    const navigate = useNavigate();

    // Chuyển thời gian sang múi giờ +7
    const convertToTimezone = (timeString: string) => {
        const date = new Date(timeString);
        return date.toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            hour12: false, // Hiển thị thời gian 24 giờ
        });
    };

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            message.error("Bạn chưa đăng nhập.");
            navigate("/login");
            return;
        }

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

    const handleReviewCheck = (
        id_order: number,
        id_product: number,
        id_variant: number,
    ) => {
        if (hasReviewed[id_product]) {
            message.warning("Bạn chỉ có thể đánh giá sản phẩm một lần.");
        } else {
            setSelectedProduct({ id_order, id_product, id_variant }); // include id_variant
            setIsReviewModalVisible(true);
        }
    };

    // Khởi tạo `hasReviewed` với dữ liệu từ `localStorage` nếu có
    const [hasReviewed, setHasReviewed] = useState<{ [key: number]: boolean }>(
        () => {
            const saved = localStorage.getItem("hasReviewed");
            return saved ? JSON.parse(saved) : {};
        },
    );

    // Sau khi gửi đánh giá thành công
    const handleOk = async () => {
        if (selectedProduct && reviewsState[selectedProduct.id_product]) {
            const { id_order, id_product, id_variant } = selectedProduct;
            const { content, rating } = reviewsState[id_product];

            if (!content || rating === 0) {
                message.error("Vui lòng cung cấp đầy đủ thông tin đánh giá.");
                return;
            }

            try {
                await submitReview(
                    id_order,
                    id_variant,
                    id_product,
                    content,
                    rating,
                );
                setReviews((prev) =>
                    prev
                        ? [...prev, { id_product, content, rating, id_variant }]
                        : [{ id_product, content, rating, id_variant }],
                );

                // Cập nhật `hasReviewed` trong state và `localStorage`
                setHasReviewed((prev) => {
                    const updated = { ...prev, [id_variant]: true };
                    localStorage.setItem(
                        "hasReviewed",
                        JSON.stringify(updated),
                    );
                    return updated;
                });

                message.success("Đánh giá của bạn đã được gửi thành công!");
                setIsReviewModalVisible(false);
            } catch (error) {
                message.error("Lỗi khi gửi đánh giá.");
            }
        }
    };

    const handleCancel = () => {
        setIsReviewModalVisible(false);
    };

    const handleRatingChange = (id_product: number, value: number) => {
        setReviewsState((prev) => ({
            ...prev,
            [id_product]: {
                ...prev[id_product],
                rating: value,
            },
        }));
    };

    const showCancelModal = (orderId: number) => {
        setCancelOrderId(orderId);
        setIsModalVisible(true);
    };

    const handleCancelOrder = async () => {
        if (!cancelOrderId) {
            message.error("Đơn hàng không hợp lệ.");
            return;
        }

        if (!cancelReason.trim()) {
            message.error("Lý do hủy không được để trống.");
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                message.error("Bạn chưa đăng nhập.");
                return;
            }
            const response = await axiosInstance.get(`/purchasedOrders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    cancel_id: cancelOrderId,
                    note: cancelReason,
                },
            });

            message.success(
                response.data.message || "Đơn hàng đã hủy thành công.",
            );
            setIsModalVisible(false);
            setCancelReason("");
            window.location.reload();
        } catch (error) {
            Modal.confirm({
                title: "Không thể hủy đơn hàng",
                content: "Đơn hàng đã được xác nhận và không thể hủy.",
                okText: "Tôi đã hiểu",
                onOk() {
                    window.location.reload(); // Tải lại trang khi người dùng nhấn nút "Tôi đã hiểu"
                },
            });
        }
    };

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCancelReason(e.target.value);
    };

    const handleConfirmReceived = async (orderId: number) => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                message.error("Bạn chưa đăng nhập.");
                return;
            }
            const response = await axiosInstance.get("/purchasedOrders", {
                params: {
                    complete_id: orderId,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                message.success(response.data.message);

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

    const calculateTotalPrice = (order: Order) => {
        return order.order_detail.reduce((total, item) => {
            return total + item.selling_price * item.quantity;
        }, 0);
    };

    const handleProductClick = (id: number) => {
        navigate(`/detail/${id}`);
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
                        <div className="wd-form-order" key={order.id}>
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
                                    <h6 className="mt-2 fw-5">
                                        Đơn hàng #{order.id}
                                    </h6>
                                    {Number(order.status) === 1 && (
                                        <div className="button">
                                            <a
                                                className="view-btn"
                                                onClick={() =>
                                                    showCancelModal(order.id)
                                                }
                                            >
                                                Hủy đơn hàng
                                            </a>
                                        </div>
                                    )}

                                    {Number(order.status) === 4 && (
                                        <div className="button">
                                            <a
                                                className="view-btn"
                                                onClick={() =>
                                                    handleConfirmReceived(
                                                        order.id,
                                                    )
                                                }
                                            >
                                                Đã nhận được hàng
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="tf-grid-layout md-col-2 gap-15">
                                <div className="item">
                                    <div className="text-2 text_black-2">
                                        Thời gian đặt hàng
                                    </div>
                                    <div className="text-2 mt_4 fw-6">
                                        {convertToTimezone(order.created_at)}
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="text-2 text_black-2">
                                        Họ và tên
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
                                <div className="item">
                                    <div className="text-2 text_black-2">
                                        Phương thức thanh toán
                                    </div>
                                    <div className="text-2 mt_4 fw-6">
                                        {
                                            paymentRoleMap[
                                                Number(order.payment_role)
                                            ]
                                        }
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="text-2 text_black-2">
                                        Trạng thái thanh toán
                                    </div>
                                    <div className="text-2 mt_4 fw-6">
                                        {
                                            statusPaymentMap[
                                                Number(order.status_payment)
                                            ]
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="widget-tabs style-has-border widget-order-tab">
                                <ul className="widget-menu-tab">
                                    <li className="item-title">
                                        <span className="inner">
                                            Chi tiết đơn hàng
                                        </span>
                                    </li>
                                </ul>

                                <div className="widget-content-tab">
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
                                                        alignItems: "center",
                                                    }}
                                                >
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
                                                                width: "100px",
                                                                height: "100px",
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
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                        </figure>
                                                        <div className="content">
                                                            <div className="text-3 fw-6">
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
                                                                    Kích thước:
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

                                                    <div
                                                        className="product-price-quantity"
                                                        style={{
                                                            textAlign: "right",
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
                                                        <div
                                                            className="price"
                                                            style={{
                                                                textAlign:
                                                                    "right",
                                                                width: "600px",
                                                            }}
                                                        >
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
                                                            {Number(
                                                                order.status,
                                                            ) === 6 && (
                                                                <div className="button">
                                                                    <Button
                                                                        style={{
                                                                            backgroundColor:
                                                                                "black",
                                                                        }}
                                                                        type="primary"
                                                                        onClick={() =>
                                                                            hasReviewed[
                                                                                item
                                                                                    .id_variant
                                                                            ]
                                                                                ? handleProductClick(
                                                                                      item.id_product,
                                                                                  ) // Chuyển đến trang chi tiết đánh giá nếu đã đánh giá
                                                                                : handleReviewCheck(
                                                                                      order.id,
                                                                                      item.id_product,
                                                                                      item.id_variant,
                                                                                  )
                                                                        }
                                                                    >
                                                                        {hasReviewed[
                                                                            item
                                                                                .id_variant
                                                                        ]
                                                                            ? "Xem chi tiết đánh giá"
                                                                            : "Đánh giá"}
                                                                    </Button>
                                                                    <Modal
                                                                        title="Đánh giá sản phẩm"
                                                                        open={
                                                                            isReviewModalVisible &&
                                                                            selectedProduct?.id_product ===
                                                                                item.id_product
                                                                        }
                                                                        onOk={
                                                                            handleOk
                                                                        }
                                                                        onCancel={
                                                                            handleCancel
                                                                        }
                                                                        okText="Gửi đánh giá"
                                                                        cancelText="Hủy bỏ"
                                                                    >
                                                                        <Rate
                                                                            onChange={(
                                                                                value,
                                                                            ) =>
                                                                                setReviewsState(
                                                                                    (
                                                                                        prev,
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        [item.id_product]:
                                                                                            {
                                                                                                ...prev[
                                                                                                    item
                                                                                                        .id_product
                                                                                                ],
                                                                                                rating: value,
                                                                                            },
                                                                                    }),
                                                                                )
                                                                            }
                                                                            value={
                                                                                reviewsState[
                                                                                    item
                                                                                        .id_product
                                                                                ]
                                                                                    ?.rating
                                                                            }
                                                                        />
                                                                        <Input.TextArea
                                                                            rows={
                                                                                4
                                                                            }
                                                                            value={
                                                                                reviewsState[
                                                                                    item
                                                                                        .id_product
                                                                                ]
                                                                                    ?.content ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setReviewsState(
                                                                                    (
                                                                                        prev,
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        [item.id_product]:
                                                                                            {
                                                                                                ...prev[
                                                                                                    item
                                                                                                        .id_product
                                                                                                ],
                                                                                                content:
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                            },
                                                                                    }),
                                                                                )
                                                                            }
                                                                        />
                                                                    </Modal>
                                                                </div>
                                                            )}
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
                                                    calculateTotalPrice(order),
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <ul className="widget-menu-tab">
                                        <li className="item-title">
                                            <span className="inner">
                                                Lịch sử đơn hàng
                                            </span>
                                        </li>
                                    </ul>

                                    <div className="widget-content-tab">
                                        <div className="widget-content-inner active">
                                            <div className="widget-timeline">
                                                <ul className="timeline">
                                                    {Number(order.status) ===
                                                    7 ? (
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
                                                        Object.keys(
                                                            orderStatusMap,
                                                        ).map((key) => {
                                                            const statusKey =
                                                                Number(key);
                                                            const currentStatus =
                                                                Number(
                                                                    order.status,
                                                                );

                                                            if (statusKey === 7)
                                                                return null;
                                                            if (
                                                                statusKey ===
                                                                    5 &&
                                                                currentStatus !==
                                                                    5
                                                            )
                                                                return null;
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
                                                                                        : "gray",
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
                                                </ul>

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
                                        </div>
                                    </div>
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
