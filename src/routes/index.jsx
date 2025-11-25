import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/auth/Login';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../pages/dashboard/Dashboard';
import Stores from '../pages/store/Stores';
import Orders from '../pages/orders/Orders';
import Pricing from '../pages/service/Service';
import Users from '../pages/users/Users';
import Profile from '../pages/profile/Profile';

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    
    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/services" element={<Pricing />} />
        <Route path="/users" element={<Users />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Route>
    
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRouter;

