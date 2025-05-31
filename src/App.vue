<script setup>
// Eğer global state yönetimi için Pinia kullanacaksak, onu burada import edip initialize edebiliriz
// import { useUserStore } from './stores/user';
// const userStore = useUserStore();
// userStore.init(); // Uygulama başladığında kullanıcı durumunu başlat
</script>

<template>
  <div class="d-flex flex-column min-vh-100 bg-dark text-white">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand fs-4 fw-bold text-white hover:text-info">
          Yasin Berk Harmansah
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link text-white-50 hover:text-white" href="#about">Hakkımda</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white-50 hover:text-white" href="#projects">Projelerim</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white-50 hover:text-white" href="#experiences">İş Tecrübelerim</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white-50 hover:text-white" href="#contact">İletişim</a>
            </li>
            <li class="nav-item">
              <router-link to="/admin/login" class="nav-link text-white-50 hover:text-white">
                Admin Girişi
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="flex-grow-1 container-fluid p-0">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* Bootstrap sınıfları doğrudan template içinde kullanıldığı için buraya çok az özel stil kalır. */
.hover\:text-info:hover {
    color: #0dcaf0 !important; /* Bootstrap'in --bs-info rengi */
}
.hover\:text-white:hover {
    color: #fff !important;
}
</style>