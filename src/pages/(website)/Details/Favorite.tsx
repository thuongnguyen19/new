import { useState, useEffect } from "react";
import axios from "axios";
import { HeartFilled, DeleteFilled } from "@ant-design/icons";
import { message, Modal, Card, Row, Col } from "antd";
import Footer from "../../../components/common/Footer";
import Header from "../../../components/common/Header";

interface Variant {
    id_product: number;
    selling_price: string;
    list_price: string;
}

interface Product {
    id: number;
    name: string;
    thumbnail: string;
    variants: Variant[];
}

interface Favorite {
    id: number;
    id_user: number;
    id_product: number;
    product: Product;
}





const FavoritesList = () => {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token = localStorage.getItem("authToken");

                if (!token) {
                    setError("Token không tồn tại.");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    "http://127.0.0.1:8000/api/favoriteProduct",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },


                    
                );

updateLocalStorageFavorite(response.data);


                if (Array.isArray(response.data)) {
                    setFavorites(response.data);
                } else {
                    setError("Dữ liệu trả về không phải là mảng JSON.");
                }
            } catch (error) {
                setError("Không thể tải sản phẩm yêu thích.");
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }

        };

        fetchFavorites();
    }, []);


     const updateLocalStorageFavorite = (favorite: Favorite[]) => {
         localStorage.setItem("favorite", JSON.stringify(favorite));
         window.dispatchEvent(new Event("storage"));
     };









    const handleDelete = async (productId: string) => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            message.error("Bạn cần đăng nhập để thực hiện hành động này.");
            return;
        }

        try {
            const response = await axios.delete(
                `http://127.0.0.1:8000/api/favoriteProduct/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            message.success(response.data.message);

            // Cập nhật lại danh sách sản phẩm yêu thích
            setFavorites((prevFavorites) =>
                prevFavorites.filter(
                    (item) => item.id_product !== Number(productId),
                ),
            );
            updateLocalStorageFavorite(favorites);
        } catch (error) {
            message.error("Không thể xóa sản phẩm yêu thích.");
            console.error("Error deleting favorite:", error);
        }
    };

    const confirmDelete = (productId: string) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content:
                "Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích không?",
            onOk: () => handleDelete(productId),
            onCancel() {
                // Thao tác khi người dùng hủy
            },
        });
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <Header/>
            <h6>Sản phẩm yêu thích</h6>
            <Row gutter={[16, 16]}>
                {favorites.map((item) => (
                    <Col span={6} key={item.id}>
                        {" "}
                        {/* Đặt span là 6 để có 4 sản phẩm mỗi hàng */}
                        <Card
                            hoverable
                            cover={
                                <img
                                    alt={item.product.name}
                                    src={item.product.thumbnail}
                                />
                            }
                            actions={[
                                <DeleteFilled
                                    onClick={() => {
                                        if (item.product && item.product.id) {
                                            confirmDelete(item.product.id);
                                        } else {
                                            console.error(
                                                "ID sản phẩm không hợp lệ",
                                                item,
                                            );
                                        }
                                    }}
                                    style={{
                                        fontSize: "20px",
                                        color: "red",
                                        cursor: "pointer",
                                    }}
                                />,
                            ]}
                        >
                            <Card.Meta
                                title={item.product.name}
                                description={
                                    <>
                                        <p>
                                            Giá bán:{" "}
                                            {
                                                item.product.variants[0]
                                                    ?.selling_price
                                            }{" "}
                                            VND
                                        </p>
                                        <p>
                                            Giá niêm yết:{" "}
                                            {
                                                item.product.variants[0]
                                                    ?.list_price
                                            }{" "}
                                            VND
                                        </p>
                                    </>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
            <Footer></Footer>
        </div>
        
    );
};

export default FavoritesList;
