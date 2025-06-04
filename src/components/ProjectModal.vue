<template>
  <div class="modal fade" id="projectDetailModal" tabindex="-1" aria-labelledby="projectDetailModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content bg-dark text-light">
        <div class="modal-header border-bottom-0">
          <h5 class="modal-title" id="projectDetailModalLabel">{{ selectedProject ? selectedProject.title : '' }}</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedProject">
            <img :src="selectedProject.imageUrl" :alt="selectedProject.title" class="img-fluid mb-3 rounded shadow-sm"/>
            <p class="text-white-50">{{ selectedProject.description }}</p>
            <div class="mt-3">
              <h6 class="text-primary">Kullanılan Teknolojiler:</h6>
              <span v-for="tech in selectedProject.technologies" :key="tech" class="badge bg-secondary me-2 mb-2">
                {{ tech }}
              </span>
            </div>
            <div class="mt-4 d-flex justify-content-center">
              <a v-if="selectedProject.liveDemoUrl" :href="selectedProject.liveDemoUrl" target="_blank" class="btn btn-primary me-3">
                <i class="fas fa-external-link-alt me-2"></i>Canlı Demo
              </a>
              <a v-if="selectedProject.githubUrl" :href="selectedProject.githubUrl" target="_blank" class="btn btn-secondary">
                <i class="fab fa-github me-2"></i>GitHub
              </a>
            </div>
          </div>
          <div v-else class="text-center text-muted">
            Proje detayları yükleniyor...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { usePortfolioStore } from '../stores/portfolio'; //

export default {
  setup() {
    const portfolioStore = usePortfolioStore(); //
    const selectedProject = computed(() => portfolioStore.selectedProject);

    return {
      selectedProject,
    };
  },
};
</script>

<style scoped>
/* Modalınıza özel stiller ekleyebilirsiniz */
.modal-content {
  background-color: #212529; /* Bootstrap dark background */
  color: #f8f9fa; /* Bootstrap dark text */
}

.img-fluid {
  max-height: 400px; /* Resim yüksekliğini sınırlama */
  object-fit: contain; /* Resmin oranını koruma */
  width: 100%; /* Genişliği doldurma */
}

.badge {
  font-size: 0.85em;
  padding: 0.5em 0.8em;
  border-radius: 0.3rem;
}
</style>