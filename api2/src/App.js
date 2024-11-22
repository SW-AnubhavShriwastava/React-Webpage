import React from 'react';
import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate
} from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ForgotUsername from './pages/ForgotUsername';
import ResetPassword from './pages/ResetPassword';
import Home from './components/Home';
import ApiDetail from './pages/ApiDetail';
import PrivateRoute from './components/PrivateRoute';
import TokenManagement from './pages/TokenManagement';
import BuyCredits from './pages/BuyCredits';
import UsageInsights from './pages/UsageInsights';
import Subscriptions from './pages/Subscriptions';
import ErrorBoundary from './components/ErrorBoundary';
import ApiDocumentation from './pages/ApiDocumentation';
import ApiPricing from './pages/ApiPricing';
import Support from './pages/Support';
import AdminSupport from './pages/AdminSupport';
import PrivateAdminRoute from './components/PrivateAdminRoute';
import SuperAdmin from './pages/SuperAdmin';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-username" element={<ForgotUsername />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/" element={<Navigate to="/login" />} />
      
      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/api/:apiName" element={<ApiDetail />} />
        <Route path="/api-documentation" element={<ApiDocumentation />} />
        <Route path="/api-pricing" element={<ApiPricing />} />
        <Route path="/buy-credits" element={<BuyCredits />} />
        <Route path="/subscriptions" element={
          <ErrorBoundary>
            <Subscriptions />
          </ErrorBoundary>
        } />
        <Route path="/usage-insights" element={<UsageInsights />} />
        <Route path="/token-management" element={<TokenManagement />} />
        <Route path="/support" element={<Support />} />
        <Route element={<PrivateAdminRoute />}>
          <Route path="/admin/support" element={
            <ErrorBoundary>
              <AdminSupport />
            </ErrorBoundary>
          } />
        </Route>
        <Route path="/super-admin" element={
          <ErrorBoundary>
            <SuperAdmin />
          </ErrorBoundary>
        } />
      </Route>
    </>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
