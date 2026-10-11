import React, { useState } from 'react';
import {
  Heart,
  MapPin,
  Package,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../services/payment';
import { ProductCard } from '../components/ui/ProductCard';

export const AccountPage: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    orders,
    wishlistIds,
    products,
    addresses,
    addAddress,
    deleteAddress,
    navigateTo,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'wishlist' | 'addresses' | 'profile'
  >('orders');

  // Profile form state
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [city, setCity] = useState(userProfile.city);

  // New Address form state
  const [addrLabel, setAddrLabel] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('Dakar');
  const [addrRegion, setAddrRegion] = useState('Dakar');

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));
  const activeOrdersCount = orders.filter(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  ).length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone, city });
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrLabel.trim() || !addrStreet.trim()) return;
    addAddress({
      label: addrLabel,
      recipientName: userProfile.name,
      phone: userProfile.phone,
      street: addrStreet,
      city: addrCity,
      region: addrRegion,
      isDefault: false,
    });
    setAddrLabel('');
    setAddrStreet('');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header Greeting & Metrics */}
      <div className="bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-semibold text-[#FF5A1F] mb-1">
            Espace Client · Membre depuis {userProfile.memberSince}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">
            Bonjour {userProfile.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-1">
            {userProfile.email} · {userProfile.phone} · {userProfile.city}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-[#E5E5E5] px-4 py-3 text-center">
            <div className="text-xl font-bold text-[#111111] tabular-nums">
              {orders.length}
            </div>
            <div className="text-[11px] text-[#777777]">Commandes</div>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E5E5] px-4 py-3 text-center">
            <div className="text-xl font-bold text-[#FF5A1F] tabular-nums">
              {activeOrdersCount}
            </div>
            <div className="text-[11px] text-[#777777]">En cours</div>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E5E5] px-4 py-3 text-center">
            <div className="text-xl font-bold text-[#111111] tabular-nums">
              {wishlistedProducts.length}
            </div>
            <div className="text-[11px] text-[#777777]">Favoris</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E5E5] pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'orders'
              ? 'bg-[#111111] text-white'
              : 'bg-[#F7F7F5] text-[#111111] hover:bg-[#FFE8DE]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mes Commandes ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wishlist')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'wishlist'
              ? 'bg-[#111111] text-white'
              : 'bg-[#F7F7F5] text-[#111111] hover:bg-[#FFE8DE]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Ma Wishlist ({wishlistedProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'addresses'
              ? 'bg-[#111111] text-white'
              : 'bg-[#F7F7F5] text-[#111111] hover:bg-[#FFE8DE]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Mes Adresses ({addresses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'profile'
              ? 'bg-[#111111] text-white'
              : 'bg-[#F7F7F5] text-[#111111] hover:bg-[#FFE8DE]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Mon Profil</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#777777]">
                  <span className="font-bold text-[#111111]">{ord.orderNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ord.createdAt}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#FF5A1F] font-semibold">
                    {ord.isFlocageOrder ? 'Commande Flocage' : 'Commande Boutique'}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#111111]">
                  Statut : {ord.orderStatus} · Paiement {ord.paymentMethod} ({ord.paymentStatus})
                </div>
                <div className="text-xs text-[#777777]">
                  Livraison : {ord.shippingAddress.street}, {ord.shippingAddress.city}
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-xs text-[#777777]">Total</div>
                  <div className="text-base font-bold text-[#111111] tabular-nums">
                    {formatFCFA(ord.total)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('order-tracking', { orderId: ord.id })}
                  className="px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Suivre la commande
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistedProducts.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#F7F7F5] text-center space-y-3">
              <p className="text-sm font-semibold text-[#111111]">
                Vous n’avez pas encore d’articles en favoris.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('shop', { categorySlug: 'all' })}
                className="px-5 py-2.5 rounded-lg bg-[#111111] text-white text-xs font-semibold"
              >
                Explorer la boutique
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlistedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white rounded-2xl border border-[#E5E5E5] p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#111111]">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[11px] font-semibold text-[#FF5A1F]">
                        Par défaut
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#111111] font-medium">
                    {addr.recipientName} ({addr.phone})
                  </p>
                  <p className="text-xs text-[#777777] mt-1">
                    {addr.street}, {addr.city} – {addr.region}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => deleteAddress(addr.id)}
                  className="inline-flex items-center gap-1 text-xs text-[#777777] hover:text-red-600 self-start"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleAddAddress}
            className="lg:col-span-5 bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-[#111111]">
              Ajouter une nouvelle adresse
            </h3>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Libellé (ex: Domicile, Bureau, Club) *
              </label>
              <input
                type="text"
                required
                value={addrLabel}
                onChange={(e) => setAddrLabel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E5E5E5] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Rue / Quartier / Villa *
              </label>
              <input
                type="text"
                required
                value={addrStreet}
                onChange={(e) => setAddrStreet(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E5E5E5] text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Ville</label>
                <input
                  type="text"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E5E5E5] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Région</label>
                <input
                  type="text"
                  value={addrRegion}
                  onChange={(e) => setAddrRegion(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E5E5E5] text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#111111] hover:bg-[#FF5A1F] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer l’adresse</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PROFILE */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="max-w-xl bg-white rounded-2xl border border-[#E5E5E5] p-6 space-y-4"
        >
          <h2 className="text-base font-bold text-[#111111]">
            Informations personnelles
          </h2>
          <div>
            <label className="block text-xs font-semibold mb-1">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Ville / Quartier</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#111111] text-white text-xs font-semibold transition-colors"
          >
            Sauvegarder mes modifications
          </button>
        </form>
      )}
    </div>
  );
};
