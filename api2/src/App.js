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
        <Route path="/api-documentation" element={<div>API Documentation</div>} />
        <Route path="/api-pricing" element={<div>API Pricing</div>} />
        <Route path="/buy-credits" element={<BuyCredits />} />
        <Route path="/subscriptions" element={<div>My Subscriptions</div>} />
        <Route path="/usage-insights" element={<UsageInsights />} />
        <Route path="/token-management" element={<TokenManagement />} />
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
