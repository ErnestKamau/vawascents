import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Categories } from './pages/Categories'
import { Brands } from './pages/Brands'
import { Products } from './pages/Products'
import { Orders } from './pages/Orders'
import { OrderDetail } from './pages/OrderDetail'
import { Payments } from './pages/Payments'
import { PickupPoints } from './pages/PickupPoints'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/pickup-points" element={<PickupPoints />} />
      </Route>
    </Routes>
  )
}
