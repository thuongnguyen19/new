import axiosInstance from "../configs/axios";
export interface ProductsNew{
  id: number;
  name: string;
  thumbnail: string;
  variants: Array<{
    id_product: number;
    selling_price: number;
    list_price: number;
  }>;
}

export const fetchProductsNew = async (): Promise<ProductsNew[]> => {
  const response = await axiosInstance.get<ProductsNew[]>("/products/new");
  return response.data;
};