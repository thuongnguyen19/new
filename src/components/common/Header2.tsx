import React from "react";
import { Carousel } from "antd"; // Import Carousel từ Ant Design

const Header2 = () => {
    return (
        <div>
            <style>
                {`
                    .carousel-container {
                        position: relative;
                        margin: 0; /* Loại bỏ khoảng cách */
                        padding: 0;
                        left: 50%;
                        right: 50%;
                        transform: translateX(-50%); /* Đảm bảo slider nằm chính giữa */
                    }

                    .carousel-image {
                        width: 100%; /* Chiếm toàn bộ chiều rộng của khung chứa */
                        height: 500px; /* Đặt chiều cao cố định cho tất cả ảnh */
                        object-fit: cover; /* Cắt ảnh để giữ đúng tỉ lệ nhưng bao phủ toàn bộ khung */
                    }

                    .custom-dots {
                        bottom: 20px; /* Tùy chỉnh vị trí của dấu chấm */
                    }

                    .wrap-slider {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden; /* Đảm bảo hình ảnh không vượt ra ngoài khung */
                        width: 100%;
                        height: 800px; /* Đảm bảo tất cả khung chứa ảnh có cùng chiều cao */
                    }
                `}
            </style>

            <div className="carousel-container">
                <Carousel
                    autoplay
                    dots={{ className: "custom-dots" }}
                    arrows={true} // Hiển thị nút để người dùng chuyển slide thủ công
                    autoplaySpeed={3000} // Chuyển slide sau mỗi 3 giây
                >
                    {/* Slide 1 */}
                    <div className="wrap-slider">
                        <img
                            src="https://theme.hstatic.net/200000061680/1000549213/14/ms_banner_img3.jpg?v=1348"
                            alt="Slide 1"
                            loading="lazy"
                            className="carousel-image"
                        />
                    </div>

                    {/* Slide 2 */}
                    <div className="wrap-slider">
                        <img
                            src="https://file.hstatic.net/1000381168/collection/1920x820px_0a49db5dd4d141b2847493aecbda1d78.jpg"
                            alt="Slide 2"
                            loading="lazy"
                            className="carousel-image"
                        />
                    </div>

                    {/* Slide 3 */}
                    <div className="wrap-slider">
                        <img
                            src="https://i.pinimg.com/564x/ea/d0/9a/ead09abee4a914c5e1536f6c60f75604.jpg"
                            alt="Slide 3"
                            loading="lazy"
                            className="carousel-image"
                        />
                    </div>

                    {/* Slide 4 */}
                    <div className="wrap-slider">
                        <img
                            src="https://huythanhjewelry.vn/storage/photos/uploads/banner-cnc-03_1726623182.jpg"
                            alt="Slide 4"
                            loading="lazy"
                            className="carousel-image"
                        />
                    </div>

                    {/* Slide 5 */}
                    <div className="wrap-slider">
                        <img
                            src="https://glosbejewelry.net/upload/image/banner-web-chao-he-glosbe.jpg"
                            alt="Slide 5"
                            loading="lazy"
                            className="carousel-image"
                        />
                    </div>
                </Carousel>
            </div>
        </div>
    );
};

export default Header2;
