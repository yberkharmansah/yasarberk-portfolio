<template>
  <div class="project-card" @click="openProjectModal(project)">
    <img :src="project.imageUrl" :alt="project.title" class="project-image"/>
    <h3 class="project-title">{{ project.title }}</h3>
    <p class="project-description">{{ truncatedDescription(project.description) }}</p>
    </div>
</template>

<script>
import { usePortfolioStore } from '../stores/portfolio'; //

export default {
  props: ['project'],
  setup() {
    const portfolioStore = usePortfolioStore(); //

    const openProjectModal = (project) => {
      portfolioStore.setSelectedProject(project); // Seçilen projeyi store'a kaydet (Bu action'ı portfolio.js'e ekleyeceğiz)
      // Bootstrap modalını manuel olarak aç
      const modalElement = document.getElementById('projectDetailModal');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    };

    const truncatedDescription = (description) => {
      const maxLength = 100; // Kaç karakter görünecek
      if (!description) return '';
      if (description.length > maxLength) {
        return description.substring(0, maxLength) + '... Daha Fazla Oku';
      }
      return description;
    };

    return {
      openProjectModal,
      truncatedDescription,
    };
  },
};
</script>

<style scoped>
/* Mevcut stiliniz */
.project-card {
  cursor: pointer; /* Tıklanabilir olduğunu belirtmek için */
  /* Diğer stil kurallarınız */
}
</style>