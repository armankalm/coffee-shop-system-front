import { Route, Routes } from 'react-router-dom'

import { RequireAuth } from './auth/RequireAuth'
import { AppLayout } from './layout/AppLayout'
import { CartScreen, CatalogScreen, LocationsScreen, LoginScreen, ProductScreen, ProfileScreen } from './screens'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="login" element={<LoginScreen />} />
        <Route element={<RequireAuth />}>
          <Route index element={<LocationsScreen />} />
          <Route path="locations" element={<LocationsScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
          <Route path="catalog" element={<CatalogScreen />} />
          <Route path="product/:productId" element={<ProductScreen />} />
          <Route path="cart" element={<CartScreen />} />
          <Route path="*" element={<LocationsScreen />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
