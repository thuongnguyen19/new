import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Card, Spin } from "antd";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [messageAPI, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    // Kiểm tra xem thông tin đã được lưu vào localStorage hay chưa
    useEffect(() => {
        const name = localStorage.getItem("name");
        const email = localStorage.getItem("email");
        const password = localStorage.getItem("password");

        if (name && email && password) {
            console.log("Đã lưu thông tin vào localStorage:", {
                name,
                email,
                password,
            });
        } else {
            console.log("Chưa có thông tin nào được lưu vào localStorage.");
        }
    }, []);

    // Xử lý đăng ký
    const { mutate } = useMutation({
        mutationFn: (user) =>
            axios.post(`http://localhost:8000/api/register`, user, {
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        onSuccess: (response) => {
            const { token, role } = response.data.data; // Lấy token và role từ phản hồi API

            localStorage.setItem("authToken", token);
            localStorage.setItem("userRole", role.toString());

            queryClient.invalidateQueries({
                queryKey: ["products"],
            });

            messageAPI.success("Đăng ký thành công!");

            setTimeout(() => {
                navigate(`/`); // Điều hướng đến trang chủ người dùng
            }, 2000);
        },
        onError: (error) => {
            const errors = error.response?.data?.errors || {};
            if (errors.email) {
                messageAPI.error(errors.email[0]);
            } else if (errors.password) {
                messageAPI.error(errors.password[0]);
            } else {
                messageAPI.error("Đăng ký không thành công. Vui lòng thử lại.");
            }
        },
        onSettled: () => {
            setLoading(false);
        },
    });

    const onFinish = (values) => {
        setLoading(true);
        // Lưu các giá trị từ form vào localStorage
        localStorage.setItem("name", values.name);
        localStorage.setItem("email", values.email);
        localStorage.setItem("password", values.password);

        // Gọi API đăng ký và lưu token, role khi đăng ký thành công
        mutate({
            name: values.name,
            email: values.email,
            password: values.password,
            password_confirmation: values.confirmPassword, // Laravel yêu cầu password confirmation
        });
    };

    const onFinishFailed = () => {
        messageAPI.error("Vui lòng kiểm tra đầu vào của bạn.");
    };

    return (
        <>
            {contextHolder}
            <div className="register-container">
                <Card
                    className="register-card"
                    title="Đăng kí tài khoản"
                    bordered={false}
                >
                    <Spin spinning={loading}>
                        <Form
                            name="register"
                            layout="vertical"
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                        >
                            <Form.Item
                                label="Tên"
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tên!",
                                    },
                                    {
                                        min: 2,
                                        message: "Tên phải có ít nhất 2 ký tự!",
                                    },
                                ]}
                            >
                                <Input className="custom-input" />
                            </Form.Item>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập email!",
                                    },
                                    {
                                        type: "email",
                                        message: "Viết đúng định dạng email!",
                                    },
                                ]}
                            >
                                <Input className="custom-input" />
                            </Form.Item>

                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập mật khẩu!",
                                    },
                                    {
                                        min: 8,
                                        message:
                                            "Mật khẩu phải có ít nhất 8 ký tự!",
                                    },
                                ]}
                                hasFeedback
                            >
                                <Input.Password className="custom-input" />
                            </Form.Item>

                            <Form.Item
                                label="Nhập lại mật khẩu"
                                name="confirmPassword"
                                dependencies={["password"]}
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập lại mật khẩu!",
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (
                                                !value ||
                                                getFieldValue("password") ===
                                                    value
                                            ) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(
                                                new Error(
                                                    "Mật khẩu không khớp!",
                                                ),
                                            );
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password className="custom-input" />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="custom-btn"
                                    disabled={loading}
                                >
                                    Đăng kí
                                </Button>
                            </Form.Item>

                            <Form.Item>
                                <div className="login-redirect">
                                    Đã có tài khoản?{" "}
                                    <Link to="/login">Đăng nhập</Link>
                                </div>
                            </Form.Item>
                        </Form>
                    </Spin>
                </Card>
            </div>
        </>
    );
};

export default Register;
