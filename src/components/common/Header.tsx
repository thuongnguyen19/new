import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    SearchOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    MenuOutlined,
    CaretDownOutlined,
} from "@ant-design/icons";
import { Category, fetchCategorys } from "../../Interface/Category";

const Header: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true); 
    const [cartCount, setCartCount] = useState<number>(0); 
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); 

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategorys(); 
                setCategories(data);
            } catch (error) {
                console.error("Lỗi khi tải danh mục sản phẩm:", error);
            }
            setLoading(false);
        };

        const fetchCartCount = () => {
            const cartData = localStorage.getItem("cartItems");
            if (cartData) {
                setCartCount(JSON.parse(cartData).length); 
            }
        };

        const token = localStorage.getItem("authToken");
        if (token) {
            setIsLoggedIn(true);
        }

        loadCategories(); 
        fetchCartCount(); 

        window.addEventListener("storage", fetchCartCount);

        return () => {
            window.removeEventListener("storage", fetchCartCount);
        };
    }, []);

   

    return (
        <header id="header" className="header-default">
            <div className="px_15 lg-px_40">
                <div className="row wrapper-header align-items-center">
                    <div className="col-md-4 col-3 tf-lg-hidden">
                        <a
                            href="#mobileMenu"
                            data-bs-toggle="offcanvas"
                            aria-controls="offcanvasLeft"
                        >
                            <MenuOutlined style={{ fontSize: "24px" }} />
                        </a>
                    </div>

                    <div className="col-xl-3 col-md-4 col-6">
                        <Link to="/" className="logo-header">
                            <img
                                src="images/logo/logo@2x.png"
                                alt="logo"
                                className="logo"
                            />
                        </Link>
                    </div>

                    <div className="col-xl-6 tf-md-hidden">
                        <nav className="box-navigation text-center">
                            <ul className="box-nav-ul d-flex align-items-center justify-content-center gap-30">
                                <li className="menu-item">
                                    <Link to="/" className="item-link">
                                        Trang chủ
                                    </Link>
                                </li>
                                <li className="menu-item">
                                    <a href="#" className="item-link">
                                        Danh mục <CaretDownOutlined />
                                    </a>
                                    <div className="sub-menu submenu-default">
                                        <ul className="menu-list">
                                            {categories.map((category) => (
                                                <li key={category.id}>
                                                    <Link
                                                        to={`/category/${category.id}`}
                                                    >
                                                        {category.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                                <li className="menu-item">
                                    <Link to="/products" className="item-link">
                                        Sản phẩm
                                    </Link>
                                </li>
                                <li className="menu-item">
                                    <Link to="/about-us" className="item-link">
                                        Về chúng tôi
                                    </Link>
                                </li>
                                <li className="menu-item">
                                    <Link to="/contact" className="item-link">
                                        Liên hệ
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    <div className="col-xl-3 col-md-4 col-3">
                        <ul className="nav-icon d-flex justify-content-end align-items-center gap-20">
                            <li className="nav-search">
                                <a
                                    href="#canvasSearch"
                                    data-bs-toggle="offcanvas"
                                    aria-controls="offcanvasLeft"
                                    className="nav-icon-item"
                                >
                                    <SearchOutlined
                                        style={{ fontSize: "24px" }}
                                    />
                                </a>
                            </li>

                            <li className="nav-user">
                                <Link
                                    to={isLoggedIn ? "/profile" : "/login"}
                                    className="nav-icon-item"
                                >
                                    <UserOutlined
                                        style={{ fontSize: "24px" }}
                                    />
                                </Link>
                            </li>

                            <li className="nav-cart">
                                <Link to="/cart" className="nav-icon-item">
                                    <ShoppingCartOutlined
                                        style={{ fontSize: "24px" }}
                                    />
                                    <span className="count-box">
                                        {cartCount}
                                    </span>
                                </Link>
                            </li>

                          
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
