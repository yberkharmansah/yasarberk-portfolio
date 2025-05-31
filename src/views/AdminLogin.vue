<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase'; // Firebase auth ve db importları
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = ''; // Hata mesajını temizle

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // Kullanıcının admin olup olmadığını kontrol et
    const isAdmin = await checkAdminStatus(user.uid);

    if (isAdmin) {
      alert('Giriş başarılı! Admin paneline yönlendiriliyorsunuz.');
      router.push({ name: 'AdminDashboard' }); // Admin paneline yönlendir
    } else {
      // Admin değilse çıkış yap ve hata mesajı göster
      await auth.signOut();
      errorMessage.value = 'Bu e-posta adresi ile admin girişi yapmaya yetkiniz bulunmamaktadır.';
    }

  } catch (error) {
    console.error('Giriş hatası:', error.code, error.message);
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage.value = 'Geçersiz e-posta adresi.';
        break;
      case 'auth/user-disabled':
        errorMessage.value = 'Bu kullanıcı hesabı devre dışı bırakılmıştır.';
        break;
      case 'auth/user-not-found':
        errorMessage.value = 'Bu e-posta adresine kayıtlı kullanıcı bulunamadı.';
        break;
      case 'auth/wrong-password':
      case 'auth/invalid-credential': // Firebase 9.0+ versiyonlarında 'wrong-password' yerine 'invalid-credential' dönebilir.
        errorMessage.value = 'Yanlış şifre.';
        break;
      case 'auth/missing-password':
        errorMessage.value = 'Lütfen şifrenizi girin.';
        break;
      default:
        errorMessage.value = 'Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin.';
        break;
    }
  }
};

// Kullanıcının admin olup olmadığını Firestore'dan kontrol eden fonksiyon
const checkAdminStatus = async (uid) => {
  const adminDocRef = doc(db, 'admins', uid); // 'admins' koleksiyonundaki UID'ye sahip dokümanı ara
  const adminDocSnap = await getDoc(adminDocRef);
  return adminDocSnap.exists() && adminDocSnap.data().isAdmin === true;
};
</script>

<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
    <div class="card bg-secondary text-white p-4 shadow-lg" style="width: 100%; max-width: 400px;">
      <div class="card-body">
        <h2 class="card-title text-center mb-4 text-info">Admin Girişi</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label">E-posta</label>
            <input type="email" class="form-control bg-dark text-white border-secondary" id="email" v-model="email" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Şifre</label>
            <input type="password" class="form-control bg-dark text-white border-secondary" id="password" v-model="password" required>
          </div>
          <button type="submit" class="btn btn-primary w-100">Giriş Yap</button>
          <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* AdminLogin.vue'ye özel stiller */
.card {
  border: none;
}
.form-control:focus {
  background-color: #343a40 !important; /* Bootstrap dark background on focus */
  border-color: #0d6efd !important; /* Bootstrap primary blue on focus */
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
}
</style>