import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Layoutweb from "../layouts/ClientLayout";
import Register from "../pages/(website)/dkdn/Register";
import Login from "../pages/(website)/dkdn/Login";
import { LogOut } from "lucide-react";
import ListCart from "../pages/(website)/Cart/ListCart";
import Detail from "../pages/(website)/Details/Detail";
import Od_Detail from "../pages/(website)/History/Od_Detail";
import OdHistory from "../pages/(website)/History/OdHistory";
import Pay from "../pages/(website)/Pay/Pay";
import Success from "../pages/(website)/Pay/Success";
import ListProducts from "../pages/(website)/listProducts/ListProducts";
import Profile from "../layouts/profile";
import OrderHistory from "../pages/(website)/History/OdHistory";
import ProductList from "../pages/(website)/listProducts/Filter";
import { useEffect } from "react";
import ListComments from "../pages/(website)/Comments/ListComments";
import Coupons from "../pages/(website)/Pay/Coupons";
import Favorite from "../pages/(website)/Details/favorite";

const Router = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const authToken = localStorage.getItem("authToken");

        if (
            authToken &&
            (location.pathname === "/login" ||
                location.pathname === "/register")
        ) {
            navigate("/");
        }
    }, [navigate, location.pathname]);
    return (
        <>
            <Routes>
                <Route path="/profile" element={<Profile />}>
                    <Route path="od_histori" element={<OrderHistory />} />{" "}
                    <Route path="coupons" element={<Coupons />} />{" "}
                    <Route
                        path="od_histori/od_detail/:id"
                        element={<Od_Detail />}
                    />
                    <Route path="comment/:id" element={<ListComments />} />
                </Route>

                <Route path="/" element={<Layoutweb />}></Route>
                <Route path="cart" element={<ListCart />} />
                <Route path="favorite" element={< Favorite />} />

                <Route path="detail/:id" element={<Detail />} />
                <Route path="od_detail" element={<Od_Detail />} />
                <Route path="od_histori" element={<OdHistory />} />
                <Route path="comment" element={<ListComments />} />
                <Route path="pay" element={<Pay />} />
                <Route path="success" element={<Success />} />
                <Route path="products" element={<ListProducts />} />
                <Route path="pricefilter" element={<ProductList />} />
                <Route path="register" element={<Register />} />
                <Route path="login" element={<Login />} />
                <Route path="logout" element={<LogOut />} />
            </Routes>
        </>
    );
};

export default Router;
