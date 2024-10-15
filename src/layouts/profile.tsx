import React, { useEffect, useState } from "react";
import { Modal, message } from "antd";
import { useNavigate, Link, useLocation, Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const Profile = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const [messageAPI, contextHolder] = message.useMessage();
    const [user, setUser] = useState<{ name: string } | null>(null); // User state to store user's name
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth state

    // Fetch user data when component mounts
    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (token) {
            setIsAuthenticated(true);

            // Fetch user data from API using the token
            axios
                .get("http://localhost:8000/api/user", {
                    headers: {
                        Authorization: `Bearer ${token}`, // Sending the token to authorize the request
                    },
                })
                .then((response) => {
                    if (response.data.user && response.data.user.name) {
                        setUser(response.data.user); // Store user data, particularly the name
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                });
        }
    }, []);

    // Handle logout functionality
    const handleLogout = () => {
        Modal.confirm({
            title: "Xác nhận",
            content: "Bạn có muốn đăng xuất không?",
            okText: "Đăng xuất",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const token = localStorage.getItem("authToken");

                    // Call API to log out
                    await axios.post(
                        "http://localhost:8000/api/logout",
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    );

                    // Remove token from localStorage and clear cache
                    localStorage.removeItem("authToken");
                    queryClient.clear();
                    messageAPI.success("Đã đăng xuất thành công!");

                    setTimeout(() => {
                        navigate("/login");
                    }, 1000);
                } catch (error) {
                    messageAPI.error(
                        "Đăng xuất không thành công. Vui lòng thử lại.",
                    );
                }
            },
        });
    };

    const pageTitle = location.pathname.includes("od_histori")
        ? "Lịch sử đơn hàng của bạn"
        : `Bảng điều khiển của ${user?.name || "người dùng"}`;

    return (
        <div>
            <Header />
            {contextHolder}
            <div className="col-xl-3 col-md-4 col-3">
                <ul className="nav-icon d-flex justify-content-end align-items-center gap-20">
                    <li className="nav-search">
                        <a
                            href="#canvasSearch"
                            data-bs-toggle="offcanvas"
                            aria-controls="offcanvasLeft"
                            className="nav-icon-item"
                        >
                            <i className="icon icon-search"></i>
                        </a>
                    </li>
                    <li className="nav-account">
                        <a
                            href="#login"
                            data-bs-toggle="modal"
                            className="nav-icon-item"
                        >
                            <i className="icon icon-account"></i>
                        </a>
                    </li>
                </ul>
            </div>
            <div className="tf-page-title">
                <div className="container-full">
                    <div className="heading text-center">{pageTitle}</div>
                </div>
            </div>
            <section className="flat-spacing-11">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3">
                            <ul className="my-account-nav">
                                <li>
                                    <Link
                                        to="/profile"
                                        className={`my-account-nav-item ${location.pathname === "/profile" ? "active" : ""}`}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {user?.name
                                            ? `Bảng điều khiển của ${user.name}`
                                            : "Bảng điều khiển người dùng"}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="od_histori"
                                        className={`my-account-nav-item ${location.pathname.includes("od_histori") ? "active" : ""}`}
                                        style={{ cursor: "pointer" }}
                                    >
                                        Đơn hàng
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="my-account-address.html"
                                        className="my-account-nav-item"
                                    >
                                        Địa chỉ
                                    </a>
                                </li>
                                <li>
                                    <a
                                        onClick={handleLogout}
                                        className="my-account-nav-item"
                                        style={{ cursor: "pointer" }}
                                    >
                                        Đăng xuất
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-lg-9">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Profile;