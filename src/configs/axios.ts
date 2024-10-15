import axios from "axios";

// const instance = axios.create({
//     baseURL: "http://localhost:3000",
// });
const axiosInstance = axios.create({

    baseURL: "http://localhost:8000/api", // URL API của Laravel
});
export default axiosInstance;