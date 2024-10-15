import React, { useEffect, useState, useRef } from "react";
import Footer from "../../../components/common/Footer";
import Header from "../../../components/common/Header";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "swiper/css";
import { Navigation } from "swiper/modules";

// Interfaces
interface Image {
    id_product: number;
    id_attribute_color: number;
    link_image: string;
}

interface Variant {
    id: number;
    import_price: string;
    list_price: string;
    selling_price: string;
    quantity: number;
    image_color: string;
    colors: {
        id: number;
        name: string;
    };
    sizes: {
        id: number;
        name: string;
    };
}

interface RelatedProduct {
    id: number;
    name: string;
    thumbnail: string;
    variant: Variant[];
}

interface Product {
    slideImages: any;
    id: number;
    name: string;
    thumbnail: string;
    variant: Variant[];
    description: string;
    images: Image[];
}

// Hàm để thêm URL đầy đủ cho đường dẫn ảnh
const getFullImagePath = (imagePath: string) => {
    if (!imagePath.startsWith("http")) {
        return `http://127.0.0.1:8000/${imagePath}`;
    }
    return imagePath;
};

const Detail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedColorImage, setSelectedColorImage] = useState<string | null>(
        null,
    );
    const [selectedColorName, setSelectedColorName] = useState<string | null>(
        null,
    );
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [availableSizes, setAvailableSizes] = useState<string[]>([]);
    const [totalPrice, setTotalPrice] = useState<number | null>(null);
    const [listPrice, setListPrice] = useState<number | null>(null);
    const [remainingQuantity, setRemainingQuantity] = useState<number | null>(
        null,
    );
    const [minSellingPrice, setMinSellingPrice] = useState<number | null>(null);
    const [minListPrice, setMinListPrice] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0); // Theo dõi chỉ số slide hiện tại

    const mainSwiperRef = useRef<any>(null); // Ref để quản lý slider chính
    const thumbSwiperRef = useRef<any>(null); // Ref cho slider nhỏ

    // Fetch sản phẩm và sản phẩm liên quan khi id thay đổi
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/detailProduct/${id}`,
                );
                const productData: Product = response.data.data;

                if (productData) {
                    setProduct(productData);
                    fetchRelatedProducts(productData.id);

                    // Lấy giá nhỏ nhất từ các biến thể sản phẩm
                    const minVariant = productData.variant.reduce(
                        (prev, curr) =>
                            parseFloat(prev.selling_price) <
                            parseFloat(curr.selling_price)
                                ? prev
                                : curr,
                    );
                    const minListVariant = productData.variant.reduce(
                        (prev, curr) =>
                            parseFloat(prev.list_price) <
                            parseFloat(curr.list_price)
                                ? prev
                                : curr,
                    );

                    setMinSellingPrice(parseFloat(minVariant.selling_price));
                    setMinListPrice(parseFloat(minListVariant.list_price));
                } else {
                    setError("Giá không khả dụng");
                }

                setLoading(false);
            } catch (err) {
                setError("Không tìm thấy sản phẩm");
                setLoading(false);
            }
        };

        const fetchRelatedProducts = async (categoryId: number) => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/relatedProducts/${categoryId}`,
                );
                setRelatedProducts(response.data.data);
            } catch (err) {
                console.error("Failed to fetch related products", err);
            }
        };

        fetchProductDetails();
    }, [id]);

    // Hàm tăng/giảm số lượng sản phẩm
    const handleQuantityChange = (change: number) => {
        setQuantity((prevQuantity) => {
            // Kiểm tra số lượng còn lại
            if (
                change > 0 &&
                remainingQuantity !== null &&
                prevQuantity < remainingQuantity
            ) {
                return prevQuantity + change;
            }
            if (change < 0 && prevQuantity > 1) {
                return prevQuantity + change;
            }
            return prevQuantity;
        });
    };

    const getColorCode = (colorName: string) => {
        const colorMap: { [key: string]: string } = {
            đỏ: "#FF0000",
            xanh: "#0000FF",
            green: "#00FF00",
            black: "#000000",
            white: "#FFFFFF",
            pink: "#FFC0CB",
            vàng: "#FFFF00",
            tím: "#FF00FF",
            trắng: "#FFFFFF",
            hồng: "#FFC0CB",
            đen: "#000000",
        };

        return colorMap[colorName.toLowerCase()] || "#CCCCCC";
    };

    const handleColorChange = (colorName: string) => {
        setSelectedColor(colorName);
        setSelectedColorName(colorName);
        setSelectedSize(null);

        const selectedVariant = product?.variant.find(
            (variant) => variant.colors.name === colorName,
        );

        if (selectedVariant && selectedVariant.image_color) {
            const selectedImageIndex = getCombinedImages().indexOf(
                selectedVariant.image_color,
            );
            setSelectedColorImage(selectedVariant.image_color);
            setActiveIndex(selectedImageIndex); // Cập nhật đúng vị trí của ảnh màu trong slider lớn
            if (mainSwiperRef.current && mainSwiperRef.current.swiper) {
                mainSwiperRef.current.swiper.slideTo(selectedImageIndex); // Chuyển đến slide tương ứng
            }
        } else {
            setSelectedColorImage(null);
        }

        const sizesForSelectedColor = product?.variant
            .filter((variant) => variant.colors.name === colorName)
            .map((variant) => variant.sizes.name)
            .filter((sizeName) => sizeName !== undefined)
            .sort((a, b) => parseFloat(a) - parseFloat(b));

        setAvailableSizes(sizesForSelectedColor || []);
        setRemainingQuantity(null);
    };

    const handleSizeChange = (sizeName: string) => {
        if (availableSizes.includes(sizeName)) {
            setSelectedSize(sizeName);
            updateRemainingQuantityAndPrice(selectedColor, sizeName);
        }
    };

    const updateRemainingQuantityAndPrice = (
        colorName: string | null,
        sizeName: string | null,
    ) => {
        if (colorName && sizeName) {
            const selectedVariant = product?.variant.find(
                (variant) =>
                    variant.colors.name === colorName &&
                    variant.sizes.name === sizeName,
            );
            if (selectedVariant) {
                setRemainingQuantity(selectedVariant.quantity);
                setTotalPrice(parseFloat(selectedVariant.selling_price));
                setListPrice(parseFloat(selectedVariant.list_price));
            }
        }
    };

    const handleBuyNow = async () => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            message.error("Vui lòng đăng nhập để mua sản phẩm.");
            navigate("/login");
            return;
        }

        if (!selectedColor || !selectedSize) {
            message.error("Vui lòng chọn màu sắc và kích thước.");
            return;
        }

        // Kiểm tra nếu hết hàng
        if (remainingQuantity === 0) {
            message.error("Sản phẩm đã hết hàng. Vui lòng chọn sản phẩm khác.");
            return;
        }

        const selectedVariant = product?.variant.find(
            (variant) =>
                variant.colors.name === selectedColor &&
                variant.sizes.name === selectedSize,
        );

        if (!selectedVariant) {
            message.error(
                "Không tìm thấy sản phẩm với màu và kích thước đã chọn.",
            );
            return;
        }

        try {
            const orderData = {
                variantId: selectedVariant.id,
                quantity: quantity,
            };

            const response = await axios.get(
                "http://localhost:8000/api/listInformationOrder",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: orderData,
                },
            );

            if (response.data.status) {
                message.success("Lấy thông tin sản phẩm thành công.");

                navigate("/pay", {
                    state: {
                        variantId: selectedVariant.id,
                        quantity: quantity,
                    },
                });
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error("Có lỗi xảy ra khi lấy thông tin sản phẩm.");
        }
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            message.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
            navigate("/login");
            return;
        }

        if (!selectedColor || !selectedSize) {
            message.error("Vui lòng chọn màu sắc và kích thước.");
            return;
        }

        // Kiểm tra nếu hết hàng
        if (remainingQuantity === 0) {
            message.error("Sản phẩm đã hết hàng. Vui lòng chọn sản phẩm khác.");
            return;
        }

        const selectedVariant = product?.variant.find(
            (variant) =>
                variant.colors.name === selectedColor &&
                variant.sizes.name === selectedSize,
        );

        if (!selectedVariant) {
            message.error(
                "Không tìm thấy sản phẩm với màu và kích thước đã chọn.",
            );
            return;
        }

        try {
            const cartData = {
                id_variant: selectedVariant.id,
                quantity: quantity,
            };
            const response = await axios.post(
                "http://localhost:8000/api/addCart",
                cartData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            if (response.data.status) {
                const cartItems = JSON.parse(
                    localStorage.getItem("cartItems") || "[]",
                );
                cartItems.push(cartData);
                localStorage.setItem("cartItems", JSON.stringify(cartItems));

                window.dispatchEvent(new Event("storage"));

                message.success("Thêm vào giỏ hàng thành công.");
            } else {
                message.error("Thêm vào giỏ hàng thất bại.");
            }
        } catch (error) {
            message.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
        }
    };

    const uniqueColors =
        product?.variant.reduce((unique, item) => {
            if (
                !unique.some((color) => color.colors.name === item.colors.name)
            ) {
                unique.push(item);
            }
            return unique;
        }, [] as Variant[]) || [];

    const allSizes = Array.from(
        new Set(
            product?.variant
                ?.map((variant) => variant.sizes?.name)
                .filter((sizeName) => sizeName !== undefined),
        ),
    ).sort((a, b) => parseFloat(a) - parseFloat(b));

    const isSizeAvailable = (sizeName: string) => {
        return availableSizes.includes(sizeName);
    };

    const handleThumbnailClick = (index: number) => {
        if (mainSwiperRef.current && mainSwiperRef.current.swiper) {
            mainSwiperRef.current.swiper.slideTo(index);
            setActiveIndex(index); // Cập nhật trạng thái ảnh đang được xem
        }
    };

    const getCombinedImages = () => {
        if (selectedColorImage) {
            return [
                selectedColorImage,
                ...product!.slideImages.map((image: Image) => image.link_image),
            ];
        }
        return product!.slideImages.map((image: Image) => image.link_image);
    };

    const handleSlideChange = (swiper: any) => {
        setActiveIndex(swiper.activeIndex); // Cập nhật chỉ số slide hiện tại
        if (thumbSwiperRef.current && thumbSwiperRef.current.swiper) {
            thumbSwiperRef.current.swiper.slideTo(swiper.activeIndex); // Đồng bộ chỉ số của slider nhỏ
        }
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!product || !product.name) {
        return <div>Sản phẩm không hợp lệ hoặc không tìm thấy</div>;
    }

    return (
        <div>
            <Header />
            <div className="tf-breadcrumb">
                <div className="container">
                    <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
                        <div className="tf-breadcrumb-list">
                            <a href="/" className="text">
                                Trang chủ
                            </a>
                            <i className="icon icon-arrow-right"></i>
                            <span className="text">{product?.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <section className="flat-spacing-4 pt_0">
                <div className="tf-main-product section-image-zoom">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="tf-product-media-wrap sticky-top">
                                    <div className="product-images-wrapper">
                                        {/* Main Image Swiper */}
                                        <Swiper
                                            modules={[Navigation]}
                                            spaceBetween={20}
                                            slidesPerView={1}
                                            navigation={{
                                                nextEl: ".swiper-button-next",
                                                prevEl: ".swiper-button-prev",
                                            }}
                                            loop={true}
                                            ref={mainSwiperRef}
                                            onSlideChange={handleSlideChange}
                                            style={{
                                                width: "100%",
                                                height: "500px",
                                            }}
                                        >
                                            {getCombinedImages().map(
                                                (image, index) => (
                                                    <SwiperSlide key={index}>
                                                        <img
                                                            src={getFullImagePath(
                                                                image,
                                                            )}
                                                            alt={`Image ${index + 1}`}
                                                            style={{
                                                                width: "100%",
                                                                height: "500px",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    </SwiperSlide>
                                                ),
                                            )}
                                        </Swiper>

                                        {/* Horizontal Thumbnail Swiper */}
                                        <Swiper
                                            spaceBetween={10}
                                            slidesPerView={5}
                                            style={{ marginTop: "20px" }}
                                            navigation={{
                                                nextEl: ".swiper-button-next",
                                                prevEl: ".swiper-button-prev",
                                            }}
                                            loop={false}
                                            ref={thumbSwiperRef}
                                        >
                                            {getCombinedImages().map(
                                                (image, index) => (
                                                    <SwiperSlide key={index}>
                                                        <img
                                                            src={getFullImagePath(
                                                                image,
                                                            )}
                                                            alt={`Thumbnail ${index + 1}`}
                                                            onClick={() =>
                                                                handleThumbnailClick(
                                                                    index,
                                                                )
                                                            }
                                                            className={
                                                                index ===
                                                                activeIndex
                                                                    ? "active-thumbnail"
                                                                    : ""
                                                            }
                                                            style={{
                                                                width: "100%",
                                                                height: "100px",
                                                                objectFit:
                                                                    "cover",
                                                                cursor: "pointer",
                                                                border:
                                                                    index ===
                                                                    activeIndex
                                                                        ? "3px solid #ff6600"
                                                                        : "1px solid #ccc",
                                                                transition:
                                                                    "border 0.3s ease-in-out",
                                                            }}
                                                        />
                                                    </SwiperSlide>
                                                ),
                                            )}
                                        </Swiper>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="tf-product-info-wrap position-relative">
                                    <div className="tf-product-info-title">
                                        <h5>{product?.name}</h5>
                                    </div>
                                    {selectedColor && selectedSize ? (
                                        <div className="tf-product-info-price">
                                            {listPrice !== null &&
                                            totalPrice !== null ? (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <div
                                                        className="price-list"
                                                        style={{
                                                            marginRight: "10px",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                textDecoration:
                                                                    "line-through",
                                                                color: "#999",
                                                            }}
                                                        >
                                                            {listPrice?.toLocaleString(
                                                                "vi-VN",
                                                            )}{" "}
                                                            đ
                                                        </span>
                                                    </div>
                                                    <div className="price-on-sale">
                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    "bold",
                                                                color: "#f00",
                                                            }}
                                                        >
                                                            {totalPrice?.toLocaleString(
                                                                "vi-VN",
                                                            )}{" "}
                                                            đ
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="price-unavailable">
                                                    Giá không khả dụng
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="tf-product-info-price">
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <div
                                                    className="price-list"
                                                    style={{
                                                        marginRight: "10px",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            textDecoration:
                                                                "line-through",
                                                            color: "#999",
                                                        }}
                                                    >
                                                        {minListPrice?.toLocaleString(
                                                            "vi-VN",
                                                        )}{" "}
                                                        đ
                                                    </span>
                                                </div>
                                                <div className="price-on-sale">
                                                    <span
                                                        style={{
                                                            fontWeight: "bold",
                                                            color: "#f00",
                                                        }}
                                                    >
                                                        {minSellingPrice?.toLocaleString(
                                                            "vi-VN",
                                                        )}{" "}
                                                        đ
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <br />
                                    <div className="tf-color-selection d-flex align-items-center">
                                        <h6 style={{ marginRight: "10px" }}>
                                            Màu sắc:
                                        </h6>
                                        {selectedColorName && (
                                            <div style={{ marginLeft: "10px" }}>
                                                <h6>{selectedColorName}</h6>
                                            </div>
                                        )}
                                    </div>

                                    <div className="tf-variant-colors d-flex">
                                        {uniqueColors.map(
                                            (variant: Variant) => (
                                                <input
                                                    key={variant.id}
                                                    type="radio"
                                                    name="color"
                                                    checked={
                                                        selectedColor ===
                                                        variant.colors.name
                                                    }
                                                    onChange={() =>
                                                        handleColorChange(
                                                            variant.colors.name,
                                                        )
                                                    }
                                                    style={{
                                                        appearance: "none",
                                                        width: "30px",
                                                        height: "30px",
                                                        borderRadius: "50%",
                                                        backgroundColor:
                                                            getColorCode(
                                                                variant.colors
                                                                    .name,
                                                            ),
                                                        border:
                                                            selectedColor ===
                                                            variant.colors.name
                                                                ? "2px solid #000"
                                                                : "1px solid #ccc",
                                                        margin: "0 10px",
                                                        cursor: "pointer",
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>

                                    <div className="tf-size-selection mt-3">
                                        <h6>Kích thước:</h6>
                                        <br />
                                        <div className="tf-variant-sizes d-flex flex-wrap">
                                            {allSizes.map((sizeName, index) => (
                                                <div
                                                    key={index}
                                                    className={`size-box ${selectedSize === sizeName ? "selected" : ""}`}
                                                    onClick={() =>
                                                        handleSizeChange(
                                                            sizeName,
                                                        )
                                                    }
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "center",
                                                        alignItems: "center",
                                                        width: "40px",
                                                        height: "40px",
                                                        margin: "5px",
                                                        cursor: isSizeAvailable(
                                                            sizeName,
                                                        )
                                                            ? "pointer"
                                                            : "not-allowed",
                                                        border:
                                                            selectedSize ===
                                                            sizeName
                                                                ? "3px solid #000"
                                                                : "1px solid #ccc",
                                                        borderRadius: "5px",
                                                        textAlign: "center",
                                                        backgroundColor:
                                                            selectedSize ===
                                                            sizeName
                                                                ? "#ff6600"
                                                                : "#f9f9f9",
                                                        fontWeight: "bold",
                                                        color:
                                                            selectedSize ===
                                                            sizeName
                                                                ? "#fff"
                                                                : "#000",
                                                        opacity:
                                                            isSizeAvailable(
                                                                sizeName,
                                                            )
                                                                ? 1
                                                                : 0.5,
                                                        transition:
                                                            "background-color 0.3s ease, border 0.3s ease, opacity 0.3s ease",
                                                        pointerEvents:
                                                            isSizeAvailable(
                                                                sizeName,
                                                            )
                                                                ? "auto"
                                                                : "none",
                                                    }}
                                                >
                                                    {sizeName}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="remaining-quantity mt-3">
                                        <p>
                                            Số lượng còn lại:{" "}
                                            <strong>
                                                {selectedSize &&
                                                remainingQuantity !== null
                                                    ? remainingQuantity
                                                    : "Vui lòng chọn kích thước và màu "}
                                            </strong>
                                        </p>
                                    </div>

                                    <div className="tf-product-info-quantity mt-4">
                                        <div className="wg-quantity">
                                            <span
                                                className="btn-quantity minus-btn"
                                                onClick={() =>
                                                    handleQuantityChange(-1)
                                                }
                                            >
                                                -
                                            </span>
                                            <input
                                                type="text"
                                                value={quantity}
                                                readOnly
                                            />
                                            <span
                                                className="btn-quantity plus-btn"
                                                onClick={() =>
                                                    handleQuantityChange(1)
                                                }
                                            >
                                                +
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="tf-product-info-buy-button mt-4"
                                        style={{ textAlign: "center" }}
                                    >
                                        <button
                                            className="tf-btn btn-fill"
                                            style={{
                                                width: "60%",
                                                margin: "0 auto",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                height: "50px",
                                            }}
                                            onClick={handleAddToCart}
                                        >
                                            Thêm vào giỏ hàng
                                        </button>
                                    </div>

                                    <div className="tf-product-info-buy-now-button mt-3">
                                        <button
                                            className="btns-full btn-buy-now"
                                            onClick={handleBuyNow}
                                            style={{
                                                backgroundColor: "#FFA500",
                                                color: "#fff",
                                                padding: "15px 0",
                                                width: "100%",
                                                textAlign: "center",
                                                display: "block",
                                                fontSize: "18px",
                                                borderRadius: "5px",
                                                marginTop: "20px",
                                            }}
                                        >
                                            Mua ngay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr />
                        <div
                            className="tf-product-description mt-4"
                            style={{
                                fontSize: "18px",
                                padding: "20px",
                                lineHeight: "1.6",
                                backgroundColor: "#f9f9f9",
                                borderRadius: "8px",
                            }}
                        >
                            <h5
                                style={{
                                    fontSize: "24px",
                                    marginBottom: "16px",
                                }}
                            >
                                Mô tả sản phẩm
                            </h5>
                            <p style={{ fontSize: "18px" }}>
                                {product?.description}
                            </p>
                        </div>

                        <hr />
                        <div className="flat-tab-store flat-animate-tab overflow-unset">
                            <ul
                                className="widget-tab-3 d-flex justify-content-center flex-wrap wow fadeInUp"
                                data-wow-delay="0s"
                                role="tablist"
                            >
                                <li
                                    className="nav-tab-item"
                                    role="presentation"
                                >
                                    <a
                                        href="#related-products"
                                        className="active"
                                        data-bs-toggle="tab"
                                    >
                                        Sản phẩm liên quan
                                    </a>
                                </li>
                            </ul>
                            <div className="tab-content">
                                <div
                                    className="tab-pane active show"
                                    id="related-products"
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

                                                {/* Sử dụng Swiper để tạo slider */}
                                                <Swiper
                                                    modules={[Navigation]}
                                                    spaceBetween={20}
                                                    slidesPerView={3}
                                                    navigation={{
                                                        nextEl: ".swiper-button-next",
                                                        prevEl: ".swiper-button-prev",
                                                    }}
                                                    loop={true}
                                                >
                                                    {relatedProducts.length >
                                                    0 ? (
                                                        relatedProducts.map(
                                                            (
                                                                relatedProduct,
                                                            ) => (
                                                                <SwiperSlide
                                                                    key={
                                                                        relatedProduct.id
                                                                    }
                                                                >
                                                                    <div className="card-product">
                                                                        <div className="card-product-wrapper">
                                                                            <Link
                                                                                to={`/detail/${relatedProduct.id}`}
                                                                            >
                                                                                <img
                                                                                    src={getFullImagePath(
                                                                                        relatedProduct.thumbnail,
                                                                                    )}
                                                                                    alt={
                                                                                        relatedProduct.name
                                                                                    }
                                                                                    style={{
                                                                                        width: "600px",
                                                                                        height: "450px",
                                                                                        objectFit:
                                                                                            "cover",
                                                                                    }}
                                                                                />
                                                                            </Link>
                                                                        </div>
                                                                        <div className="card-product-info text-center">
                                                                            <Link
                                                                                to={`/detail/${relatedProduct.id}`}
                                                                                className="title link"
                                                                            >
                                                                                {
                                                                                    relatedProduct.name
                                                                                }
                                                                            </Link>
                                                                            {relatedProduct
                                                                                .variant
                                                                                .length >
                                                                                0 && (
                                                                                <div>
                                                                                    <span className="price">
                                                                                        <span
                                                                                            style={{
                                                                                                textDecoration:
                                                                                                    "line-through",
                                                                                                color: "#999",
                                                                                                marginRight:
                                                                                                    "10px",
                                                                                            }}
                                                                                        >
                                                                                            {relatedProduct.variant[0].list_price.toLocaleString(
                                                                                                "vi-VN",
                                                                                            )}{" "}
                                                                                            đ
                                                                                        </span>
                                                                                        <span
                                                                                            style={{
                                                                                                color: "#f00",
                                                                                                fontWeight:
                                                                                                    "bold",
                                                                                            }}
                                                                                        >
                                                                                            {relatedProduct.variant[0].selling_price.toLocaleString(
                                                                                                "vi-VN",
                                                                                            )}{" "}
                                                                                            đ
                                                                                        </span>
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </SwiperSlide>
                                                            ),
                                                        )
                                                    ) : (
                                                        <div>
                                                            Không có sản phẩm
                                                            liên quan
                                                        </div>
                                                    )}
                                                </Swiper>
                                            </div>
                                        </div>

                                        <div className="sw-dots style-2 sw-pagination-sell-1 justify-content-center"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Detail;
