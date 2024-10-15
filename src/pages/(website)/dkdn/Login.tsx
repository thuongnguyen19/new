import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Form, Input, message, Spin } from "antd";
import axios from "axios";

type FieldType = {
    email: string;
    password: string;
};

const Login: React.FC = () => {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [messageAPI, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const { mutate } = useMutation({
        mutationFn: (user: FieldType) =>
            axios.post(`http://localhost:8000/api/login`, user),
        onSuccess: (response) => {
            const { token, role, user } = response.data.data; 
            const numericRole = Number(role);

            if (numericRole === 1 ) {
                localStorage.setItem("authToken", token);
                localStorage.setItem("userRole", numericRole.toString());

                localStorage.setItem("user", JSON.stringify(user));

                queryClient.invalidateQueries({
                    queryKey: ["cartItems"], 
                });

                messageAPI.success("Đăng nhập thành công!");

                // Điều hướng tới trang giỏ hàng sau khi đăng nhập thành công
                navigate("/");
            } else {
                messageAPI.error("Vai trò không hợp lệ.");
            }
        },
        onError: () => {
            messageAPI.error("Sai mật khẩu hoặc tài khoản không tồn tại.");
        },
        onSettled: () => {
            setLoading(false);
        },
    });

    const onFinish = (values: FieldType) => {
        setLoading(true);
        mutate(values);
    };

    const onFinishFailed = () => {
        messageAPI.error("Vui lòng kiểm tra đầu vào của bạn.");
    };

    return (
        <>
            {contextHolder}
            <div className="login-page">
                <div className="register-container">
                    <Card
                        className="register-card"
                        title="Đăng nhập tài khoản"
                        bordered={false}
                    >
                        <Spin spinning={loading}>
                            <Form
                                name="login"
                                layout="vertical"
                                initialValues={{ remember: true }}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            >
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
                                            message:
                                                "Vui lòng nhập đúng định dạng email!",
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
                                            message: "Vui lòng điền mật khẩu!",
                                        },
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
                                        style={{
                                            width: "100%",
                                            backgroundColor: "#1890ff",
                                            borderColor: "#1890ff",
                                        }}
                                    >
                                        Đăng Nhập
                                    </Button>
                                </Form.Item>
                            </Form>
                            <div style={{ textAlign: "center", marginTop: 10 }}>
                                <span>Bạn chưa có tài khoản? </span>
                                <Link to="/register" style={{ color: "blue" }}>
                                    Đăng ký ngay
                                </Link>
                            </div>
                        </Spin>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Login;
