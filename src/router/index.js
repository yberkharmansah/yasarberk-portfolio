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

// Firebase Auth durumu için global bir değişken
let isAuthenticated = false;
let isAdminUser = false;

// Kullanıcı oturum durumu değiştiğinde güncelleyeceğiz
onAuthStateChanged(auth, async (user) => {
  isAuthenticated = !!user;
  if (user) {
    isAdminUser = await checkAdminStatus(user.uid);
  } else {
    isAdminUser = false;
  }
  // Router'ı bekleyen navigasyonları çözmek için gerekirse yönlendirme yapabiliriz.
  // Örneğin, kullanıcı çıkış yaptığında dashboard'dan login'e atabiliriz.
  if (!isAuthenticated && router.currentRoute.value.meta.requiresAuth) {
    router.push({ name: 'AdminLogin' });
  }
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

  // Oturum durumu değişmiş olabilir, onAuthStateChanged'in callback'inin çalışmasını beklemek için
  // bu kontrolü async yapıyoruz.
  await new Promise(resolve => {
    if (auth.currentUser !== undefined) { // auth.currentUser henüz yüklenmediyse bekle
      resolve();
    } else {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe(); // Tek bir kez dinle
        resolve();
      });
    }
  });

  if (requiresAuth && !isAuthenticated) {
    // Kimlik doğrulama gerekiyorsa ve kullanıcı giriş yapmamışsa
    next({ name: 'AdminLogin' });
  } else if (requiresAdmin && !isAdminUser) {
    // Admin yetkisi gerekiyorsa ve kullanıcı admin değilse (ama giriş yapmışsa)
    alert('Bu sayfaya erişim yetkiniz yok.');
    next({ name: 'Home' }); // Ana sayfaya veya başka bir yere yönlendir
  }
  else {
    next(); // Devam et
  }
});

export default router;