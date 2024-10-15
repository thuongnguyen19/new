import axiosInstance from "../configs/axios";

export interface Product {
    id: number;
    name: string;
    thumbnail: string;
    variants: Array<{
        id_product: number;
        selling_price: number;
        list_price: number;
    }>;
}

// Hàm lấy sản phẩm với lọc, sắp xếp và phân trang
export const fetchProducts = async (
    sortBy: string,
    sortOrder: string,
    id_category: string | number, // thêm id_category để lọc theo danh mục
    search: string, // thêm tìm kiếm theo tên sản phẩm
    page: number,
    perPage: number,
): Promise<{ data: Product[]; total_pages: number }> => {
    const response = await axiosInstance.get<{
        data: Product[];
        total_pages: number;
    }>("/products", {
        params: {
            sort_by: sortBy, // Sắp xếp theo tên hoặc giá
            sort: sortOrder, // Thứ tự tăng dần hoặc giảm dần
            id_category: id_category, // Lọc theo danh mục
            search: search, // Tìm kiếm sản phẩm theo tên
            page: page, // Trang hiện tại
            per_page: perPage, // Số sản phẩm trên mỗi trang
        },
    });

    return response.data; // Đảm bảo trả về đúng cấu trúc dữ liệu
};
