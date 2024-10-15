import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { message } from "antd";

const Logout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [messageAPI, contextHolder] = message.useMessage();

    useEffect(() => {
        const handleLogout = () => {
            localStorage.removeItem("authToken");

            queryClient.clear();

            messageAPI.success("Đã đăng xuất thành công!");

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        };

        messageAPI.info("Đang đăng xuất...");
        handleLogout();
    }, [navigate, queryClient, messageAPI]);

    return (
        <>
            {contextHolder}
            <div>Đang đăng xuất...</div>
        </>
    );
};

export default Logout;
