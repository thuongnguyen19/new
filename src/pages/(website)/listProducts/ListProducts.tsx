import React, { useEffect, useState } from "react";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import { useNavigate } from "react-router-dom";
import {
    AlignCenterOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    HeartOutlined, // Thêm biểu tượng trái tim
} from "@ant-design/icons";
import { fetchProducts, Product } from "../../../Interface/Product";
import { Category, fetchCategorys } from "../../../Interface/Category";
import axios from "axios"; // Đảm bảo import axios
import { message } from "antd"; // Đảm bảo import message từ antd

const ListProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("none");
    const [sortOrder, setSortOrder] = useState("asc");
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | number>(
        "",
    );

    const [search, setSearch] = useState("");
    const perPage = 12;
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<number[]>([]); // Danh sách sản phẩm yêu thích

    // Gọi API để lấy sản phẩm
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const { data, total_pages } = await fetchProducts(
                    sortBy,
                    sortOrder,
                    selectedCategory,
                    search,
                    page,
                    perPage,
                );
                setProducts(data);
                setTotalPages(total_pages);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Không thể tải sản phẩm.");
            } finally {
                setLoading(false);
            }
        };

        const loadFavorites = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/api/favoriteProduct",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                setFavorites(
                    response.data.map(
                        (fav: { id_product: number }) => fav.id_product,
                    ),
                );
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        };

        loadProducts();
        loadFavorites();
    }, [sortBy, sortOrder, selectedCategory, search, page, perPage]);

    // Lấy dữ liệu danh mục khi component được load
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoriesData = await fetchCategorys();
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        loadCategories();
    }, []);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleSortChange = (value: string) => {
        if (value.includes("Giá")) {
            setSortBy("price");
            setSortOrder(value === "Giá, từ thấp đến cao" ? "asc" : "desc");
        } else {
            setSortBy("name");
            setSortOrder(value === "Theo thứ tự, A-Z" ? "asc" : "desc");
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(e.target.value);
        setPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleProductClick = (id: number) => {
        navigate(`/detail/${id}`);
    };

    const updateLocalStorageFavorite = (updatedFavorites: any[]) => {
        localStorage.setItem("favorite", JSON.stringify(updatedFavorites));
        window.dispatchEvent(new Event("storage"));
    };

    const handleFavoriteToggle = async (productId: number) => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            message.error(
                "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích.",
            );
            navigate("/login");
            return;
        }

        const isFavorite = favorites.includes(productId);

        try {
            if (isFavorite) {
                // Xóa khỏi danh sách yêu thích nếu đã yêu thích
                await axios.delete(
                    `http://127.0.0.1:8000/api/favoriteProduct/${productId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );

                // Cập nhật trạng thái yêu thích trong giao diện
                setFavorites(favorites.filter((id) => id !== productId));

                // Cập nhật localStorage
                const favoriteData = JSON.parse(
                    localStorage.getItem("favorite") || "[]",
                );
                const updatedFavorites = favoriteData.filter(
                    (item: { id_product: number }) =>
                        item.id_product !== productId,
                );
                updateLocalStorageFavorite(updatedFavorites);

                localStorage.setItem(`isFavorite_${productId}`, "false");
                message.success("Đã xóa sản phẩm khỏi danh sách yêu thích.");
            } else {
                // Thêm vào danh sách yêu thích nếu chưa yêu thích
                await axios.post(
                    "http://127.0.0.1:8000/api/favoriteProduct",
                    { product_id: productId },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );

                setFavorites([...favorites, productId]);

                const favoriteData = JSON.parse(
                    localStorage.getItem("favorite") || "[]",
                );
                favoriteData.push({ id_product: productId });
                updateLocalStorageFavorite(favoriteData);

                localStorage.setItem(`isFavorite_${productId}`, "true");
                message.success("Đã thêm sản phẩm vào danh sách yêu thích.");
            }
        } catch (error) {
            message.error(
                "Có lỗi xảy ra khi thêm hoặc xóa sản phẩm yêu thích.",
            );
        }
    };

    if (loading) {
        return <p>Đang tải...</p>;
    }

    return (
        <div>
            <Header />
            <div className="tf-page-title">
                <div className="container-full">
                    <div className="heading text-center">Tất cả sản phẩm</div>
                </div>
            </div>

            <section className="flat-spacing-2">
                <div className="container">
                    <div className="tf-shop-control grid-3 align-items-center">
                        <div className="tf-control-filter">
                            <select
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="tf-control-layout d-flex justify-content-center">
                            <div className="search">
                                <div className="search-container">
                                    <input
                                        className="search-input"
                                        style={{ width: "400px" }}
                                        type="text"
                                        placeholder="Tìm kiếm sản phẩm..."
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                                {error && (
                                    <div className="error-message">{error}</div>
                                )}
                            </div>
                        </div>

                        <div className="tf-control-sorting d-flex justify-content-end">
                            <div className="tf-dropdown-sort">
                                <select
                                    onChange={(e) =>
                                        handleSortChange(e.target.value)
                                    }
                                >
                                    <option>Lựa chọn</option>
                                    <option value="Giá, từ thấp đến cao">
                                        Giá, từ thấp đến cao
                                    </option>
                                    <option value="Giá, từ cao đến thấp">
                                        Giá, từ cao đến thấp
                                    </option>
                                    <option value="Theo thứ tự, A-Z">
                                        Theo thứ tự, A-Z
                                    </option>
                                    <option value="Theo thứ tự, Z-A">
                                        Theo thứ tự, Z-A
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="wrapper-control-shop">
                        <div
                            className="grid-layout wrapper-shop"
                            data-grid="grid-4"
                        >
                            {Array.isArray(products) && products.length > 0 ? (
                                products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="card-product"
                                    >
                                        <div className="card-product-wrapper">
                                            <div
                                                className="product-img"
                                                onClick={() =>
                                                    handleProductClick(
                                                        product.id,
                                                    )
                                                }
                                                style={{ cursor: "pointer" }}
                                            >
                                                <img
                                                    className="lazyload img-product"
                                                    src={product.thumbnail}
                                                    alt={product.name}
                                                    style={{ height: 500 }}
                                                />
                                            </div>
                                            <div className="card-product-info">
                                                <h3
                                                    onClick={() =>
                                                        handleProductClick(
                                                            product.id,
                                                        )
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                    className="title link"
                                                >
                                                    {product.name}
                                                </h3>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <div className="price-on-sale">
                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    "bold",
                                                                color: "#f00",
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
                                                                product
                                                                    .variants[0]
                                                                    ?.selling_price,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="price-list"
                                                        style={{
                                                            marginLeft: "10px",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                textDecoration:
                                                                    "line-through",
                                                                color: "#999",
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
                                                                product
                                                                    .variants[0]
                                                                    ?.list_price,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <HeartOutlined
                                                        style={{
                                                            color: favorites.includes(
                                                                product.id,
                                                            )
                                                                ? "red"
                                                                : "#000",
                                                            marginLeft: "10px",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() =>
                                                            handleFavoriteToggle(
                                                                product.id,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div>Không có sản phẩm nào.</div>
                            )}
                        </div>
                    </div>

                    <div className="tf-pagination">
                        <div className="pagination">
                            <span
                                className="prev"
                                onClick={() =>
                                    handlePageChange(page > 1 ? page - 1 : page)
                                }
                            >
                                <DoubleLeftOutlined />
                            </span>
                            <span className="page-number">{page}</span>
                            <span
                                className="next"
                                onClick={() =>
                                    handlePageChange(
                                        page < totalPages ? page + 1 : page,
                                    )
                                }
                            >
                                <DoubleRightOutlined />
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ListProducts;
