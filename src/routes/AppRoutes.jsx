// import { Route, Routes } from "react-router-dom";

// import MainLayout from "../layouts/MainLayout/MainLayout";
// import AuthLayout from "../layouts/AuthLayout/AuthLayout";

// import ProtectedRoute from "./ProtectedRoute";
// import GuestRoute from "./GuestRoute";
// import AdminRoute from "./AdminRoute";

// import Home from "../pages/Home/Home";
// import Shop from "../pages/Shop/Shop";
// import SearchResults from "../pages/Search/SearchResults";
// import CategoryProducts from "../pages/Category/CategoryProducts";
// import ProductDetails from "../pages/Product/ProductDetails";
// import Cart from "../pages/Cart/Cart";
// import Wishlist from "../pages/Wishlist/Wishlist";
// import Contact from "../pages/Contact/Contact";

// import Login from "../pages/Auth/Login";
// import Register from "../pages/Auth/Register";
// import VerifyAccount from "../pages/Auth/VerifyAccount";
// import ForgotPassword from "../pages/Auth/ForgotPassword";
// import ResetPassword from "../pages/Auth/ResetPassword";

// import Account from "../pages/Account/Account";
// import Profile from "../pages/Account/Profile";
// import Orders from "../pages/Account/Orders";
// import Addresses from "../pages/Account/Addresses";
// import AccountWishlist from "../pages/Account/Wishlist";
// import AccountSettings from "../pages/Account/AccountSettings";

// import Checkout from "../pages/Checkout/Checkout";

// import AdminLayout from "../pages/Admin/AdminLayout/AdminLayout";
// import Dashboard from "../pages/Admin/Dashboard/Dashboard";
// import Products from "../pages/Admin/Products/Products";
// import ProductForm from "../pages/Admin/Products/ProductForm";
// import Categories from "../pages/Admin/Categories/Categories";
// import CategoryForm from "../pages/Admin/Categories/CategoryForm";
// import Users from "../pages/Admin/Users/Users";
// import UserDetails from "../pages/Admin/Users/UserDetails";
// import AdminOrders from "../pages/Admin/Orders/Orders";
// import Reviews from "../pages/Admin/Reviews/Reviews";
// import Coupons from "../pages/Admin/Coupons/Coupons";
// import CouponForm from "../pages/Admin/Coupons/CouponForm";

// function NotFound() {
//   return (
//     <div
//       style={{
//         minHeight: "60vh",
//         padding: "80px 20px",
//         display: "grid",
//         placeItems: "center",
//         textAlign: "center",
//       }}
//     >
//       <div>
//         <h1>Page Not Found</h1>

//         <p>
//           The page you are looking for does not exist.
//         </p>
//       </div>
//     </div>
//   );
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       {/* Store routes */}
//       <Route element={<MainLayout />}>
//         <Route
//           path="/"
//           element={<Home />}
//         />

//         <Route
//           path="/shop"
//           element={<Shop />}
//         />

//         <Route
//           path="/search"
//           element={<SearchResults />}
//         />

//         <Route
//           path="/category/:slug"
//           element={<CategoryProducts />}
//         />

//         <Route
//           path="/product/:id"
//           element={<ProductDetails />}
//         />

//         <Route
//           path="/contact"
//           element={<Contact />}
//         />

//         {/* Customer protected routes */}
//         <Route element={<ProtectedRoute />}>
//           <Route
//             path="/cart"
//             element={<Cart />}
//           />

//           <Route
//             path="/wishlist"
//             element={<Wishlist />}
//           />

//           <Route
//             path="/checkout"
//             element={<Checkout />}
//           />

//           <Route
//             path="/account"
//             element={<Account />}
//           >
//             <Route
//               index
//               element={<Profile />}
//             />

//             <Route
//               path="profile"
//               element={<Profile />}
//             />

//             <Route
//               path="orders"
//               element={<Orders />}
//             />

//             <Route
//               path="addresses"
//               element={<Addresses />}
//             />

//             <Route
//               path="wishlist"
//               element={<AccountWishlist />}
//             />

//             <Route
//               path="settings"
//               element={<AccountSettings />}
//             />
//           </Route>
//         </Route>
//       </Route>

//       {/* Guest authentication routes */}
//       <Route element={<GuestRoute />}>
//         <Route element={<AuthLayout />}>
//           <Route
//             path="/login"
//             element={<Login />}
//           />

//           <Route
//             path="/register"
//             element={<Register />}
//           />

//           <Route
//             path="/verify-account"
//             element={<VerifyAccount />}
//           />

//           <Route
//             path="/forgot-password"
//             element={<ForgotPassword />}
//           />

//           <Route
//             path="/reset-password"
//             element={<ResetPassword />}
//           />
//         </Route>
//       </Route>

//       {/* Admin routes */}
//       <Route element={<AdminRoute />}>
//         <Route
//           path="/admin"
//           element={<AdminLayout />}
//         >
//           <Route
//             index
//             element={<Dashboard />}
//           />

//           {/* Products */}
//           <Route
//             path="products"
//             element={<Products />}
//           />

//           <Route
//             path="products/new"
//             element={<ProductForm />}
//           />

//           <Route
//             path="products/:id/edit"
//             element={<ProductForm />}
//           />

//           {/* Categories */}
//           <Route
//             path="categories"
//             element={<Categories />}
//           />

//           <Route
//             path="categories/new"
//             element={<CategoryForm />}
//           />

//           <Route
//             path="categories/:id/edit"
//             element={<CategoryForm />}
//           />

//           {/* Users */}
//           <Route
//             path="users"
//             element={<Users />}
//           />

//           <Route
//             path="users/:id"
//             element={<UserDetails />}
//           />

//           {/* Orders */}
//           <Route
//             path="orders"
//             element={<AdminOrders />}
//           />

//           {/* Reviews */}
//           <Route
//             path="reviews"
//             element={<Reviews />}
//           />

//           {/* Coupons */}
//           <Route
//             path="coupons"
//             element={<Coupons />}
//           />

//           <Route
//             path="coupons/new"
//             element={<CouponForm />}
//           />

//           <Route
//             path="coupons/:id/edit"
//             element={<CouponForm />}
//           />
//         </Route>
//       </Route>

//       {/* 404 */}
//       <Route
//         path="*"
//         element={<NotFound />}
//       />
//     </Routes>
//   );
// }

// export default AppRoutes;

import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout/MainLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import AdminRoute from "./AdminRoute";

import Home from "../pages/Home/Home";
import Shop from "../pages/Shop/Shop";
import SearchResults from "../pages/Search/SearchResults";
import CategoryProducts from "../pages/Category/CategoryProducts";
import ProductDetails from "../pages/Product/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Wishlist from "../pages/Wishlist/Wishlist";
import Contact from "../pages/Contact/Contact";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyAccount from "../pages/Auth/VerifyAccount";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

import Account from "../pages/Account/Account";
import Profile from "../pages/Account/Profile";
import Orders from "../pages/Account/Orders";
import Addresses from "../pages/Account/Addresses";
import AccountWishlist from "../pages/Account/Wishlist";
import AccountSettings from "../pages/Account/AccountSettings";

import Checkout from "../pages/Checkout/Checkout";

import OrderDetails from "../pages/Order/OrderDetails";
import OrderPayment from "../pages/Order/OrderPayment";
import OrderSuccess from "../pages/Order/OrderSuccess";
import OrderTracking from "../pages/Order/OrderTracking";

import AdminLayout from "../pages/Admin/AdminLayout/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard/Dashboard";
import Products from "../pages/Admin/Products/Products";
import AdminProductDetails from "../pages/Admin/Products/ProductDetails";
import ProductForm from "../pages/Admin/Products/ProductForm";
import Categories from "../pages/Admin/Categories/Categories";
import CategoryForm from "../pages/Admin/Categories/CategoryForm";
import Users from "../pages/Admin/Users/Users";
import UserDetails from "../pages/Admin/Users/UserDetails";
import AdminOrders from "../pages/Admin/Orders/Orders";
import Reviews from "../pages/Admin/Reviews/Reviews";
import AdminOrderDetails from "../pages/Admin/Orders/OrderDetails";

import Coupons from "../pages/Admin/Coupons/Coupons";
import CouponForm from "../pages/Admin/Coupons/CouponForm";
import CouponDetails from "../pages/Admin/Coupons/CouponDetails";

import Offers from "../pages/Admin/Offers/Offers";
import OfferForm from "../pages/Admin/Offers/OfferForm";
import OfferDetails from "../pages/Admin/Offers/OfferDetails/OfferDetails";

function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        padding: "80px 20px",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <div>
        <h1>Page Not Found</h1>

        <p>The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />

        <Route path="/search" element={<SearchResults />} />

        <Route path="/category/:slug" element={<CategoryProducts />} />

        <Route path="/product/:id" element={<ProductDetails />} />

        <Route path="/contact" element={<Contact />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />

          <Route path="/wishlist" element={<Wishlist />} />

          <Route path="/checkout" element={<Checkout />} />

          <Route path="/order/success" element={<OrderSuccess />} />

          <Route path="/order/:orderId/payment" element={<OrderPayment />} />

          <Route path="/order/:orderId/tracking" element={<OrderTracking />} />

          <Route path="/order/:orderId" element={<OrderDetails />} />

          <Route path="/account" element={<Account />}>
            <Route index element={<Profile />} />

            <Route path="profile" element={<Profile />} />

            <Route path="orders" element={<Orders />} />

            <Route path="orders/:orderId" element={<OrderDetails />} />

            <Route path="orders/:orderId/payment" element={<OrderPayment />} />

            <Route
              path="orders/:orderId/tracking"
              element={<OrderTracking />}
            />

            <Route path="addresses" element={<Addresses />} />

            <Route path="wishlist" element={<AccountWishlist />} />

            <Route path="settings" element={<AccountSettings />} />
          </Route>
        </Route>
      </Route>

      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/verify-account" element={<VerifyAccount />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="products" element={<Products />} />

          <Route path="products/new" element={<ProductForm />} />

          <Route path="products/:id" element={<AdminProductDetails />} />

          <Route path="products/:id/edit" element={<ProductForm />} />

          <Route path="categories" element={<Categories />} />

          <Route path="categories/new" element={<CategoryForm />} />

          <Route path="categories/:id/edit" element={<CategoryForm />} />

          <Route path="users" element={<Users />} />

          <Route path="users/:id" element={<UserDetails />} />

          <Route path="orders" element={<AdminOrders />} />

          <Route path="orders/:id" element={<AdminOrderDetails />} />

          <Route path="reviews" element={<Reviews />} />

          <Route path="coupons" element={<Coupons />} />

          <Route path="coupons/new" element={<CouponForm />} />

          <Route path="coupons/:id" element={<CouponDetails />} />

          <Route path="coupons/:id/edit" element={<CouponForm />} />

          <Route path="offers" element={<Offers />} />

          <Route path="offers/new" element={<OfferForm />} />

          <Route path="offers/:id" element={<OfferDetails />} />

          <Route path="offers/:id/edit" element={<OfferForm />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
