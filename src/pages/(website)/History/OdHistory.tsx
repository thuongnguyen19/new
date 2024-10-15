import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import Link cho điều hướng
import { fetchOrders, Order } from "../../../Interface/Order";
import { message } from "antd";
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";

const OrderHistory = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const perPage = 5;
    const navigate = useNavigate();
    const orderStatusMap: { [key: number]: string } = {
        1: "Đang chờ xác nhận",
        2: "Đã xác nhận",
        3: "Đang giao hàng",
        4: "Giao hàng thành công",
        5: "Giao hàng thất bại",
        6: "Hoàn thành",
        7: "Đã hủy",
    };

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            message.error("Bạn chưa đăng nhập.");
            navigate("/login");
            return;
        }

        // Gọi API lấy danh sách đơn hàng
        const loadOrders = async () => {
            try {
                const { data, total_pages } = await fetchOrders(page, perPage);
                setOrders(data);
                setLoading(false);
                setTotalPages(total_pages);
            } catch (err) {
                setError("Lỗi khi tải danh sách đơn hàng");
                setLoading(false);
            }
        };

        loadOrders();
    }, [navigate, page, perPage]);

    // Hàm thay đổi trang
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleProductClick = (id: number) => {
        navigate(`/profile/od_histori/od_detail/${id}`);
    };

    if (loading) {
        return <p>Đang tải...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }
    return (
        <div className="order-history-container">
            <table className="order-history-table">
                <thead>
                    <tr>
                        <th>Mã đơn hàng</th>
                        <th>Ngày đặt hàng</th>
                        <th>Trạng thái đơn hàng</th>
                        <th>Tổng tiền</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(orders) && orders.length > 0 ? (
                        orders.map((order) => (
                            <tr key={order.id} className="tf-order-item">
                                <td>#{order.id}</td>
                                <td>
                                    {new Date(
                                        order.created_at,
                                    ).toLocaleDateString()}
                                </td>
                                <td>{orderStatusMap[Number(order.status)]}</td>
                                <td>
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(order.total_payment)}
                                    {/* {order.total_payment
                                        ? order.total_payment.toLocaleString() + " VND"
                                        : "Chưa xác định"} */}
                                </td>
                                <td>
                                    <a
                                        onClick={() =>
                                            handleProductClick(order.id)
                                        }
                                        className="view-btn"
                                        style={{
                                            backgroundColor: "black",
                                            width: "110px",
                                        }}
                                    >
                                        Xem chi tiết
                                    </a>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <p>Không có đơn hàng nào để hiển thị.</p>
                    )}
                </tbody>
            </table>
            {/* Phân trang */}
            <div className="phantrang">
                <ul className="tf-pagination-wrap tf-pagination-list tf-pagination-btn">
                    <li className={page === 1 ? "disabled" : ""}>
                        <a
                            href="#"
                            className="pagination-link"
                            onClick={(e) => {
                                e.preventDefault();
                                if (page > 1) handlePageChange(page - 1);
                            }}
                        >
                            <span>
                                <DoubleLeftOutlined />
                            </span>
                        </a>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNumber) => (
                            <li
                                key={pageNumber}
                                className={page === pageNumber ? "active" : ""}
                            >
                                <a
                                    href="#"
                                    className="pagination-link animate-hover-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(pageNumber);
                                    }}
                                >
                                    {pageNumber}
                                </a>
                            </li>
                        ),
                    )}
                    <li className={page === totalPages ? "disabled" : ""}>
                        <a
                            href="#"
                            className="pagination-link"
                            onClick={(e) => {
                                e.preventDefault();
                                if (page < totalPages)
                                    handlePageChange(page + 1);
                            }}
                        >
                            <span>
                                <DoubleRightOutlined />
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default OrderHistory;
