<script setup>
import { ref } from 'vue';
import { Collapse } from 'bootstrap';

// Navbar div'ine erişmek için
const navbarContent = ref(null);

// Menüyü kapatma fonksiyonu (Linklere tıklandığında çalışır)
const closeNavbar = () => {
  const bsCollapse = Collapse.getInstance(navbarContent.value);
  if (bsCollapse && navbarContent.value.classList.contains('show')) {
    bsCollapse.hide();
  }
};

// Butona tıklandığında manuel tetikleme (Opsiyonel: Eğer otomatik çalışmıyorsa)
const toggleNavbar = () => {
  let bsCollapse = Collapse.getInstance(navbarContent.value);
  if (!bsCollapse) {
    bsCollapse = new Collapse(navbarContent.value);
  }
  bsCollapse.toggle();
};
</script>

<template>
  <div class="d-flex flex-column min-vh-100 bg-dark text-white">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm fixed-top">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand fs-4 fw-bold text-white hover:text-info">
          Yasar Berk Harmansah
        </router-link>
        
        <button 
          class="navbar-toggler" 
          type="button" 
          @click="toggleNavbar"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav" ref="navbarContent">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link text-white-50 hover:text-white" href="#about" @click="closeNavbar">Hakkımda</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white-50 hover:text-white" href="#projects" @click="closeNavbar">Projelerim</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white-50 hover:text-white" href="#experiences" @click="closeNavbar">İş Tecrübelerim</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white-50 hover:text-white" href="#contact" @click="closeNavbar">İletişim</a>
            </li>
            <li class="nav-item">
              <router-link to="/admin/login" class="nav-link text-white-50 hover:text-white" @click="closeNavbar">
                Admin Girişi
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="flex-grow-1 container-fluid p-0" style="margin-top: 60px;">
      <router-view />
    </main>
  </div>
</template>