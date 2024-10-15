import React, { useEffect, useState } from "react";
import Footer from "../../../components/common/Footer";
import Header from "../../../components/common/Header";
import axios from "axios";
import { message, Spin, Modal } from "antd";
import { DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface CartItem {
    id: number;
    quantity: number;
    variant: {
        id: number;
        product: {
            name: string;
            thumbnail: string;
        };
        colors: {
            name: string;
        };
        sizes: {
            name: string;
        };
        selling_price: string;
        image_color: string;
    } | null;
}

const ListCart: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const navigate = useNavigate();

    // Fetch cart items from API
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            message.error("Bạn chưa đăng nhập.");
            navigate("/login");
            return;
        }

        const fetchCartItems = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/listCart",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (response.data.status) {
                    const items = mergeCartItems(response.data.data);
                    setCartItems(items);
                    updateLocalStorageCart(items);
                } else {
                    message.error(response.data.message);
                }
            } catch (error) {
                message.error("Có lỗi xảy ra khi lấy giỏ hàng.");
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [navigate]);

    const updateLocalStorageCart = (cartItems: CartItem[]) => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    };

    // Merge duplicate cart items
    const mergeCartItems = (items: CartItem[]) => {
        const mergedItems: CartItem[] = [];

        items.forEach((item) => {
            const existingItem = mergedItems.find(
                (existing) =>
                    existing.variant?.product.name ===
                        item.variant?.product.name &&
                    existing.variant?.colors.name ===
                        item.variant?.colors.name &&
                    existing.variant?.sizes.name === item.variant?.sizes.name,
            );

            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                mergedItems.push(item);
            }
        });

        return mergedItems;
    };

    const calculateTotalPrice = (selectedIds: number[]) => {
        const selectedItemsTotal = cartItems.reduce((sum, item) => {
            if (selectedIds.includes(item.id)) {
                return (
                    sum +
                    parseFloat(item.variant?.selling_price || "0") *
                        item.quantity
                );
            }
            return sum;
        }, 0);
        setTotalPrice(selectedItemsTotal);
    };

    const handleDeleteMultipleItems = async () => {
        if (selectedItems.length === 0) {
            message.warning("Vui lòng chọn sản phẩm để xóa!");
            return;
        }

        Modal.confirm({
            title: "Xác nhận",
            content:
                "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn khỏi giỏ hàng?",
            okText: "Xóa",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const token = localStorage.getItem("authToken");
                    if (!token) {
                        message.error("Bạn chưa đăng nhập.");
                        return;
                    }

                    const user = JSON.parse(
                        localStorage.getItem("user") || "{}",
                    );

                    await axios.delete(
                        "http://localhost:8000/api/deleteMutipleCart",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                            data: { cart_ids: selectedItems, id_user: user.id },
                        },
                    );

                    const remainingItems = cartItems.filter(
                        (item) => !selectedItems.includes(item.id),
                    );
                    setCartItems(remainingItems);
                    updateLocalStorageCart(remainingItems);
                    setSelectedItems([]);
                    setTotalPrice(0);
                    message.success("Sản phẩm đã được xóa khỏi giỏ hàng!");
                } catch (error) {
                    message.error(
                        "Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.",
                    );
                }
            },
        });
    };

    const handleIncreaseQuantity = (itemId: number) => {
        const updatedCartItems = cartItems.map((item) => {
            if (item.id === itemId) {
                const updatedQuantity = item.quantity + 1;
                item.quantity = updatedQuantity;
                return item;
            }
            return item;
        });
        setCartItems(updatedCartItems);
        updateLocalStorageCart(updatedCartItems);
        calculateTotalPrice(selectedItems);
    };

    const handleDecreaseQuantity = (itemId: number) => {
        const updatedCartItems = cartItems.map((item) => {
            if (item.id === itemId && item.quantity > 1) {
                const updatedQuantity = item.quantity - 1;
                item.quantity = updatedQuantity;
                return item;
            }
            return item;
        });
        setCartItems(updatedCartItems);
        updateLocalStorageCart(updatedCartItems);
        calculateTotalPrice(selectedItems);
    };

    const handleCheckboxChange = (itemId: number) => {
        let updatedSelectedItems: number[] = [];
        if (selectedItems.includes(itemId)) {
            updatedSelectedItems = selectedItems.filter((id) => id !== itemId);
        } else {
            updatedSelectedItems = [...selectedItems, itemId];
        }
        setSelectedItems(updatedSelectedItems);
        calculateTotalPrice(updatedSelectedItems);
    };

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItems([]);
            setTotalPrice(0);
        } else {
            const allItemIds = cartItems.map((item) => item.id);
            setSelectedItems(allItemIds);
            calculateTotalPrice(allItemIds);
        }
        setIsAllSelected(!isAllSelected);
    };

    const handleCheckout = async () => {
        if (selectedItems.length === 0) {
            message.warning("Vui lòng chọn sản phẩm trước khi thanh toán!");
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                message.error("Bạn chưa đăng nhập.");
                navigate("/login");
                return;
            }

            const selectedCartItems = cartItems
                .filter((item) => selectedItems.includes(item.id))
                .map((item) => ({
                    cart_id: item.id,
                    id_variant: item.variant?.id || 0,
                    quantity: item.quantity,
                }));

            const response = await axios.put(
                "http://localhost:8000/api/choseProductInCart",
                { cartItems: selectedCartItems },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.data.status) {
                message.success(
                    "Sản phẩm đã được chuyển sang trang thanh toán!",
                );
                navigate("/pay", {
                    state: {
                        cartIds: selectedItems,
                        cartItems: selectedCartItems,
                    },
                    replace: true,
                });
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error("Có lỗi xảy ra khi chọn sản phẩm để thanh toán.");
        }
    };

    // Xử lý xóa sản phẩm khi nhấn nút "x"
    const handleDeleteItem = async (itemId: number) => {
        Modal.confirm({
            title: "Xác nhận",
            content: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",
            okText: "Xóa",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const token = localStorage.getItem("authToken");
                    if (!token) {
                        message.error("Bạn chưa đăng nhập.");
                        return;
                    }

                    await axios.delete("http://localhost:8000/api/deleteCart", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        data: { id: itemId },
                    });

                    const remainingItems = cartItems.filter(
                        (item) => item.id !== itemId,
                    );
                    setCartItems(remainingItems);
                    updateLocalStorageCart(remainingItems);
                    calculateTotalPrice(selectedItems);
                    message.success("Sản phẩm đã được xóa khỏi giỏ hàng!");
                } catch (error) {
                    message.error(
                        "Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.",
                    );
                }
            },
        });
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <Spin tip="Đang tải giỏ hàng..." />
            </div>
        );
    }

    return (
        <>
            <Header />
            <div id="wrapper">
                <div className="tf-page-title">
                    <div className="container-full">
                        <div className="heading text-center">Giỏ Hàng</div>
                    </div>
                </div>

                <section className="flat-spacing-11">
                    <div className="container">
                        <div className="tf-page-cart-wrap">
                            <div
                                className="cart-layout"
                                style={{ display: "flex" }}
                            >
                                <div className="cart-left" style={{ flex: 3 }}>
                                    <table className="tf-table-page-cart">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <div
                                                        style={{
                                                            textAlign: "center",
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                isAllSelected
                                                            }
                                                            onChange={
                                                                handleSelectAll
                                                            }
                                                        />
                                                        <span
                                                            style={{
                                                                marginLeft:
                                                                    "8px",
                                                            }}
                                                        >
                                                            Chọn
                                                        </span>
                                                        {selectedItems.length >
                                                            0 && (
                                                            <DeleteOutlined
                                                                style={{
                                                                    color: "red",
                                                                    marginLeft:
                                                                        "10px",
                                                                    fontSize:
                                                                        "18px",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={
                                                                    handleDeleteMultipleItems
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </th>
                                                <th>Sản phẩm</th>
                                                <th>Màu sắc</th>
                                                <th>Kích thước</th>
                                                <th>Số lượng</th>
                                                <th>Tổng cộng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="tf-cart-item"
                                                >
                                                    <td
                                                        style={{
                                                            textAlign: "center",
                                                            verticalAlign:
                                                                "middle",
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.includes(
                                                                item.id,
                                                            )}
                                                            onChange={() =>
                                                                handleCheckboxChange(
                                                                    item.id,
                                                                )
                                                            }
                                                        />
                                                        {selectedItems.includes(
                                                            item.id,
                                                        ) && (
                                                            <CloseOutlined
                                                                style={{
                                                                    color: "red",
                                                                    marginLeft:
                                                                        "10px",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() =>
                                                                    handleDeleteItem(
                                                                        item.id,
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="tf-cart-item_product">
                                                        <a
                                                            href="product-detail.html"
                                                            className="img-box"
                                                        >
                                                            <img
                                                                src={
                                                                    item.variant
                                                                        ?.image_color
                                                                }
                                                                alt={
                                                                    item.variant
                                                                        ?.product
                                                                        .name
                                                                }
                                                                style={{
                                                                    width: "100px",
                                                                    height: "100px",
                                                                }}
                                                            />
                                                        </a>
                                                        <div className="cart-info">
                                                            <a
                                                                href="product-detail.html"
                                                                className="cart-title link"
                                                            >
                                                                {
                                                                    item.variant
                                                                        ?.product
                                                                        .name
                                                                }
                                                            </a>
                                                            <div
                                                                className="tf-cart-item_price"
                                                                style={{
                                                                    marginTop:
                                                                        "20px",
                                                                    fontSize:
                                                                        "16px",
                                                                }}
                                                            >
                                                                {parseFloat(
                                                                    item.variant
                                                                        ?.selling_price ||
                                                                        "0",
                                                                ).toLocaleString(
                                                                    "vi-VN",
                                                                )}{" "}
                                                                VND
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={{
                                                            textAlign: "center",
                                                            verticalAlign:
                                                                "middle",
                                                        }}
                                                    >
                                                        {
                                                            item.variant?.colors
                                                                .name
                                                        }
                                                    </td>
                                                    <td
                                                        style={{
                                                            textAlign: "center",
                                                            verticalAlign:
                                                                "middle",
                                                        }}
                                                    >
                                                        {
                                                            item.variant?.sizes
                                                                .name
                                                        }
                                                    </td>
                                                    <td
                                                        className="tf-cart-item_quantity"
                                                        style={{
                                                            textAlign: "center",
                                                            verticalAlign:
                                                                "middle",
                                                        }}
                                                    >
                                                        <div className="cart-quantity">
                                                            <button
                                                                onClick={() =>
                                                                    handleDecreaseQuantity(
                                                                        item.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    item.quantity ===
                                                                    1
                                                                }
                                                            >
                                                                -
                                                            </button>
                                                            <span
                                                                style={{
                                                                    margin: "0 10px",
                                                                }}
                                                            >
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    handleIncreaseQuantity(
                                                                        item.id,
                                                                    )
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td
                                                        className="tf-cart-item_total"
                                                        style={{
                                                            textAlign: "center",
                                                            verticalAlign:
                                                                "middle",
                                                        }}
                                                    >
                                                        {(
                                                            parseFloat(
                                                                item.variant
                                                                    ?.selling_price ||
                                                                    "0",
                                                            ) * item.quantity
                                                        ).toLocaleString(
                                                            "vi-VN",
                                                        )}{" "}
                                                        VND
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div
                                className="cart-right"
                                style={{
                                    flex: 1,
                                    position: "sticky",
                                    top: "100px",
                                    alignSelf: "start",
                                }}
                            >
                                <div className="cart-summary">
                                    <div
                                        className="tf-cart-totals"
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <h3
                                            style={{
                                                fontSize: "18px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Tổng cộng:
                                        </h3>
                                        <span
                                            className="total-value"
                                            style={{
                                                fontSize: "20px",
                                                fontWeight: "bold",
                                                color: "red",
                                                marginLeft: "10px",
                                            }}
                                        >
                                            {totalPrice > 0
                                                ? totalPrice.toLocaleString(
                                                      "vi-VN",
                                                  ) + " VND"
                                                : "0 VND"}
                                        </span>
                                    </div>
                                    <div className="tf-cart-checkout">
                                        <a
                                            onClick={handleCheckout}
                                            className="tf-btn w-100 btn-fill animate-hover-btn radius-3 justify-content-center"
                                            style={{
                                                width: "100%",
                                                display: "inline-block",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <span>Thanh toán</span>
                                        </a>
                                    </div>
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

export default ListCart;
