import { Route, Routes } from 'react-router-dom'

import { AppLayout } from './layout/AppLayout'
import { CartScreen, CatalogScreen, LocationsScreen, ProductScreen, ProfileScreen } from './screens'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LocationsScreen />} />
        <Route path="locations" element={<LocationsScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
        <Route path="catalog" element={<CatalogScreen />} />
        <Route path="product/:productId" element={<ProductScreen />} />
        <Route path="cart" element={<CartScreen />} />
        <Route path="*" element={<LocationsScreen />} />
      </Route>
    </Routes>
  )
}

export default App
