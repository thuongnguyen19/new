import React, { useEffect, useState } from "react";
import { Swiper, Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import {
    CreditCardOutlined,
    CustomerServiceOutlined,
    HeartOutlined,
    InboxOutlined,
    LeftOutlined,
    RightOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import { fetchProductsNew, ProductsNew } from "../../../Interface/ProductsNew";
import axios from "axios";
import { message } from "antd";

const Home: React.FC = () => {
    const [productsnew, setProductsNew] = useState<ProductsNew[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sortByPrice, setSortByPrice] = useState<"asc" | "desc">("asc");
    const [favorites, setFavorites] = useState<number[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProductsNew = async () => {
            try {
                const data = await fetchProductsNew();
                setProductsNew(data);
            } catch (error) {
                console.error("Error fetching productsnew:", error);
            }
            setLoading(false);
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

        loadProductsNew();
        loadFavorites();
    }, []);

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
                // Xóa khỏi danh sách yêu thích
                await axios.delete(
                    `http://127.0.0.1:8000/api/favoriteProduct/${productId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
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
                // Thêm vào danh sách yêu thích
                await axios.post(
                    "http://127.0.0.1:8000/api/favoriteProduct",
                    { product_id: productId },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                setFavorites([...favorites, productId]);

                // Cập nhật localStorage
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

    const Price = () => {
        const sortedProducts = [...productsnew].sort((a, b) =>
            sortByPrice === "asc"
                ? a.variants[0].selling_price - b.variants[0].selling_price
                : b.variants[0].selling_price - a.variants[0].selling_price,
        );
        setProductsNew(sortedProducts);
        setSortByPrice(sortByPrice === "asc" ? "desc" : "asc");
    };

    const handleProductClick = (id: number) => {
        navigate(`/detail/${id}`);
    };

    if (loading) {
        return <p>Đang tải...</p>;
    }

    return (
        <>
            <section className="flat-spacing-9 bg_grey-6 flat-spacing-26">
                <div className="container">
                    <div className="flat-tab-store flat-animate-tab overflow-unset">
                        <ul
                            className="widget-tab-3 d-flex justify-content-center flex-wrap wow fadeInUp"
                            data-wow-delay="0s"
                            role="tablist"
                        >
                            <li className="nav-tab-item" role="presentation">
                                <a
                                    href="#essentials"
                                    className="active"
                                    data-bs-toggle="tab"
                                >
                                    Sản phẩm mới
                                </a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div
                                className="tab-pane active show"
                                id="essentials"
                                role="tabpanel"
                            >
                                <div className="wrap-carousel">
                                    <div
                                        className="swiper tf-sw-product-sell-1"
                                        data-preview="4"
                                        data-tablet="3"
                                        data-mobile="2"
                                        data-space-lg="30"
                                        data-space-md="15"
                                        data-pagination="2"
                                        data-pagination-md="3"
                                        data-pagination-lg="3"
                                    >
                                        <div className="swiper-wrapper">
                                            {/* Nút điều hướng slider */}
                                            <div
                                                className="swiper-button-prev"
                                                style={{ color: "black" }}
                                            >
                                                <LeftOutlined />
                                            </div>
                                            <div
                                                className="swiper-button-next"
                                                style={{ color: "black" }}
                                            >
                                                <RightOutlined />
                                            </div>

                                            <Swiper
                                                modules={[Navigation]} // Sử dụng module Navigation cho Swiper
                                                spaceBetween={20}
                                                slidesPerView={3} // Hiển thị 3 sản phẩm mỗi lần
                                                navigation={{
                                                    nextEl: ".swiper-button-next",
                                                    prevEl: ".swiper-button-prev",
                                                }}
                                                loop={true} // Cho phép slider chạy vòng lặp
                                                className="swiper-container"
                                            >
                                                {productsnew.map((product) => (
                                                    <SwiperSlide
                                                        key={product.id}
                                                    >
                                                        <div className="card-product style-skincare">
                                                            <div className="card-product-wrapper">
                                                                <div
                                                                    onClick={() =>
                                                                        handleProductClick(
                                                                            product.id,
                                                                        )
                                                                    }
                                                                    style={{
                                                                        cursor: "pointer",
                                                                    }}
                                                                    className="product-img"
                                                                >
                                                                    <img
                                                                        className="lazyload img-product"
                                                                        src={
                                                                            product.thumbnail
                                                                        }
                                                                        alt={
                                                                            product.name
                                                                        }
                                                                        style={{
                                                                            width: "800px",
                                                                            height: "500px",
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="card-product-info text-center">
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
                                                                    {
                                                                        product.name
                                                                    }
                                                                </h3>

                                                                <HeartOutlined
                                                                    onClick={() =>
                                                                        handleFavoriteToggle(
                                                                            product.id,
                                                                        )
                                                                    }
                                                                    style={{
                                                                        fontSize:
                                                                            "35px",
                                                                        color: favorites.includes(
                                                                            product.id,
                                                                        )
                                                                            ? "red"
                                                                            : undefined,// Nếu có trong favorites, màu sẽ là đỏ
                                                                        cursor: "pointer",
                                                                        transition:
                                                                            "color 0.3s ease", // Thêm hiệu ứng chuyển đổi
                                                                    }}
                                                                />

                                                                <div>
                                                                    <span
                                                                        style={{
                                                                            fontWeight:
                                                                                "bold",
                                                                            color: "#f00",
                                                                        }}
                                                                    >
                                                                        {product.variants[0]?.selling_price?.toLocaleString(
                                                                            "vi-VN",
                                                                            {
                                                                                style: "currency",
                                                                                currency:
                                                                                    "VND",
                                                                                minimumFractionDigits: 0, // Loại bỏ .00
                                                                                maximumFractionDigits: 0, // Loại bỏ .00
                                                                            },
                                                                        )}{" "}
                                                                        đ
                                                                    </span>
                                                                    <span
                                                                        style={{
                                                                            textDecoration:
                                                                                "line-through",
                                                                            color: "#999",
                                                                        }}
                                                                    >
                                                                        {product.variants[0]?.list_price?.toLocaleString(
                                                                            "vi-VN",
                                                                            {
                                                                                style: "currency",
                                                                                currency:
                                                                                    "VND",
                                                                                minimumFractionDigits: 0, // Loại bỏ .00
                                                                                maximumFractionDigits: 0, // Loại bỏ .00
                                                                            },
                                                                        )}{" "}
                                                                        đ
                                                                    </span>
                                                                </div>

                                                                {/* <span className="price">Giá cũ: {product.variants[0]?.list_price.toLocaleString()} VND</span> */}
                                                            </div>
                                                        </div>
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        </div>
                                    </div>

                                    <div className="sw-dots style-2 sw-pagination-sell-1 justify-content-center"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="tf-slideshow slider-video position-relative">
                <div className="banner-wrapper">
                    <img
                        className="lazyload"
                        data-src="images/slider/jewerly-4.jpg"
                        src="images/slider/jewerly-4.jpg"
                        alt="image-collection"
                    />
                    <div className="box-content text-center">
                        <div className="container">
                            <p className="subheading text-white fw-7">
                                Trang sức cao cấp
                            </p>
                            <h1 className="heading text-white">
                                Trang sức đính đá
                            </h1>
                            <p className="description text-white">
                                Những viên đá sáng lấp lánh nâng tầm vẻ đẹp của
                                bạn.
                            </p>
                            <div className="wow fadeInUp" data-wow-delay="0s">
                                <Link
                                    to="/products"
                                    className="tf-btn btn-md btn-light-icon btn-icon radius-3 animate-hover-btn"
                                >
                                    <span />
                                    Bộ sưu tập
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className="tf-marquee marquee-sm bg_dark">
                <div className="wrap-marquee speed-1">
                    <div className="marquee-item">
                        <div className="icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="7"
                                height="6"
                                viewBox="0 0 7 6"
                                fill="none"
                            >
                                <path
                                    d="M3.5 0L6.53109 5.25H0.468911L3.5 0Z"
                                    fill="white"
                                ></path>
                            </svg>
                        </div>
                        <p className="text text-white text-uppercase fw-6">
                            Mùa mới, phong cách mới: Khuyến mãi trang sức bạn
                            không thể bỏ lỡ
                        </p>
                    </div>
                    <div className="marquee-item">
                        <div className="icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="7"
                                height="6"
                                viewBox="0 0 7 6"
                                fill="none"
                            >
                                <path
                                    d="M3.5 0L6.53109 5.25H0.468911L3.5 0Z"
                                    fill="white"
                                ></path>
                            </svg>
                        </div>
                        <p className="text text-white text-uppercase fw-6">
                            Miễn phí vận chuyển và trả hàng
                        </p>
                    </div>
                    <div className="marquee-item">
                        <div className="icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="7"
                                height="6"
                                viewBox="0 0 7 6"
                                fill="none"
                            >
                                <path
                                    d="M3.5 0L6.53109 5.25H0.468911L3.5 0Z"
                                    fill="white"
                                ></path>
                            </svg>
                        </div>
                        <p className="text text-white text-uppercase fw-6">
                            Ưu đãi có giới hạn: chốt đơn nhanh nhận ngay deal
                            hời
                        </p>
                    </div>
                    <div className="marquee-item">
                        <div className="icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="7"
                                height="6"
                                viewBox="0 0 7 6"
                                fill="none"
                            >
                                <path
                                    d="M3.5 0L6.53109 5.25H0.468911L3.5 0Z"
                                    fill="white"
                                ></path>
                            </svg>
                        </div>
                        <p className="text text-white text-uppercase fw-6">
                            Mùa mới, phong cách mới: Khuyến mãi trang sức bạn
                            không thể bỏ lỡ
                        </p>
                    </div>
                    <div className="marquee-item">
                        <div className="icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="7"
                                height="6"
                                viewBox="0 0 7 6"
                                fill="none"
                            >
                                <path
                                    d="M3.5 0L6.53109 5.25H0.468911L3.5 0Z"
                                    fill="white"
                                ></path>
                            </svg>
                        </div>
                        <p className="text text-white text-uppercase fw-6">
                            Miễn phí vận chuyển và trả hàng
                        </p>
                    </div>
                    <div className="marquee-item">
                        <div className="icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="7"
                                height="6"
                                viewBox="0 0 7 6"
                                fill="none"
                            >
                                <path
                                    d="M3.5 0L6.53109 5.25H0.468911L3.5 0Z"
                                    fill="white"
                                ></path>
                            </svg>
                        </div>
                        <p className="text text-white text-uppercase fw-6">
                            Ưu đãi có giới hạn: chốt đơn nhanh nhận ngay deal
                            hời
                        </p>
                    </div>
                </div>
            </div>

            <section className="flat-spacing-9">
                <div className="container">
                    <div className="tf-grid-layout md-col-2 tf-img-video-text">
                        <div className="content-wrap bg_orange radius-20">
                            <div
                                className="heading text-white wow fadeInUp"
                                data-wow-delay="0s"
                            >
                                Bảo quản trang sức
                            </div>
                            <ul>
                                <li>
                                    <div className="number text-white">1</div>
                                    <div className="text text-white">
                                        Dùng hộp đựng trang sức có ngăn để tránh
                                        trầy xước và tránh nơi ẩm mốc.
                                    </div>
                                </li>
                                <li>
                                    <div className="number text-white">2</div>
                                    <div className="text text-white">
                                        Vệ sinh bằng nước và xà phòng nhẹ, tránh
                                        hóa chất mạnh.
                                    </div>
                                </li>
                                <li>
                                    <div className="number text-white">3</div>
                                    <div className="text text-white">
                                        Kiểm tra định kỳ. Nếu cần, hãy mang đến
                                        cửa hàng bảo trì và làm sạch.
                                    </div>
                                </li>
                                <li>
                                    <div className="number text-white">4</div>
                                    <div className="text text-white">
                                        Lưu ý với một số chất liệu: bạc dễ xỉn
                                        màu cần sử dụng kem đánh bạc.
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="video-wrap">
                            <video
                                className="radius-20"
                                src="images/slider/video-jewerly.mp4"
                                playsInline
                                controls
                                onLoadedMetadata={(event) => {
                                    const videoElement = event.currentTarget;
                                    console.log(
                                        "Video duration:",
                                        videoElement.duration,
                                    );
                                    console.log(
                                        "Video dimensions:",
                                        videoElement.videoWidth,
                                        videoElement.videoHeight,
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="flat-spacing-9">
                <div className="container">
                    <div className="flat-tab-store flat-animate-tab overflow-unset">
                        <ul
                            className="widget-tab-3 d-flex justify-content-center flex-wrap"
                            role="tablist"
                        >
                            <li className="nav-tab-item" role="presentation">
                                <a
                                    href="#organic"
                                    className="active"
                                    data-bs-toggle="tab"
                                >
                                    Trang sức cưới
                                </a>
                            </li>
                            <li className="nav-tab-item" role="presentation">
                                <a href="#cruelty" data-bs-toggle="tab">
                                    Trang sức đôi
                                </a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div
                                className="tab-pane active show"
                                id="organic"
                                role="tabpanel"
                            >
                                <div className="widget-card-store radius-20 overflow-hidden type-1 align-items-center tf-grid-layout md-col-2">
                                    <div className="store-img">
                                        <img
                                            className="lazyload"
                                            data-src="images/collections/jewerly-16.jpg"
                                            src="images/collections/jewerly-16.jpg"
                                            alt="store-img"
                                        />
                                    </div>
                                    <div className="store-item-info text-center">
                                        <h5 className="store-heading text-white">
                                            Cưới thôi nào!
                                        </h5>
                                        <div className="description">
                                            <p className="text-white">
                                                Nơi tình yêu tỏa sáng trong từng
                                                món trang sức.
                                            </p>
                                        </div>
                                        <div
                                            className="wow fadeInUp"
                                            data-wow-delay="0s"
                                        >
                                            <Link
                                                to="/products"
                                                className="tf-btn btn-md btn-light-icon btn-icon radius-3 animate-hover-btn"
                                            >
                                                <span />
                                                Bộ sưu tập
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="tab-pane"
                                id="cruelty"
                                role="tabpanel"
                            >
                                <div className="widget-card-store radius-20 overflow-hidden type-1 align-items-center tf-grid-layout md-col-2">
                                    <div className="store-img">
                                        <img
                                            className="lazyload"
                                            data-src="images/collections/jewerly-17.jpg"
                                            src="images/collections/jewerly-17.jpg"
                                            alt="store-img"
                                        />
                                    </div>
                                    <div className="store-item-info text-center">
                                        <h5 className="store-heading text-white">
                                            Gắn kết yêu thương
                                        </h5>
                                        <div className="description">
                                            <p className="text-white">
                                                Cùng nhau tỏa sáng, cùng nhau
                                                khắc ghi kỷ niệm.
                                            </p>
                                        </div>
                                        <div
                                            className="wow fadeInUp"
                                            data-wow-delay="0s"
                                        >
                                            <Link
                                                to="/products"
                                                className="tf-btn btn-md btn-light-icon btn-icon radius-3 animate-hover-btn"
                                            >
                                                <span />
                                                Bộ sưu tập
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="flat-spacing-1 flat-iconbox">
                <div className="container">
                    <div
                        className="wrap-carousel wrap-mobile wow fadeInUp"
                        data-wow-delay="0s"
                    >
                        <div
                            className="swiper tf-sw-mobile"
                            data-preview="1"
                            data-space="15"
                        >
                            <div className="swiper-wrapper wrap-iconbox">
                                <div className="swiper-slide">
                                    <div className="tf-icon-box style-row">
                                        <div className="icon">
                                            <InboxOutlined />
                                        </div>
                                        <div className="content">
                                            <div className="title fw-4">
                                                Miễn phí vận chuyển
                                            </div>
                                            <p>
                                                Miễn phí vận chuyển cho mọi đơn
                                                hàng
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    <div className="tf-icon-box style-row">
                                        <div className="icon">
                                            <CreditCardOutlined />
                                        </div>
                                        <div className="content">
                                            <div className="title fw-4">
                                                Thanh toán linh hoạt
                                            </div>
                                            <p>
                                                Có thể thanh toán qua nhiều
                                                phương thức
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="swiper-slide">
                                    <div className="tf-icon-box style-row">
                                        <div className="icon">
                                            <CustomerServiceOutlined />
                                        </div>
                                        <div className="content">
                                            <div className="title fw-4">
                                                Hỗ trợ
                                            </div>
                                            <p>
                                                Hỗ trợ nhanh chóng và vượt trội
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="sw-dots style-2 sw-pagination-mb justify-content-center"></div>
                    </div>
                </div>
            </section>

            <div className="container">
                <div className="line"></div>
            </div>
        </>
    );
};

export default Home;
