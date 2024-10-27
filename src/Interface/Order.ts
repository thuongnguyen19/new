import axiosInstance from "../configs/axios";

export interface Order {
    id: number;
    recipient_name: string;
    email: string;
    phone_number: string;
    recipient_address: string;
    created_at: string;
    status: string;
    updated_at: string;
    payment_role: number;
    status_payment: number;
    total_payment: number;
    order_detail: Array<{
        id: number;
        id_oder: number;
        id_product: number;
        id_variant: number;
        selling_price: number;
        list_price: number;
        product_name: string;
        product_image: string;
        quantity: number;
        product_variant: Variant;
    }>;
}

export interface Variant {
    color: {
        id: number;
        name: string;
    };
    size: {
        id: number;
        name: string;
    };
}

export interface Review {
    id_product: number;
    id_variant: number;
    content: string;
    rating: number;
}

export const fetchOrders = async (
    page: number,
    perPage: number,
): Promise<{ data: Order[]; total_pages: number }> => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        throw new Error("No token found");
    }

    const response = await axiosInstance.get<{
        data: Order[];
        total_pages: number;
    }>("/purchasedOrders", {
        params: {
            page: page, // Trang hiện tại
            per_page: perPage, // Số sản phẩm trên mỗi trang
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

// Hàm gọi API để lấy danh sách đánh giá (reviews)
export const submitReview = async (
    id_order: number,
    id_variant: number,
    id_product: number,
    content: string,
    rating: number,
): Promise<{ data: Review }> => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        throw new Error("No token found");
    }

    const response = await axiosInstance.post<{ data: Review }>(
        "/addCommentProduct",
        {
            id_order: id_order,
            id_product: id_product,
            id_variant: id_variant,
            content: content,
            rating: rating,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return response.data;
};
