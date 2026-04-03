import React, { useState, useEffect } from 'react';

const API_URL = 'http://10.0.2.2:5000/api'; // For Android emulator
// If testing on a real phone on the same WiFi, replace with your computer's IP:
// const API_URL = 'http://192.168.1.XX:5000/api';

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const T = {
  en: {
    appName: 'FarmConnect Rwanda',
    phone: 'Phone Number', password: 'Password', login: 'Sign In',
    loginTitle: 'Welcome Back', register: 'Create Account',
    home: 'Home', listings: 'My Listings', orders: 'Orders', profile: 'Profile',
    createListing: 'List My Produce',
    crop: 'Crop Type', qty: 'Quantity (kg)', price: 'Price per kg (RWF)',
    harvest: 'Harvest Date (YYYY-MM-DD)',
    submit: 'Post Listing', submitting: 'Posting...',
    noListings: 'You have no active listings.',
    noOrders: 'You have no orders yet.',
    accept: 'Accept', reject: 'Reject',
    logout: 'Logout',
    loading: 'Loading...',
    greeting: 'Good day,',
    totalListings: 'Active Listings',
    pendingOrders: 'Pending Orders',
  },
  rw: {
    appName: 'FarmConnect Rwanda',
    phone: 'Numero ya Telefoni', password: 'Ijambo banga', login: 'Injira',
    loginTitle: 'Murakaza neza', register: 'Fungura konti',
    home: 'Ahabanza', listings: 'Ibicuruzwa', orders: 'Amaporosi', profile: 'Umwirondoro',
    createListing: 'Shyiraho Igicuruzwa',
    crop: 'Ubwoko bw\'ibihingwa', qty: 'Ingano (kg)', price: 'Igiciro kuri kg (RWF)',
    harvest: 'Itariki yo gusarura',
    submit: 'Shyiraho', submitting: 'Gutanga...',
    noListings: 'Nta bicuruzwa mufite.',
    noOrders: 'Nta maporosi afite.',
    accept: 'Emera', reject: 'Beza',
    logout: 'Sohoka',
    loading: 'Gutegereza...',
    greeting: 'Mwaramutse,',
    totalListings: 'Ibicuruzwa bifunguye',
    pendingOrders: 'Amaporosi ategereje',
  }
};

const CROPS_EN = ['Maize','Beans','Tomatoes','Potatoes','Sweet Potatoes','Cassava','Sorghum','Rice','Banana','Avocado','Onions','Wheat'];

export default function App() {
  const [lang, setLang]         = useState('en');
  const [screen, setScreen]     = useState('login');
  const [token, setToken]       = useState(null);
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [listings, setListings] = useState([]);
  const [orders, setOrders]     = useState([]);

  // Login form state
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });

  // Create listing form state
  const [listingForm, setListingForm] = useState({
    crop_type: '', quantity_kg: '', price_per_kg: '', harvest_date: ''
  });

  const t = T[lang];

  // ── API HELPER ─────────────────────────────────────────────────────────────
  const api = async (method, endpoint, body = null) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  // ── AUTH ───────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginForm.phone || !loginForm.password) {
      Alert.alert('Error', 'Please enter phone and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await api('POST', '/auth/login', loginForm);
      setToken(data.token);
      setUser(data.user);
      setScreen('home');
      fetchMyListings(data.token);
      fetchMyOrders(data.token);
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null); setUser(null);
    setListings([]); setOrders([]);
    setScreen('login');
  };

  // ── FETCH DATA ─────────────────────────────────────────────────────────────
  const fetchMyListings = async (tok = token) => {
    try {
      const options = { method: 'GET', headers: { Authorization: `Bearer ${tok}` } };
      const res = await fetch(`${API_URL}/listings/my`, options);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) { console.error(err); }
  };

  const fetchMyOrders = async (tok = token) => {
    try {
      const options = { method: 'GET', headers: { Authorization: `Bearer ${tok}` } };
      const res = await fetch(`${API_URL}/orders/my`, options);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) { console.error(err); }
  };

  // ── CREATE LISTING ─────────────────────────────────────────────────────────
  const submitListing = async () => {
    const { crop_type, quantity_kg, price_per_kg } = listingForm;
    if (!crop_type || !quantity_kg || !price_per_kg) {
      Alert.alert('Missing Fields', 'Please fill crop type, quantity, and price.');
      return;
    }
    setLoading(true);
    try {
      await api('POST', '/listings', listingForm);
      Alert.alert('Success! 🎉', 'Your listing is now live. Buyers can see it.');
      setListingForm({ crop_type: '', quantity_kg: '', price_per_kg: '', harvest_date: '' });
      fetchMyListings();
      setScreen('listings');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── RESPOND TO ORDER ───────────────────────────────────────────────────────
  const respondToOrder = async (order_id, action) => {
    const word = action === 'accept' ? 'accept' : 'reject';
    Alert.alert(
      `${action === 'accept' ? '✅' : '❌'} ${word} Order?`,
      `Are you sure you want to ${word} this order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: word.charAt(0).toUpperCase() + word.slice(1),
          onPress: async () => {
            try {
              const data = await api('PUT', '/orders/respond', { order_id, action });
              Alert.alert('Done!', data.message);
              fetchMyOrders();
            } catch (err) { Alert.alert('Error', err.message); }
          }
        }
      ]
    );
  };

  // ── SCREENS ────────────────────────────────────────────────────────────────

  const LoginScreen = () => (
    <ScrollView contentContainerStyle={styles.loginContainer}>
      <Text style={styles.logo}>🌱</Text>
      <Text style={styles.loginTitle}>{t.appName}</Text>
      <Text style={styles.loginSubtitle}>{t.loginTitle}</Text>

      <View style={styles.langRow}>
        {['en','rw'].map(l => (
          <TouchableOpacity key={l} onPress={() => setLang(l)}
            style={[styles.langBtn, lang === l && styles.langBtnActive]}>
            <Text style={{ color: lang === l ? 'white' : '#333', fontWeight: '600' }}>
              {l === 'en' ? 'English' : 'Kinyarwanda'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t.phone}</Text>
      <TextInput
        style={styles.input} keyboardType="phone-pad" placeholder="e.g. 0789123456"
        value={loginForm.phone}
        onChangeText={v => setLoginForm({ ...loginForm, phone: v })}
      />

      <Text style={styles.label}>{t.password}</Text>
      <TextInput
        style={styles.input} secureTextEntry placeholder="••••••••"
        value={loginForm.password}
        onChangeText={v => setLoginForm({ ...loginForm, password: v })}
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="white" />
          : <Text style={styles.primaryBtnText}>{t.login}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );

  const HomeScreen = () => {
    const activeListings = listings.filter(l => l.status === 'active').length;
    const pendingOrders  = orders.filter(o => o.status === 'pending').length;
    return (
      <ScrollView style={styles.screen}>
        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeGreeting}>{t.greeting}</Text>
          <Text style={styles.welcomeName}>{user?.name}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeListings}</Text>
            <Text style={styles.statLabel}>{t.totalListings}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: pendingOrders > 0 ? '#E67E22' : '#1A7A3C' }]}>{pendingOrders}</Text>
            <Text style={styles.statLabel}>{t.pendingOrders}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.menuCard, { background: '#1A56A0' }]} onPress={() => setScreen('create')}>
          <Text style={styles.menuIcon}>🌿</Text>
          <View>
            <Text style={styles.menuTitle}>{t.createListing}</Text>
            <Text style={styles.menuSub}>Post your harvest for buyers</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => { fetchMyListings(); setScreen('listings'); }}>
          <Text style={styles.menuIcon}>📋</Text>
          <View>
            <Text style={styles.menuTitle}>{t.listings}</Text>
            <Text style={styles.menuSub}>{activeListings} active listings</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuCard, { borderLeftColor: '#E67E22' }]} onPress={() => { fetchMyOrders(); setScreen('orders'); }}>
          <Text style={styles.menuIcon}>📦</Text>
          <View>
            <Text style={styles.menuTitle}>{t.orders}</Text>
            <Text style={styles.menuSub}>{pendingOrders} awaiting your response</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const CreateListingScreen = () => (
    <ScrollView style={styles.screen} keyboardShouldPersistTaps="handled">
      <Text style={styles.screenTitle}>{t.createListing}</Text>

      {[
        ['crop_type',    t.crop,    'default', 'e.g. Maize'],
        ['quantity_kg',  t.qty,     'numeric',  'e.g. 500'],
        ['price_per_kg', t.price,   'numeric',  'e.g. 350'],
        ['harvest_date', t.harvest, 'default',  '2025-06-15'],
      ].map(([key, label, kbType, placeholder]) => (
        <View key={key}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            keyboardType={kbType}
            placeholder={placeholder}
            value={listingForm[key]}
            onChangeText={v => setListingForm({ ...listingForm, [key]: v })}
          />
        </View>
      ))}

      <Text style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 18 }}>
        💡 Tip: Popular crops — {CROPS_EN.slice(0, 5).join(', ')}...
      </Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={submitListing} disabled={loading}>
        {loading
          ? <ActivityIndicator color="white" />
          : <Text style={styles.primaryBtnText}>{t.submit}</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => setScreen('home')}>
        <Text style={styles.secondaryBtnText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const ListingsScreen = () => (
    <ScrollView style={styles.screen}>
      <Text style={styles.screenTitle}>{t.listings}</Text>
      <TouchableOpacity style={[styles.primaryBtn, { marginBottom: 16 }]} onPress={() => setScreen('create')}>
        <Text style={styles.primaryBtnText}>+ {t.createListing}</Text>
      </TouchableOpacity>

      {listings.length === 0
        ? <Text style={styles.emptyText}>{t.noListings}</Text>
        : listings.map(l => (
            <View key={l.listing_id} style={styles.listingCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.listingCrop}>{l.crop_type}</Text>
                <View style={[styles.badge, l.status === 'active' ? styles.badgeGreen : styles.badgeGray]}>
                  <Text style={styles.badgeText}>{l.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.listingDetail}>📦 {l.quantity_kg} kg  ·  💰 {l.price_per_kg} RWF/kg</Text>
              {l.harvest_date && <Text style={styles.listingDetail}>🗓 Harvest: {new Date(l.harvest_date).toLocaleDateString()}</Text>}
            </View>
          ))
      }
    </ScrollView>
  );

  const OrdersScreen = () => (
    <ScrollView style={styles.screen}>
      <Text style={styles.screenTitle}>{t.orders}</Text>
      <TouchableOpacity style={[styles.secondaryBtn, { marginBottom: 16 }]} onPress={fetchMyOrders}>
        <Text style={styles.secondaryBtnText}>🔄 Refresh</Text>
      </TouchableOpacity>

      {orders.length === 0
        ? <Text style={styles.emptyText}>{t.noOrders}</Text>
        : orders.map(o => (
            <View key={o.order_id} style={styles.orderCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={styles.listingCrop}>{o.crop_type}</Text>
                <View style={[styles.badge,
                  o.status === 'pending'   ? styles.badgeYellow :
                  o.status === 'accepted'  ? styles.badgeGreen  :
                  o.status === 'completed' ? styles.badgeGreen  : styles.badgeGray
                ]}>
                  <Text style={styles.badgeText}>{o.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.listingDetail}>👤 Buyer: {o.other_party_name}</Text>
              <Text style={styles.listingDetail}>📦 {o.quantity_kg} kg  ·  💰 {parseFloat(o.total_amount).toLocaleString()} RWF</Text>

              {o.status === 'pending' && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1A7A3C' }]} onPress={() => respondToOrder(o.order_id, 'accept')}>
                    <Text style={styles.actionBtnText}>✅ {t.accept}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#C0392B' }]} onPress={() => respondToOrder(o.order_id, 'reject')}>
                    <Text style={styles.actionBtnText}>❌ {t.reject}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
      }
    </ScrollView>
  );

  // ── RENDER ─────────────────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF2F7' }}>
        <StatusBar barStyle="dark-content" />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A56A0" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>🌾 {t.appName}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['en','rw'].map(l => (
            <TouchableOpacity key={l} onPress={() => setLang(l)}
              style={[styles.miniLangBtn, lang === l && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>{l.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={{ color: 'white', fontSize: 12 }}>{t.logout}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen content */}
      <View style={{ flex: 1 }}>
        {screen === 'home'     && <HomeScreen />}
        {screen === 'create'   && <CreateListingScreen />}
        {screen === 'listings' && <ListingsScreen />}
        {screen === 'orders'   && <OrdersScreen />}
      </View>

      {/* Bottom tab bar */}
      <View style={styles.tabBar}>
        {[
          ['home',     '🏠', t.home],
          ['create',   '➕', t.createListing.split(' ')[0]],
          ['listings', '📋', t.listings],
          ['orders',   '📦', t.orders],
        ].map(([s, icon, label]) => (
          <TouchableOpacity key={s} style={styles.tabItem} onPress={() => setScreen(s)}>
            <Text style={{ fontSize: 22 }}>{icon}</Text>
            <Text style={[styles.tabLabel, screen === s && styles.tabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ── STYLES ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loginContainer: { flexGrow: 1, padding: 28, paddingTop: 60, backgroundColor: '#EEF2F7' },
  logo:           { fontSize: 64, textAlign: 'center', marginBottom: 8 },
  loginTitle:     { fontSize: 26, fontWeight: 'bold', color: '#1A56A0', textAlign: 'center', marginBottom: 4 },
  loginSubtitle:  { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 28 },
  langRow:        { flexDirection: 'row', gap: 10, marginBottom: 24, justifyContent: 'center' },
  langBtn:        { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: '#DDD' },
  langBtnActive:  { backgroundColor: '#1A56A0' },
  label:          { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6 },
  input:          { backgroundColor: 'white', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 16 },
  primaryBtn:     { backgroundColor: '#1A56A0', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: 'white', fontSize: 17, fontWeight: 'bold' },
  secondaryBtn:   { backgroundColor: '#E8EDF5', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  secondaryBtnText: { color: '#1A56A0', fontSize: 15, fontWeight: '600' },
  topBar:         { backgroundColor: '#1A56A0', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topBarTitle:    { color: 'white', fontWeight: 'bold', fontSize: 17 },
  miniLangBtn:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  logoutBtn:      { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)' },
  screen:         { flex: 1, padding: 20 },
  screenTitle:    { fontSize: 22, fontWeight: 'bold', color: '#1A3A5C', marginBottom: 20 },
  welcomeBox:     { backgroundColor: '#1A56A0', borderRadius: 14, padding: 20, marginBottom: 16 },
  welcomeGreeting:{ color: '#A8CCF0', fontSize: 14 },
  welcomeName:    { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  statsRow:       { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard:       { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  statNumber:     { fontSize: 32, fontWeight: 'bold', color: '#1A7A3C' },
  statLabel:      { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
  menuCard:       { backgroundColor: 'white', borderRadius: 14, padding: 18, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 16, borderLeftWidth: 5, borderLeftColor: '#1A56A0', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  menuIcon:       { fontSize: 36 },
  menuTitle:      { fontSize: 17, fontWeight: 'bold', color: '#1A3A5C' },
  menuSub:        { fontSize: 13, color: '#888', marginTop: 2 },
  listingCard:    { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  orderCard:      { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  listingCrop:    { fontSize: 17, fontWeight: 'bold', color: '#1A3A5C' },
  listingDetail:  { fontSize: 14, color: '#666', marginTop: 4 },
  badge:          { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeGreen:     { backgroundColor: '#E8F5E9' },
  badgeYellow:    { backgroundColor: '#FFF8E1' },
  badgeGray:      { backgroundColor: '#F5F5F5' },
  badgeText:      { fontSize: 11, fontWeight: 'bold', color: '#555' },
  actionBtn:      { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  actionBtnText:  { color: 'white', fontWeight: 'bold', fontSize: 15 },
  emptyText:      { color: '#AAA', textAlign: 'center', marginTop: 40, fontSize: 16 },
  tabBar:         { flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingVertical: 8, paddingBottom: 4 },
  tabItem:        { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabLabel:       { fontSize: 11, color: '#AAA', marginTop: 2 },
  tabLabelActive: { color: '#1A56A0', fontWeight: 'bold' },
});