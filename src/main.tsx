import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext'
import { CartProvider } from './cart/CartContext'
import { ShopProvider } from './shop/ShopContext'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
