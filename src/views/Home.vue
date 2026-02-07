<script setup>
import { onMounted, computed, ref } from 'vue'; // ref'i import et
import { usePortfolioStore } from '../stores/portfolio';
import ProjectModal from '../components/ProjectModal.vue'; // ProjectModal import edildi
import { Modal } from 'bootstrap';

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

const formatExperienceDate = (value) => {
  if (!value) return 'Devam Ediyor';
  const date = value.seconds ? new Date(value.seconds * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Devam Ediyor';
  return date.toLocaleDateString('tr-TR');
};

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

// Proje açıklamasını kısaltma fonksiyonu
const truncatedDescription = (description) => {
  const maxLength = 100; // Kaç karakter görünecek
  if (!description) return '';
  if (description.length > maxLength) {
    return description.substring(0, maxLength) + '... Daha Fazla Oku';
  }
  return description;
};

// Modal'ı açma ve seçili projeyi ayarlama fonksiyonu
const openProjectModal = (project) => {
  portfolioStore.setSelectedProject(project); // Seçilen projeyi store'a kaydet
  
  const modalElement = document.getElementById('projectDetailModal');
  if (modalElement) {
    const projectModal = new Modal(modalElement); // Doğrudan import edilen Modal'ı kullanın
    projectModal.show();
  } else {
    console.error("Modal elementi bulunamadı: #projectDetailModal");
  }
};
</script>

<template>
  <div class="text-white home-shell">
    <div v-if="loading" class="text-center py-5">Yükleniyor...</div>
    <div v-else-if="error" class="text-center py-5 text-danger">Hata: {{ error }}</div>
    <div v-else>
      <section id="about" class="d-flex flex-column align-items-center justify-content-center p-4 text-center shadow-lg mb-0 position-relative overflow-hidden hero-section">
        <div class="position-absolute w-100 h-100 pattern-bg opacity-25"></div>
        <div class="hero-content d-flex flex-column align-items-center justify-content-center text-center w-100 h-100 px-3 py-5 py-md-5">
          <div class="hero-badge mb-4">
            <span class="badge rounded-pill">Creative Developer Portfolio</span>
          </div>
          <img :src="profileImage" alt="Profil Resmi" class="rounded-circle img-fluid mb-4 border border-5 border-primary shadow-lg hero-avatar" style="width: 160px; height: 160px; object-fit: cover;">
          <h1 class="display-4 fw-bold text-white hero-title">{{ about?.heading || 'Hoş Geldiniz!' }}</h1>
          <p class="lead mt-3 text-white-50 mx-auto hero-subtitle" style="max-width: 720px;">
            {{ about?.text || 'Henüz Hakkımda yazısı eklenmemiş.' }}
          </p>
          <div class="d-flex flex-wrap justify-content-center gap-3 mt-4 hero-actions">
            <a href="#projects" class="btn btn-info btn-lg shadow-sm">Projelerime Göz At</a>
            <a href="#contact" class="btn btn-outline-light btn-lg">İletişime Geç</a>
          </div>
          <div class="hero-glow"></div>
        </div>
      </section>

      <section id="social-links" class="py-5 text-center shadow-sm mb-0 social-section">
        <div class="d-flex justify-content-center flex-wrap gap-4">
          <a v-for="link in socialLinks" :key="link.name" :href="link.url" target="_blank"
             class="text-secondary text-decoration-none social-link"
             :aria-label="link.name"
             :title="link.name">
            <i :class="['fs-2', link.icon]"></i>
            <span class="small d-block mt-2">{{ link.name }}</span>
          </a>
        </div>
      </section>

      <section id="projects" class="py-5 d-flex flex-column align-items-center justify-content-center shadow-lg mb-0 projects-section">
        <h2 class="display-5 fw-bold text-center mb-5 text-info section-title">Projelerim</h2>
        <div v-if="projects.length === 0" class="text-center text-white-50">Henüz proje eklenmemiş.</div>
        <div v-else class="position-relative w-100">
          <div ref="projectsContainer" class="d-flex overflow-auto pb-3 px-0 no-scrollbar" style="scroll-behavior: smooth;">
            <div v-for="project in projects" :key="project.id"
                 class="card text-white m-3 shadow-lg flex-shrink-0 project-card"
                 style="min-width: 300px; max-width: 350px; cursor: pointer;"
                 @click="openProjectModal(project)">
              <div class="project-media">
                <img v-if="project.imageUrl" :src="project.imageUrl" :alt="project.title" class="card-img-top" style="height: 190px; object-fit: cover;">
                <div class="project-overlay">
                  <span class="badge bg-dark bg-opacity-50">Case Study</span>
                </div>
              </div>
              <div class="card-body">
                <h3 class="card-title fs-4 text-info">{{ project.title }}</h3>
                <p class="card-text text-white-75" style="font-size: 0.9rem;">{{ truncatedDescription(project.description) }}</p>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <span v-for="tech in project.technologies" :key="tech" class="badge tech-badge">
                    {{ tech }}
                  </span>
                </div>
                <button class="btn btn-outline-light btn-sm mt-2">
                  Detayları Gör
                </button>
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

      <section id="experiences" class="py-5 d-flex flex-column align-items-center justify-content-center shadow-lg mb-0 experiences-section">
        <h2 class="display-5 fw-bold text-center mb-5 text-info section-title">İş Tecrübelerim</h2>
        <div v-if="experiences.length === 0" class="text-center text-white-50">Henüz iş tecrübesi eklenmemiş.</div>
        <div v-else class="container" style="max-width: 800px;">
          <div v-for="exp in experiences" :key="exp.id" class="card text-white p-4 shadow-lg mb-4 experience-card">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
              <div>
                <h3 class="card-title fs-4 text-info mb-1">{{ exp.company }}</h3>
                <p class="card-subtitle mb-2 text-white-75">{{ exp.position }}</p>
                <p class="card-text text-white-50" style="font-size: 0.9rem;">
                  {{ formatExperienceDate(exp.startDate) }} - {{ formatExperienceDate(exp.endDate) }}
                </p>
              </div>
              <span class="badge exp-badge">Full-time</span>
            </div>
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

      <section id="contact" class="py-5 d-flex flex-column align-items-center justify-content-center text-center shadow-lg mb-0 contact-section">
        <h2 class="display-5 fw-bold mb-4 text-info section-title">Bana Ulaşın</h2>
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
    <ProjectModal />
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
  z-index: 0;
  pointer-events: none;
}

.home-shell {
  background: radial-gradient(circle at 10% 10%, rgba(57, 197, 255, 0.08), transparent 40%),
    radial-gradient(circle at 90% 10%, rgba(139, 92, 246, 0.08), transparent 45%),
    #0b0f19;
}

.hero-content {
  position: relative;
  z-index: 1;
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

/* Hero ve kart iyileştirmeleri */
.hero-section {
  background: radial-gradient(circle at top, rgba(57, 197, 255, 0.25), transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.25), transparent 55%);
  min-height: 100vh;
}

.hero-badge .badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  padding: 0.6rem 1.2rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.7rem;
}

.hero-title {
  background: linear-gradient(90deg, #ffffff, #9ee7ff 45%, #c7b5ff);
  -webkit-background-clip: text;
  color: transparent;
}

.hero-avatar {
  animation: float 6s ease-in-out infinite;
}

.hero-subtitle {
  line-height: 1.7;
}

.hero-actions .btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hero-actions .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.35);
}

.hero-glow {
  position: absolute;
  inset: 0;
  border-radius: 32px;
  background: radial-gradient(circle at 50% 0%, rgba(57, 197, 255, 0.2), transparent 60%);
  filter: blur(40px);
  opacity: 0.7;
  pointer-events: none;
  z-index: -1;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.social-link {
  transition: transform 0.2s ease, color 0.2s ease;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.social-link:hover {
  transform: translateY(-2px);
  color: #39c5ff;
}
.project-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(12px);
}
.project-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.35);
}

.project-media {
  position: relative;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
}

.project-media img {
  transition: transform 0.4s ease;
}

.project-card:hover .project-media img {
  transform: scale(1.05);
}

.project-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 1rem;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.65), transparent 60%);
}

.tech-badge {
  background: rgba(57, 197, 255, 0.15);
  color: #9ee7ff;
  border: 1px solid rgba(57, 197, 255, 0.35);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.75rem;
}

.experience-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.18);
  backdrop-filter: blur(14px);
}

.exp-badge {
  background: rgba(139, 92, 246, 0.2);
  color: #c7b5ff;
  border: 1px solid rgba(139, 92, 246, 0.4);
  padding: 0.4rem 0.8rem;
}

.projects-section,
.experiences-section,
.contact-section,
.social-section {
  background: rgba(11, 15, 25, 0.8);
}

section#about {
  min-height: 100vh; /* Varsayılan olarak ekran yüksekliğinin tamamı */
  padding-top: 5rem; /* Navbar yüksekliğine göre ayarla */
  padding-bottom: 3rem; /* Alttan boşluk */
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

@media (max-width: 767.98px) { /* Bootstrap'in sm breakpoint'inden küçük ekranlar için */
  section#about {
    min-height: 85vh; /* Mobilde daha küçük bir min-height, deneysel değer */
    padding-top: 2rem; /* Navbar altından başla */
    padding-bottom: 2rem;
    align-items: center; /* İçeriği dikeyde ortala */
    justify-content: center; /* İçeriği yatayda ortala */
  }

  section#about .hero-content {
    /* İçerik div'inin dikey hizalamasını ve boşluklarını ayarla */
    padding-top: 1rem; /* Mobilde daha az üst boşluk */
    padding-bottom: 1rem; /* Mobilde daha az alt boşluk */
    /* min-height: auto; kaldırıldı, section'ın min-height'ı yeterli olacak */
  }

  /* Profil resmi ve başlığın mobil boyutları */
  section#about img {
    width: 100px !important; /* Mobilde daha küçük profil resmi */
    height: 100px !important;
  }

  section#about h1 {
    font-size: 2rem !important; /* Mobilde daha küçük başlık */
    line-height: 1.2 !important; /* Satır yüksekliğini ayarla */
  }

  section#about p.lead {
    font-size: 0.9rem !important; /* Mobilde daha küçük paragraf metni */
  }
}
</style>
