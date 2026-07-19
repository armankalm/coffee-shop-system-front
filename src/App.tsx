import { Outlet, Route, Routes } from 'react-router-dom'

import { RequireAuth } from './auth/RequireAuth'
import { RequireRole } from './auth/RequireRole'
import { KITCHEN_BOARD_PERMISSION } from './auth/permissions'
import { KitchenBoardProvider } from './kitchen/KitchenBoardContext'
import { AppLayout } from './layout/AppLayout'
import {
  CartScreen,
  CatalogScreen,
  EditProfileScreen,
  LocationsScreen,
  LoginScreen,
  OrderStatusScreen,
  ProductScreen,
  ProfileScreen,
} from './screens'

function KitchenBoardRouteScope() {
  return (
    <KitchenBoardProvider>
      <Outlet />
    </KitchenBoardProvider>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="login" element={<LoginScreen />} />
        <Route element={<RequireAuth />}>
          <Route index element={<LocationsScreen />} />
          <Route path="locations" element={<LocationsScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
          <Route path="profile/edit" element={<EditProfileScreen />} />
          <Route path="catalog" element={<CatalogScreen />} />
          <Route path="product/:productId" element={<ProductScreen />} />
          <Route path="cart" element={<CartScreen />} />
          <Route path="order/:orderId" element={<OrderStatusScreen />} />
          <Route element={<RequireRole permission={KITCHEN_BOARD_PERMISSION} />}>
            <Route path="orders/*" element={<KitchenBoardRouteScope />} />
          </Route>
          <Route path="*" element={<LocationsScreen />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
