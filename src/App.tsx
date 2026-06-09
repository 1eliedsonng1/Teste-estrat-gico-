import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from '@/components/ui/sonner'
import SplashScreen from '@/components/SplashScreen'
import Navbar from '@/components/Navbar'
import HomePage from '@/pages/HomePage'
import CardapioPage from '@/pages/CardapioPage'
import ProductPage from '@/pages/ProductPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import OrdersPage from '@/pages/OrdersPage'
import ReservasPage from '@/pages/ReservasPage'
import AvaliacoesPage from '@/pages/AvaliacoesPage'
import SobrePage from '@/pages/SobrePage'
import ContactosPage from '@/pages/ContactosPage'
import AdminPage from '@/pages/AdminPage'

function AppContent() {
  const [splashDone, setSplashDone] = useState(false)
  const handleSplashFinish = useCallback(() => setSplashDone(true), [])

  return (
    <>
      {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
      <div className={`min-h-screen bg-background transition-opacity duration-300 ${splashDone ? 'opacity-100' : 'opacity-0'}`}>
        <Navbar />
        <div className="pt-14">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cardapio" element={<CardapioPage />} />
            <Route path="/produto/:id" element={<ProductPage />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/encomendas" element={<OrdersPage />} />
            <Route path="/reservas" element={<ReservasPage />} />
            <Route path="/avaliacoes" element={<AvaliacoesPage />} />
            <Route path="/sobre" element={<SobrePage />} />
            <Route path="/contactos" element={<ContactosPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </div>
      <Toaster richColors position="top-center" />
      <SpeedInsights />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  )
}
