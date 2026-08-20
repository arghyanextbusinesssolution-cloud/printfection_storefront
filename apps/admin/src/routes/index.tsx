import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoginPage } from '../pages/Login/LoginPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { ProductsPage } from '../pages/Products/ProductsPage';
import { ProductFormPage } from '../pages/Products/ProductFormPage';
import { ProductVariantsPage } from '../pages/Products/ProductVariantsPage';
import { CategoriesPage } from '../pages/Categories/CategoriesPage';
import { ImportsPage } from '../pages/Imports/ImportsPage';
import { OrdersPage } from '../pages/Orders/OrdersPage';
import { OrderDetailPage } from '../pages/Orders/OrderDetailPage';
import { QuotesPage } from '../pages/Quotes/QuotesPage';
import { QuoteDetailPage } from '../pages/Quotes/QuoteDetailPage';
import { PricingPage } from '../pages/Pricing/PricingPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
          <Route path="products/:id/variants" element={<ProductVariantsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="imports" element={<ImportsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="quotes" element={<QuotesPage />} />
          <Route path="quotes/:id" element={<QuoteDetailPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
