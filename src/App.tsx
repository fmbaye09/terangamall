import React from 'react';
import { CheckCircle2, Info, X, AlertCircle, Settings } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SearchOverlay } from './components/layout/SearchOverlay';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { FlocageHubPage } from './pages/FlocageHubPage';
import { FlocageSeulPage } from './pages/FlocageSeulPage';
import { FlocageLotPage } from './pages/FlocageLotPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AdminPage } from './pages/AdminPage';

const AppRouter: React.FC = () => {
  const { currentView, toasts, dismissToast, navigateTo } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <Header />
      <SearchOverlay />

      <main className={`flex-1 ${currentView !== 'admin' ? 'pb-16 lg:pb-0' : ''}`}>
        {currentView === 'home' && <HomePage />}
        {currentView === 'shop' && <ShopPage />}
        {currentView === 'product' && <ProductPage />}
        {currentView === 'flocage' && <FlocageHubPage />}
        {currentView === 'flocage-seul' && <FlocageSeulPage />}
        {currentView === 'flocage-lot' && <FlocageLotPage />}
        {currentView === 'cart' && <CartPage />}
        {currentView === 'checkout' && <CheckoutPage />}
        {currentView === 'account' && <AccountPage />}
        {currentView === 'order-tracking' && <OrderTrackingPage />}
        {currentView === 'admin' && <AdminPage />}
      </main>

      <Footer />

      {/* Toast Notification Stack */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-18 lg:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto bg-[#111111] text-white rounded-xl p-4 shadow-xl border border-white/10 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              ) : toast.type === 'info' ? (
                <Info className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white">{toast.title}</div>
                {toast.description && (
                  <div className="text-xs text-white/75 mt-0.5 leading-relaxed">
                    {toast.description}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Fermer la notification"
                className="text-white/50 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <AppRouter />
    </StoreProvider>
  );
}

export default App;
