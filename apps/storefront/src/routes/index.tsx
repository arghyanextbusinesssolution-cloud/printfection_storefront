import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/Home/HomePage';
import { ProductsPage } from '../pages/Products/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetails/ProductDetailsPage';
import { BulkOrderPage } from '../pages/BulkOrder/BulkOrderPage';
import { SingleOrderPage } from '../pages/SingleOrder/SingleOrderPage';
import { CartPage } from '../pages/Cart/CartPage';
import { CheckoutPage } from '../pages/Checkout/CheckoutPage';
import { QuoteSuccessPage, OrderSuccessPage } from '../pages/Checkout/SuccessPages';
import { ScrollToTop } from '../components/common/ScrollToTop';

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailsPage />} />
        <Route path="bulk-order" element={<BulkOrderPage />} />
        <Route path="single-order" element={<SingleOrderPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="quote-success" element={<QuoteSuccessPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} />
      </Route>
      </Routes>
    </>
  );
}
