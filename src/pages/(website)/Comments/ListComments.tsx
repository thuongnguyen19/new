import { Input, Rate, Button, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import {
    fetchOrders,
    submitReview,
    Order,
    Review,
} from "../../../Interface/Order";
import { useParams } from "react-router-dom";

const ListComments = () => {
    const { id } = useParams<{ id: string }>();
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [orders, setOrders] = useState<Order[]>([]);
    const [reviewsState, setReviewsState] = useState<{
        [key: number]: { rating: number; content: string };
    }>({});
    const [hasReviewed, setHasReviewed] = useState<{ [key: number]: boolean }>(
        {},
    );
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentProductId, setCurrentProductId] = useState<number | null>(
        null,
    );
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const perPage = 1000;

    const showConfirmModal = (id_order: number, id_product: number) => {
        setCurrentProductId(id_product);
        setCurrentOrderId(id_order); // Lưu id của đơn hàng hiện tại
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        if (currentOrderId !== null && currentProductId !== null) {
            await handleSubmit(currentOrderId, currentProductId); // Gọi hàm gửi đánh giá
        }
        setIsModalVisible(false); // Đóng modal sau khi xử lý
    };

    const handleCancel = () => {
        setIsModalVisible(false); // Đóng modal nếu người dùng hủy bỏ
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

    const handleTextChange = (
        id_product: number,
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setReviewsState((prev) => ({
            ...prev,
            [id_product]: {
                ...prev[id_product],
                content: e.target.value,
            },
        }));
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

    // Sửa lại cách gọi showConfirmModal khi bấm nút gửi đánh giá
    const handleReviewCheck = (id_order: number, id_product: number) => {
        if (hasReviewed[id_product]) {
            message.warning("Bạn chỉ có thể đánh giá sản phẩm một lần.");
        } else {
            showConfirmModal(id_order, id_product); // Truyền thêm id_order
        }
    };

    const handleSubmit = async (id_order: number, id_product: number) => {
        const { content, rating } = reviewsState[id_product] || {
            content: "",
            rating: 0,
        };
        if (!content || rating === 0) {
            message.error("Vui lòng cung cấp đầy đủ thông tin đánh giá.");
            return;
        }

        // Gửi yêu cầu đánh giá
        try {
            const response = await submitReview(
                id_order,
                id_product,
                content,
                rating,
            );
            // Cập nhật danh sách reviews nếu cần
            setReviews((prevReviews) =>
                prevReviews ? [...prevReviews, response.data] : [response.data],
            );
            message.success("Đánh giá của bạn đã được gửi thành công!");

            // Cập nhật trạng thái đã đánh giá
            setHasReviewed((prev) => ({ ...prev, [id_product]: true }));
            setReviewsState((prev) => ({
                ...prev,
                [id_product]: { rating: 0, content: "" },
            })); // Reset lại phần đánh giá sau khi gửi thành công
        } catch (error) {
            message.error("Lỗi khi gửi đánh giá.");
            console.error("Error submitting review", error);
        }
    };

    return (
        <div>
            <section className="flat-spacing-11">
                <div className="wd-form-order">
                    {orders.map((order) => (
                        <div
                            className="widget-tabs style-has-border widget-order-tab"
                            key={order.id}
                        >
                            <div className="widget-content-tab">
                                <div className="widget-content-inne active">
                                    <div style={{ marginBottom: "10px" }}>
                                        <h5>Đánh giá sản phẩm</h5>
                                    </div>
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
                                                    style={{ display: "flex" }}
                                                >
                                                    <figure
                                                        className="img-product"
                                                        style={{
                                                            marginRight: "15px",
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
                                                            {item.product_name}
                                                        </div>
                                                        <div className="mt_4">
                                                            <span className="fw-6">
                                                                Màu sắc:
                                                            </span>{" "}
                                                            {
                                                                item
                                                                    .product_variant
                                                                    .color.name
                                                            }
                                                        </div>
                                                        <div className="mt_4">
                                                            <span className="fw-6">
                                                                Kích thước:
                                                            </span>{" "}
                                                            {
                                                                item
                                                                    .product_variant
                                                                    .size.name
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    padding: "20px",
                                                    backgroundColor: "#f9f9f9",
                                                    borderRadius: "8px",
                                                    marginTop: "10px",
                                                }}
                                            >
                                                <h6>Chất lượng sản phẩm</h6>
                                                <Rate
                                                    onChange={(value) =>
                                                        handleRatingChange(
                                                            item.id_product,
                                                            value,
                                                        )
                                                    }
                                                    value={
                                                        reviewsState[
                                                            item.id_product
                                                        ]?.rating
                                                    }
                                                    style={{ color: "#fadb14" }}
                                                />
                                                <Input.TextArea
                                                    rows={4}
                                                    placeholder="Hãy chia sẻ nhận xét cho sản phẩm này bạn nhé!"
                                                    value={
                                                        reviewsState[
                                                            item.id_product
                                                        ]?.content || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleTextChange(
                                                            item.id_product,
                                                            e,
                                                        )
                                                    }
                                                    maxLength={200}
                                                    style={{
                                                        marginTop: "10px",
                                                    }}
                                                />
                                                <Button
                                                    onClick={() =>
                                                        handleReviewCheck(
                                                            order.id,
                                                            item.id_product,
                                                        )
                                                    } // Kiểm tra trước khi gửi đánh giá
                                                    type="primary"
                                                    style={{
                                                        marginTop: "10px",
                                                    }}
                                                >
                                                    Gửi đánh giá
                                                </Button>

                                                <Modal
                                                    title="Xác nhận gửi đánh giá"
                                                    open={isModalVisible}
                                                    onOk={handleOk}
                                                    onCancel={handleCancel}
                                                    okText="Có"
                                                    cancelText="Không"
                                                >
                                                    <p>
                                                        Bạn chỉ có thể đánh giá
                                                        sản phẩm một lần. Bạn có
                                                        muốn gửi đánh giá không?
                                                    </p>
                                                </Modal>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ListComments;
function navigate(arg0: string) {
    throw new Error("Function not implemented.");
}
