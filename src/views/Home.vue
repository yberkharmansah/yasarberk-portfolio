<script setup>
import { onMounted, computed, ref } from 'vue'; // ref'i import et
import { usePortfolioStore } from '../stores/portfolio';

const portfolioStore = usePortfolioStore();

// Projeler slider'ı için ref
const projectsContainer = ref(null);

onMounted(() => {
  portfolioStore.fetchPortfolioContent();
});

const about = computed(() => portfolioStore.about);
const socialLinks = computed(() => portfolioStore.socialLinks);
const projects = computed(() => portfolioStore.projects);
const experiences = computed(() => portfolioStore.experiences);
const contact = computed(() => portfolioStore.contact);
const loading = computed(() => portfolioStore.loading);
const error = computed(() => portfolioStore.error);

const profileImage = computed(() => about.value?.profileImageUrl || 'https://via.placeholder.com/200/007bff/FFFFFF?text=Profil');

// Projeler slider'ını sağa/sola kaydırma fonksiyonları
const scrollProjects = (direction) => {
  if (projectsContainer.value) {
    const scrollAmount = 350; // Tek bir kartın genişliği (margin dahil) civarında kaydır
    if (direction === 'left') {
      projectsContainer.value.scrollLeft -= scrollAmount;
    } else {
      projectsContainer.value.scrollLeft += scrollAmount;
    }
  }
};
</script>

<template>
  <div class="text-white">
    <div v-if="loading" class="text-center py-5">Yükleniyor...</div>
    <div v-else-if="error" class="text-center py-5 text-danger">Hata: {{ error }}</div>
    <div v-else>
      <section id="about" class="d-flex flex-column align-items-center justify-content-center vh-100 p-4 bg-dark text-center shadow-lg mb-0 position-relative overflow-hidden">
        <div class="position-absolute w-100 h-100 pattern-bg opacity-25"></div>
        <div class="z-10 d-flex flex-column align-items-center justify-content-center text-center w-100 h-100 p-3 p-md-5">
          <img :src="profileImage" alt="Profil Resmi" class="rounded-circle img-fluid mb-4 border border-5 border-primary shadow-lg" style="width: 150px; height: 150px; object-fit: cover;">
          <h1 class="display-4 fw-bold text-white animate__animated animate__fadeInDown">{{ about?.heading || 'Hoş Geldiniz!' }}</h1>
          <p class="lead mt-3 text-white-50 mx-auto animate__animated animate__fadeInUp" style="max-width: 700px;">
            {{ about?.text || 'Henüz Hakkımda yazısı eklenmemiş.' }}
          </p>
        </div>
      </section>

      <section id="social-links" class="py-5 bg-black text-center shadow-sm mb-0">
        <div class="d-flex justify-content-center gap-4">
          <a v-for="link in socialLinks" :key="link.name" :href="link.url" target="_blank"
             class="text-secondary hover:text-primary transition-colors duration-300"
             :aria-label="link.name">
            <i :class="['fs-2', link.icon]"></i>
          </a>
        </div>
      </section>

      <section id="projects" class="py-5 bg-dark d-flex flex-column align-items-center justify-content-center shadow-lg mb-0">
        <h2 class="display-5 fw-bold text-center mb-5 text-info animate__animated animate__fadeIn">Projelerim</h2>
        <div v-if="projects.length === 0" class="text-center text-white-50">Henüz proje eklenmemiş.</div>
        <div v-else class="position-relative w-100">
          <div ref="projectsContainer" class="d-flex overflow-auto pb-3 px-0 no-scrollbar" style="scroll-behavior: smooth;">
            <div v-for="project in projects" :key="project.id"
                 class="card bg-secondary text-white m-3 shadow-lg flex-shrink-0" style="min-width: 300px; max-width: 350px;">
              <img v-if="project.imageUrl" :src="project.imageUrl" :alt="project.title" class="card-img-top" style="height: 180px; object-fit: cover;">
              <div class="card-body">
                <h3 class="card-title fs-4 text-info">{{ project.title }}</h3>
                <p class="card-text text-white-75" style="font-size: 0.9rem;">{{ project.description }}</p>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <span v-for="tech in project.technologies" :key="tech" class="badge bg-primary rounded-pill">
                    {{ tech }}
                  </span>
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <a v-if="project.liveDemoUrl" :href="project.liveDemoUrl" target="_blank"
                     class="btn btn-success btn-sm d-flex align-items-center">
                    <i class="fas fa-play-circle me-2"></i> Canlı Demo
                  </a>
                  <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank"
                     class="btn btn-dark btn-sm d-flex align-items-center">
                    <i class="fab fa-github me-2"></i> GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
          <button v-if="projects.length > 3" @click="scrollProjects('left')" class="carousel-control-prev-proj btn btn-outline-light d-flex align-items-center justify-content-center d-none d-md-block">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button v-if="projects.length > 3" @click="scrollProjects('right')" class="carousel-control-next-proj btn btn-outline-light d-flex align-items-center justify-content-center d-none d-md-block">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
      </section>

      <section id="experiences" class="py-5 bg-black d-flex flex-column align-items-center justify-content-center shadow-lg mb-0">
        <h2 class="display-5 fw-bold text-center mb-5 text-info animate__animated animate__fadeIn">İş Tecrübelerim</h2>
        <div v-if="experiences.length === 0" class="text-center text-white-50">Henüz iş tecrübesi eklenmemiş.</div>
        <div v-else class="container" style="max-width: 800px;">
          <div v-for="exp in experiences" :key="exp.id" class="card bg-secondary text-white p-4 shadow-lg mb-4">
            <h3 class="card-title fs-4 text-info">{{ exp.company }}</h3>
            <p class="card-subtitle mb-2 text-white-75">{{ exp.position }}</p>
            <p class="card-text text-white-50" style="font-size: 0.9rem;">
              {{ new Date(exp.startDate.seconds * 1000).toLocaleDateString() }} - {{ exp.endDate ? new Date(exp.endDate.seconds * 1000).toLocaleDateString() : 'Devam Ediyor' }}
            </p>
            <div v-if="exp.responsibilities && exp.responsibilities.length" class="mt-3">
              <h4 class="fs-5 fw-medium text-white-75">Başlıca Görevler:</h4>
              <ul class="list-unstyled">
                <li v-for="(res, index) in exp.responsibilities" :key="index" class="text-white-75">
                  <i class="fas fa-check-circle me-2 text-success"></i> {{ res }}
                </li>
              </ul>
            </div>
            <div v-if="exp.qualifications && exp.qualifications.length" class="mt-3">
              <h4 class="fs-5 fw-medium text-white-75">Kazanılan Nitelikler:</h4>
              <ul class="list-unstyled">
                <li v-for="(qual, index) in exp.qualifications" :key="index" class="text-white-75">
                  <i class="fas fa-star me-2 text-warning"></i> {{ qual }}
                </li>
              </ul>
            </div>
            <p v-if="exp.references" class="card-text text-white-50 mt-3" style="font-size: 0.85rem;">Referanslar: {{ exp.references }}</p>
          </div>
        </div>
      </section>

      <section id="contact" class="py-5 bg-dark d-flex flex-column align-items-center justify-content-center text-center shadow-lg mb-0">
        <h2 class="display-5 fw-bold mb-4 text-info animate__animated animate__fadeIn">Bana Ulaşın</h2>
        <div v-if="contact">
          <p class="lead text-white-75 mb-3">
            <i class="fas fa-phone-alt me-2 text-info"></i> Telefon: <span class="fw-semibold">{{ contact.phone || 'Telefon bilgisi yok' }}</span>
          </p>
          <p class="lead text-white-75">
            <i class="fas fa-envelope me-2 text-info"></i> E-posta: <span class="fw-semibold">{{ contact.email || 'E-posta bilgisi yok' }}</span>
          </p>
        </div>
        <div v-else class="text-center text-white-50">İletişim bilgileri eklenmemiş.</div>
      </section>

      <footer class="py-4 bg-black text-center text-white-50 small">
        <p>&copy; {{ new Date().getFullYear() }} Yaşar Berk Harmanşah. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Bootstrap'in varsayılan responsive davranışları ve utility sınıfları kullanıldığı için
   burada sadece özel durumlar veya animasyonlar için stil tutulur. */

/* Tailwind'den kalan no-scrollbar'ı Bootstrap için yeniden yazalım */
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.no-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* Animasyonlar için Animate.css kütüphanesi kullanılabilir */
/* Örneğin: npm install animate.css --save */
/* Ve main.js'e import 'animate.css'; ekleyin */
/* Aksi takdirde, bu animasyon keyframelerini manuel olarak tanımlamanız gerekir */
/* Aşağıdaki kodlar Tailwind'den aktarılan animasyonları içerir */
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate__animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}
.animate__fadeInDown { animation-name: fadeInDown; }
.animate__fadeInUp { animation-name: fadeInUp; }
.animate__fadeIn { animation-name: fadeIn; }

/* Hakkımda bölümündeki desen arkaplanı */
.pattern-bg {
  background-image: url('data:image/svg+xml,%3Csvg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239C92AC" fill-opacity="0.2" fill-rule="evenodd"%3E%3Cpath d="M5 0h1L0 6V5zM6 5v1H5z"/%3E%3C/g%3E%3C/svg%3E');
}

/* Hover efektleri için özel CSS */
.hover\:text-primary:hover {
    color: #007bff !important; /* Bootstrap'in --bs-primary rengi */
}
.hover\:text-info:hover {
    color: #0dcaf0 !important; /* Bootstrap'in --bs-info rengi */
}

/* Projeler kaydırma butonları için konumlandırma */
.carousel-control-prev-proj,
.carousel-control-next-proj {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center; /* Dikeyde ortala */
  justify-content: center; /* Yatayda ortala */
  color: white;
  opacity: 0.9;
  z-index: 10;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.carousel-control-prev-proj:hover,
.carousel-control-next-proj:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.carousel-control-prev-proj {
  left: 0px;
}

.carousel-control-next-proj {
  right: 0px;
}

/* İkon boyutları */
.carousel-control-prev-proj .carousel-control-prev-icon,
.carousel-control-next-proj .carousel-control-next-icon {
  width: 25px;
  height: 25px;
  background-size: 100% 100%;
  filter: brightness(1.5);
  display: block; /* Flexbox içinde kendi boyutunu alması için */
}

/* responsive düzenleme: küçük ekranlarda butonları biraz içeri çekebiliriz */
@media (max-width: 768px) {
  .carousel-control-prev-proj {
    left: 5px;
  }
  .carousel-control-next-proj {
    right: 5px;
  }
}
</style>