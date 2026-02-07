// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { auth, db } from '../firebase'; // Firebase auth ve db importları
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Home from '../views/Home.vue';
import AdminLogin from '../views/AdminLogin.vue';
import AdminDashboard from '../views/AdminDashboard.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true } // Admin yetkisi gerektirdiğini belirtiriz
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const getCurrentUser = () => new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    resolve(user);
  });
});

// Kullanıcının admin olup olmadığını Firestore'dan kontrol eden fonksiyon (Router guard'ı için)
const checkAdminStatus = async (uid) => {
  const adminDocRef = doc(db, 'admins', uid);
  const adminDocSnap = await getDoc(adminDocRef);
  return adminDocSnap.exists() && adminDocSnap.data().isAdmin === true;
};


// Admin rotaları için navigasyon koruyucu
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (!requiresAuth && !requiresAdmin) {
    next();
    return;
  }

  const user = auth.currentUser ?? await getCurrentUser();
  const isAuthenticated = !!user;

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'AdminLogin' });
    return;
  }

  if (requiresAdmin && user) {
    const isAdminUser = await checkAdminStatus(user.uid);
    if (!isAdminUser) {
      alert('Bu sayfaya erişim yetkiniz yok.');
      next({ name: 'Home' });
      return;
    }
  }

  next();
});

export default router;
