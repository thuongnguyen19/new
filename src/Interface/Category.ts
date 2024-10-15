import axiosInstance from "../configs/axios";

export interface Category {
    id: number;
  name: string;
}

export const fetchCategorys = async (): Promise<Category[]> => {
  const response = await axiosInstance.get<Category[]>("/category");
  return response.data;
};