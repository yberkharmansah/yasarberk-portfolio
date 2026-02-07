<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { usePortfolioStore } from '../stores/portfolio';
import AdminModal from '../components/AdminModal.vue';

const router = useRouter();
const portfolioStore = usePortfolioStore();

const activeSection = ref('about'); // Varsayılan olarak 'Hakkımda' bölümü açık

// Hakkımda form verileri
const editingAbout = ref(false);
const aboutHeading = ref('');
const aboutText = ref('');
const aboutProfileImageFile = ref(null);
const aboutProfileImageUrl = ref('');

// Sosyal Medya form verileri
const showingSocialLinkModal = ref(false);
const editingSocialLink = ref(null);
const currentSocialLinkName = ref('');
const currentSocialLinkUrl = ref('');
const currentSocialLinkIcon = ref('');

// Proje form verileri
const showingProjectModal = ref(false);
const editingProject = ref(null);
const currentProjectTitle = ref('');
const currentProjectDescription = ref('');
const currentProjectTechnologies = ref('');
const currentProjectImageFile = ref(null);
const currentProjectImageUrl = ref('');
const currentProjectLiveDemoUrl = ref('');
const currentProjectGithubUrl = ref('');
const currentProjectOrder = ref(0);

// İş Tecrübesi form verileri (YENİ)
const showingExperienceModal = ref(false);
const editingExperience = ref(null); // Düzenlenen tecrübe objesi (null ise yeni ekleme)
const currentExpCompany = ref('');
const currentExpPosition = ref('');
const currentExpStartDate = ref(''); // YYYY-MM-DD formatında string
const currentExpEndDate = ref('');   // YYYY-MM-DD formatında string veya boş
const currentExpResponsibilities = ref(''); // Virgülle ayrılmış string
const currentExpQualifications = ref(''); // Virgülle ayrılmış string
const currentExpReferences = ref(''); // Metin
// İletişim Bilgileri form verileri (YENİ EKLENEN)
const editingContact = ref(false);
const contactPhone = ref('');
const contactEmail = ref('');

// Verileri Pinia store'dan alalım
const about = computed(() => portfolioStore.about);
const socialLinks = computed(() => portfolioStore.socialLinks);
const projects = computed(() => portfolioStore.projects);
const experiences = computed(() => portfolioStore.experiences);
const contact = computed(() => portfolioStore.contact);
const loading = computed(() => portfolioStore.loading);
const error = computed(() => portfolioStore.error);

// Hakkımda verisi değiştiğinde form alanlarını güncelle
watch(about, (newVal) => {
  if (newVal) {
    aboutHeading.value = newVal.heading || '';
    aboutText.value = newVal.text || '';
    aboutProfileImageUrl.value = newVal.profileImageUrl || '';
  }
}, { immediate: true });

// İletişim verisi değiştiğinde form alanlarını güncelle (YENİ EKLENEN)
watch(contact, (newVal) => {
  if (newVal) {
    contactPhone.value = newVal.phone || '';
    contactEmail.value = newVal.email || '';
  }
}, { immediate: true });

onMounted(() => {
  portfolioStore.fetchPortfolioContent();
});

const handleLogout = async () => {
  try {
    await signOut(auth);
    alert('Başarıyla çıkış yapıldı.');
    router.push({ name: 'AdminLogin' });
  } catch (error) {
    console.error('Çıkış hatası:', error);
    alert('Çıkış yapılırken bir hata oluştu.');
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Devam Ediyor';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  return date.toLocaleDateString();
};

const formatDateForInput = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

// Hakkımda Resim Yükleme
const handleProfileImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    aboutProfileImageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      aboutProfileImageUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const saveAbout = async () => {
  try {
    let imageUrlToSave = aboutProfileImageUrl.value;
    if (aboutProfileImageFile.value) {
      imageUrlToSave = await portfolioStore.uploadImage(aboutProfileImageFile.value);
      aboutProfileImageFile.value = null;
    }
    const updatedAboutData = {
      heading: aboutHeading.value,
      text: aboutText.value,
      profileImageUrl: imageUrlToSave,
    };
    await portfolioStore.updateAbout(updatedAboutData);
    alert('Hakkımda bilgileri başarıyla güncellendi!');
    editingAbout.value = false;
  } catch (err) {
    alert('Hakkımda bilgileri güncellenirken hata oluştu: ' + err.message);
  }
};

const cancelEditAbout = () => {
  aboutHeading.value = about.value?.heading || '';
  aboutText.value = about.value?.text || '';
  aboutProfileImageUrl.value = about.value?.profileImageUrl || '';
  aboutProfileImageFile.value = null;
  editingAbout.value = false;
};

// Sosyal Medya Linkleri Fonksiyonları
const openSocialLinkModal = (link = null) => {
  editingSocialLink.value = link;
  if (link) {
    currentSocialLinkName.value = link.name || '';
    currentSocialLinkUrl.value = link.url || '';
    currentSocialLinkIcon.value = link.icon || '';
  } else {
    currentSocialLinkName.value = '';
    currentSocialLinkUrl.value = '';
    currentSocialLinkIcon.value = '';
  }
  showingSocialLinkModal.value = true;
};

const closeSocialLinkModal = () => {
  showingSocialLinkModal.value = false;
  editingSocialLink.value = null;
  currentSocialLinkName.value = '';
  currentSocialLinkUrl.value = '';
  currentSocialLinkIcon.value = '';
};

const saveSocialLink = async () => {
  const name = currentSocialLinkName.value ? currentSocialLinkName.value.trim() : '';
  const url = currentSocialLinkUrl.value ? currentSocialLinkUrl.value.trim() : '';
  const icon = currentSocialLinkIcon.value ? currentSocialLinkIcon.value.trim() : '';

  if (!name || !url || !icon) {
    alert('Lütfen tüm sosyal medya linki alanlarını doldurun.');
    return;
  }

  const linkDataToSend = {
    name: name,
    url: url,
    icon: icon
  };

  try {
    if (editingSocialLink.value) {
      const linkId = editingSocialLink.value.id;
      if (!linkId) {
        throw new Error("Düzenlenecek linkin ID'si bulunamadı.");
      }
      await portfolioStore.editSocialLink({ ...linkDataToSend, id: String(linkId) });
      alert('Sosyal medya linki başarıyla güncellendi!');
    } else {
      await portfolioStore.addSocialLink(linkDataToSend);
      alert('Yeni sosyal medya linki başarıyla eklendi!');
    }
    closeSocialLinkModal();
  } catch (err) {
    alert('Sosyal medya linki kaydedilirken hata oluştu: ' + err.message);
  }
};

const deleteSocialLink = async (linkId) => {
  if (confirm('Bu sosyal medya linkini silmek istediğinizden emin misiniz?')) {
    try {
      if (!linkId) {
        throw new Error("Silinecek linkin ID'si bulunamadı.");
      }
      await portfolioStore.deleteSocialLink(String(linkId));
      alert('Sosyal medya linki başarıyla silindi!');
    } catch (err) {
      alert('Sosyal medya linki silinirken hata oluştu: ' + err.message);
    }
  }
};

// Projeler Fonksiyonları
const openProjectModal = (project = null) => {
  editingProject.value = project;
  if (project) {
    currentProjectTitle.value = project.title || '';
    currentProjectDescription.value = project.description || '';
    currentProjectTechnologies.value = project.technologies?.join(', ') || '';
    currentProjectImageUrl.value = project.imageUrl || '';
    currentProjectLiveDemoUrl.value = project.liveDemoUrl || '';
    currentProjectGithubUrl.value = project.githubUrl || '';
    currentProjectOrder.value = project.order || 0;
  } else {
    currentProjectTitle.value = '';
    currentProjectDescription.value = '';
    currentProjectTechnologies.value = '';
    currentProjectImageUrl.value = '';
    currentProjectLiveDemoUrl.value = '';
    currentProjectGithubUrl.value = '';
    currentProjectOrder.value = projects.value.length > 0 ? Math.max(...projects.value.map(p => p.order || 0)) + 1 : 0;
  }
  currentProjectImageFile.value = null;
  showingProjectModal.value = true;
};

const closeProjectModal = () => {
  showingProjectModal.value = false;
  editingProject.value = null;
  currentProjectTitle.value = '';
  currentProjectDescription.value = '';
  currentProjectTechnologies.value = '';
  currentProjectImageFile.value = null;
  currentProjectImageUrl.value = '';
  currentProjectLiveDemoUrl.value = '';
  currentProjectGithubUrl.value = '';
  currentProjectOrder.value = 0;
};

const handleProjectImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    currentProjectImageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      currentProjectImageUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const saveProject = async () => {
  if (!currentProjectTitle.value.trim() || !currentProjectDescription.value.trim()) {
    alert('Proje başlığı ve açıklaması boş olamaz.');
    return;
  }

  try {
    let imageUrlToSave = currentProjectImageUrl.value;
    if (currentProjectImageFile.value) {
      imageUrlToSave = await portfolioStore.uploadImage(currentProjectImageFile.value);
      currentProjectImageFile.value = null;
    }

    const projectData = {
      title: currentProjectTitle.value.trim(),
      description: currentProjectDescription.value.trim(),
      technologies: currentProjectTechnologies.value.split(',').map(tech => tech.trim()).filter(tech => tech),
      imageUrl: imageUrlToSave,
      liveDemoUrl: currentProjectLiveDemoUrl.value.trim(),
      githubUrl: currentProjectGithubUrl.value.trim(),
      order: Number(currentProjectOrder.value) || 0,
    };

    if (editingProject.value) {
      await portfolioStore.editProject({ ...projectData, id: editingProject.value.id });
      alert('Proje başarıyla güncellendi!');
    } else {
      await portfolioStore.addProject(projectData);
      alert('Yeni proje başarıyla eklendi!');
    }
    closeProjectModal();
  } catch (err) {
    alert('Proje kaydedilirken hata oluştu: ' + err.message);
  }
};

const deleteProject = async (projectId) => {
  if (confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
    try {
      await portfolioStore.deleteProject(projectId);
      alert('Proje başarıyla silindi!');
    } catch (err) {
      alert('Proje silinirken hata oluştu: ' + err.message);
    }
  }
};

// İş Tecrübeleri Fonksiyonları (YENİ)
const openExperienceModal = (experience = null) => {
  editingExperience.value = experience;
  if (experience) {
    currentExpCompany.value = experience.company || '';
    currentExpPosition.value = experience.position || '';
    currentExpStartDate.value = formatDateForInput(experience.startDate); // Tarihi YYYY-MM-DD formatına çevir
    currentExpEndDate.value = formatDateForInput(experience.endDate);     // Tarihi YYYY-MM-DD formatına çevir
    currentExpResponsibilities.value = experience.responsibilities?.join(', ') || '';
    currentExpQualifications.value = experience.qualifications?.join(', ') || '';
    currentExpReferences.value = experience.references || '';
  } else {
    currentExpCompany.value = '';
    currentExpPosition.value = '';
    currentExpStartDate.value = '';
    currentExpEndDate.value = '';
    currentExpResponsibilities.value = '';
    currentExpQualifications.value = '';
    currentExpReferences.value = '';
  }
  showingExperienceModal.value = true;
};

const closeExperienceModal = () => {
  showingExperienceModal.value = false;
  editingExperience.value = null;
  currentExpCompany.value = '';
  currentExpPosition.value = '';
  currentExpStartDate.value = '';
  currentExpEndDate.value = '';
  currentExpResponsibilities.value = '';
  currentExpQualifications.value = '';
  currentExpReferences.value = '';
};

const saveExperience = async () => {
  if (!currentExpCompany.value.trim() || !currentExpPosition.value.trim() || !currentExpStartDate.value.trim()) {
    alert('Şirket, pozisyon ve başlangıç tarihi boş olamaz.');
    return;
  }

  try {
    const experienceData = {
      company: currentExpCompany.value.trim(),
      position: currentExpPosition.value.trim(),
      // Date objesine çeviriyoruz
      startDate: new Date(currentExpStartDate.value),
      endDate: currentExpEndDate.value.trim() ? new Date(currentExpEndDate.value) : null, // Boşsa null yap
      responsibilities: currentExpResponsibilities.value.split(',').map(r => r.trim()).filter(r => r),
      qualifications: currentExpQualifications.value.split(',').map(q => q.trim()).filter(q => q),
      references: currentExpReferences.value.trim(),
    };

    if (editingExperience.value) {
      await portfolioStore.editExperience({ ...experienceData, id: editingExperience.value.id });
      alert('İş tecrübesi başarıyla güncellendi!');
    } else {
      await portfolioStore.addExperience(experienceData);
      alert('Yeni iş tecrübesi başarıyla eklendi!');
    }
    closeExperienceModal();
  } catch (err) {
    alert('İş tecrübesi kaydedilirken hata oluştu: ' + err.message);
  }
  };
const saveContact = async () => {
  if (!contactPhone.value.trim() || !contactEmail.value.trim()) {
    alert('Telefon ve e-posta boş olamaz.');
    return;
  }
  try {
    const updatedContactData = {
      phone: contactPhone.value.trim(),
      email: contactEmail.value.trim(),
    };
    await portfolioStore.updateContact(updatedContactData);
    alert('İletişim bilgileri başarıyla güncellendi!');
    editingContact.value = false;
  } catch (err) {
    alert('İletişim bilgileri güncellenirken hata oluştu: ' + err.message);
  }
};

const cancelEditContact = () => {
  contactPhone.value = contact.value?.phone || '';
  contactEmail.value = contact.value?.email || '';
  editingContact.value = false;
};


const deleteExperience = async (experienceId) => {
  if (confirm('Bu iş tecrübesini silmek istediğinizden emin misiniz?')) {
    try {
      await portfolioStore.deleteExperience(experienceId);
      alert('İş tecrübesi başarıyla silindi!');
    } catch (err) {
      alert('İş tecrübesi silinirken hata oluştu: ' + err.message);
    }
  }
};

</script>

<template>
  <div class="admin-dashboard-container py-5 bg-dark text-white min-vh-100">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <h1 class="text-info">Admin Paneli</h1>
        <button @click="handleLogout" class="btn btn-danger">Çıkış Yap</button>
      </div>

      <div class="row">
        <div class="col-md-3">
          <div class="list-group">
            <a href="#" @click.prevent="activeSection = 'about'"
               :class="['list-group-item list-group-item-action', {'active bg-primary text-white': activeSection === 'about'}, 'bg-secondary', 'text-white']">
              Hakkımda
            </a>
            <a href="#" @click.prevent="activeSection = 'socialLinks'"
               :class="['list-group-item list-group-item-action', {'active bg-primary text-white': activeSection === 'socialLinks'}, 'bg-secondary', 'text-white']">
              Sosyal Medya
            </a>
            <a href="#" @click.prevent="activeSection = 'projects'"
               :class="['list-group-item list-group-item-action', {'active bg-primary text-white': activeSection === 'projects'}, 'bg-secondary', 'text-white']">
              Projeler
            </a>
            <a href="#" @click.prevent="activeSection = 'experiences'"
               :class="['list-group-item list-group-item-action', {'active bg-primary text-white': activeSection === 'experiences'}, 'bg-secondary', 'text-white']">
              İş Tecrübeleri
            </a>
            <a href="#" @click.prevent="activeSection = 'contact'"
               :class="['list-group-item list-group-item-action', {'active bg-primary text-white': activeSection === 'contact'}, 'bg-secondary', 'text-white']">
              İletişim Bilgileri
            </a>
          </div>
        </div>
        <div class="col-md-9">
          <div class="card bg-secondary text-white p-4 shadow-lg">
            <h2 class="text-info mb-4">İçerik Yönetimi</h2>

            <div v-if="loading" class="text-center">İçerikler yükleniyor...</div>
            <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-else>
              <div v-if="activeSection === 'about'">
                <h3>Hakkımda Bilgileri</h3>
                <div v-if="!editingAbout">
                  <div class="mb-3">
                    <strong>Başlık:</strong> {{ about?.heading }}
                  </div>
                  <div class="mb-3">
                    <strong>Metin:</strong> {{ truncateText(about?.text, 200) }}
                  </div>
                  <div class="mb-3">
                    <strong>Profil Resmi:</strong>
                    <img :src="about?.profileImageUrl" alt="Profil" class="img-thumbnail" style="width: 100px; height: 100px; object-fit: cover;">
                  </div>
                  <button class="btn btn-primary" @click="editingAbout = true">Düzenle</button>
                </div>
                <div v-else>
                  <form @submit.prevent="saveAbout">
                    <div class="mb-3">
                      <label for="aboutHeading" class="form-label">Başlık</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" id="aboutHeading" v-model="aboutHeading" required>
                    </div>
                    <div class="mb-3">
                      <label for="aboutText" class="form-label">Metin</label>
                      <textarea class="form-control bg-dark text-white border-secondary" id="aboutText" v-model="aboutText" rows="5" required></textarea>
                    </div>
                    <div class="mb-3">
                      <label for="profileImage" class="form-label">Profil Resmi</label>
                      <input type="file" class="form-control bg-dark text-white border-secondary" id="profileImage" @change="handleProfileImageChange" accept="image/*">
                      <div class="mt-2" v-if="aboutProfileImageUrl">
                        <img :src="aboutProfileImageUrl" alt="Mevcut Profil" class="img-thumbnail" style="width: 100px; height: 100px; object-fit: cover;">
                      </div>
                    </div>
                    <button type="submit" class="btn btn-success me-2">Kaydet</button>
                    <button type="button" class="btn btn-secondary" @click="cancelEditAbout">İptal</button>
                  </form>
                </div>
              </div>

              <div v-if="activeSection === 'socialLinks'">
                <h3>Sosyal Medya Linkleri</h3>
                <ul class="list-group mb-3">
                  <li v-for="link in socialLinks" :key="link.id || link.name" class="list-group-item bg-dark text-white d-flex justify-content-between align-items-center">
                    <div>
                      <i :class="link.icon" class="me-2 text-info"></i>
                      <strong>{{ link.name }}:</strong> <a :href="link.url" target="_blank" class="text-white-50">{{ link.url }}</a>
                    </div>
                    <div>
                      <button class="btn btn-sm btn-primary me-2" @click="openSocialLinkModal(link)">Düzenle</button>
                      <button class="btn btn-sm btn-danger" @click="deleteSocialLink(link.id || link.name)">Sil</button>
                    </div>
                  </li>
                </ul>
                <button class="btn btn-success" @click="openSocialLinkModal()">Yeni Link Ekle</button>

                <AdminModal
                  :open="showingSocialLinkModal"
                  :title="editingSocialLink ? 'Link Düzenle' : 'Yeni Link Ekle'"
                  @close="closeSocialLinkModal"
                >
                  <form @submit.prevent="saveSocialLink">
                    <div class="mb-3">
                      <label for="linkName" class="form-label">Platform Adı (örn: LinkedIn)</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" id="linkName" v-model="currentSocialLinkName" required>
                    </div>
                    <div class="mb-3">
                      <label for="linkUrl" class="form-label">Link URL'si</label>
                      <input type="url" class="form-control bg-dark text-white border-secondary" id="linkUrl" v-model="currentSocialLinkUrl" required>
                    </div>
                    <div class="mb-3">
                      <label for="linkIcon" class="form-label">İkon Sınıfı (örn: fab fa-linkedin-in)</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" id="linkIcon" v-model="currentSocialLinkIcon" required>
                      <small class="form-text text-white-50">Font Awesome ikon sınıflarını kullanın. Örnek: `fab fa-github`, `fab fa-instagram`</small>
                    </div>
                    <div class="d-flex justify-content-end">
                      <button type="submit" class="btn btn-success me-2">Kaydet</button>
                      <button type="button" class="btn btn-secondary" @click="closeSocialLinkModal">İptal</button>
                    </div>
                  </form>
                </AdminModal>
              </div>

              <div v-if="activeSection === 'projects'">
                <h3>Projeler</h3>
                <ul class="list-group mb-3">
                  <li v-for="project in projects" :key="project.id" class="list-group-item bg-dark text-white mb-3 shadow-sm">
                    <div class="d-flex align-items-start">
                      <img v-if="project.imageUrl" :src="project.imageUrl" alt="Proje" class="img-thumbnail me-3" style="width: 80px; height: 80px; object-fit: cover;">
                      <div>
                        <h5>{{ project.title }}</h5>
                        <p class="text-white-50 mb-1">{{ truncateText(project.description, 100) }}</p>
                        <p class="text-white-50 small mb-1"><strong>Teknolojiler:</strong> {{ project.technologies?.join(', ') }}</p>
                        <a v-if="project.liveDemoUrl" :href="project.liveDemoUrl" target="_blank" class="btn btn-sm btn-info me-2">Canlı</a>
                        <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" class="btn btn-sm btn-secondary">GitHub</a>
                      </div>
                    </div>
                    <div class="d-flex justify-content-end mt-3">
                      <button class="btn btn-sm btn-primary me-2" @click="openProjectModal(project)">Düzenle</button>
                      <button class="btn btn-sm btn-danger" @click="deleteProject(project.id)">Sil</button>
                    </div>
                  </li>
                </ul>
                <button class="btn btn-success" @click="openProjectModal()">Yeni Proje Ekle</button>

                <AdminModal
                  :open="showingProjectModal"
                  :title="editingProject ? 'Proje Düzenle' : 'Yeni Proje Ekle'"
                  size="lg"
                  @close="closeProjectModal"
                >
                  <form @submit.prevent="saveProject">
                    <div class="mb-3">
                      <label for="projectTitle" class="form-label">Proje Başlığı</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" id="projectTitle" v-model="currentProjectTitle" required>
                    </div>
                    <div class="mb-3">
                      <label for="projectDescription" class="form-label">Açıklama</label>
                      <textarea class="form-control bg-dark text-white border-secondary" id="projectDescription" v-model="currentProjectDescription" rows="3" required></textarea>
                    </div>
                    <div class="mb-3">
                      <label for="projectTechnologies" class="form-label">Kullanılan Teknolojiler (virgülle ayırın)</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" id="projectTechnologies" v-model="currentProjectTechnologies">
                      <small class="form-text text-white-50">Örn: `Vue.js, Firebase, Bootstrap`</small>
                    </div>
                    <div class="mb-3">
                      <label for="projectImage" class="form-label">Proje Resmi</label>
                      <input type="file" class="form-control bg-dark text-white border-secondary" id="projectImage" @change="handleProjectImageChange" accept="image/*">
                      <div class="mt-2" v-if="currentProjectImageUrl">
                        <img :src="currentProjectImageUrl" alt="Mevcut Proje Resmi" class="img-thumbnail" style="width: 100px; height: 100px; object-fit: cover;">
                      </div>
                    </div>
                    <div class="mb-3">
                      <label for="projectLiveDemoUrl" class="form-label">Canlı Demo URL</label>
                      <input type="url" class="form-control bg-dark text-white border-secondary" id="projectLiveDemoUrl" v-model="currentProjectLiveDemoUrl">
                    </div>
                    <div class="mb-3">
                      <label for="projectGithubUrl" class="form-label">GitHub URL</label>
                      <input type="url" class="form-control bg-dark text-white border-secondary" id="projectGithubUrl" v-model="currentProjectGithubUrl">
                    </div>
                    <div class="mb-3">
                      <label for="projectOrder" class="form-label">Sıralama (Sayı)</label>
                      <input type="number" class="form-control bg-dark text-white border-secondary" id="projectOrder" v-model="currentProjectOrder">
                      <small class="form-text text-white-50">Projelerin ana sayfada hangi sırada görüneceğini belirler.</small>
                    </div>
                    <div class="d-flex justify-content-end">
                      <button type="submit" class="btn btn-success me-2">Kaydet</button>
                      <button type="button" class="btn btn-secondary" @click="closeProjectModal">İptal</button>
                    </div>
                  </form>
                </AdminModal>
              </div>

              <div v-if="activeSection === 'experiences'">
                <h3>İş Tecrübeleri</h3>
                <ul class="list-group mb-3">
                  <li v-for="exp in experiences" :key="exp.id" class="list-group-item bg-dark text-white mb-3 shadow-sm">
                    <h5>{{ exp.company }} - {{ exp.position }}</h5>
                    <p class="text-white-50 small">
                      {{ formatDate(exp.startDate) }} - {{ formatDate(exp.endDate) }}
                    </p>
                    <p class="text-white-50 mb-1"><strong>Görevler:</strong> {{ truncateText(exp.responsibilities?.join(', ') || '', 100) }}</p>
                    <p class="text-white-50 small"><strong>Nitelikler:</strong> {{ exp.qualifications?.join(', ') }}</p>
                    <div class="d-flex justify-content-end mt-3">
                      <button class="btn btn-sm btn-primary me-2" @click="openExperienceModal(exp)">Düzenle</button>
                      <button class="btn btn-sm btn-danger" @click="deleteExperience(exp.id)">Sil</button>
                    </div>
                  </li>
                </ul>
                <button class="btn btn-success" @click="openExperienceModal()">Yeni Tecrübe Ekle</button>
                
                <AdminModal
                  :open="showingExperienceModal"
                  :title="editingExperience ? 'İş Tecrübesi Düzenle' : 'Yeni İş Tecrübesi Ekle'"
                  size="lg"
                  @close="closeExperienceModal"
                >
                  <form @submit.prevent="saveExperience">
                    <div class="mb-3">
                      <label for="expCompany" class="form-label">Şirket Adı</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" id="expCompany" v-model="currentExpCompany" required>
                    </div>
                    <div class="mb-3">
                      <label for="expPosition" class="form-label">Pozisyon</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" id="expPosition" v-model="currentExpPosition" required>
                    </div>
                    <div class="row mb-3">
                      <div class="col">
                        <label for="expStartDate" class="form-label">Başlangıç Tarihi</label>
                        <input type="date" class="form-control bg-dark text-white border-secondary" id="expStartDate" v-model="currentExpStartDate" required>
                      </div>
                      <div class="col">
                        <label for="expEndDate" class="form-label">Bitiş Tarihi (Devam Ediyorsa Boş Bırakın)</label>
                        <input type="date" class="form-control bg-dark text-white border-secondary" id="expEndDate" v-model="currentExpEndDate">
                      </div>
                    </div>
                    <div class="mb-3">
                      <label for="expResponsibilities" class="form-label">Ana Görevler (virgülle ayırın)</label>
                      <textarea class="form-control bg-dark text-white border-secondary" id="expResponsibilities" v-model="currentExpResponsibilities" rows="3"></textarea>
                      <small class="form-text text-white-50">Örn: `API Geliştirme, UI Tasarımı`</small>
                    </div>
                    <div class="mb-3">
                      <label for="expQualifications" class="form-label">Kazanılan Nitelikler (virgülle ayırın)</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" id="expQualifications" v-model="currentExpQualifications">
                      <small class="form-text text-white-50">Örn: `Problem Çözme, Ekip Yönetimi`</small>
                    </div>
                    <div class="mb-3">
                      <label for="expReferences" class="form-label">Referanslar</label>
                      <textarea class="form-control bg-dark text-white border-secondary" id="expReferences" v-model="currentExpReferences" rows="2"></textarea>
                    </div>
                    <div class="d-flex justify-content-end">
                      <button type="submit" class="btn btn-success me-2">Kaydet</button>
                      <button type="button" class="btn btn-secondary" @click="closeExperienceModal">İptal</button>
                    </div>
                  </form>
                </AdminModal>
              </div>

              <div v-if="activeSection === 'contact'">
                <h3>İletişim Bilgileri</h3>
                <div v-if="!editingContact">
                  <div class="mb-3">
                    <strong>Telefon:</strong> {{ contact?.phone }}
                  </div>
                  <div class="mb-3">
                    <strong>E-posta:</strong> {{ contact?.email }}
                  </div>
                  <button class="btn btn-primary" @click="editingContact = true">Düzenle</button>
                </div>
                <div v-else>
                  <form @submit.prevent="saveContact">
                    <div class="mb-3">
                      <label for="contactPhone" class="form-label">Telefon</label>
                      <input type="tel" class="form-control bg-dark text-white border-secondary" id="contactPhone" v-model="contactPhone" required>
                    </div>
                    <div class="mb-3">
                      <label for="contactEmail" class="form-label">E-posta</label>
                      <input type="email" class="form-control bg-dark text-white border-secondary" id="contactEmail" v-model="contactEmail" required>
                    </div>
                    <button type="submit" class="btn btn-success me-2">Kaydet</button>
                    <button type="button" class="btn btn-secondary" @click="cancelEditContact">İptal</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard-container .list-group-item {
  color: var(--bs-light); /* Metin rengi */
}
.admin-dashboard-container .list-group-item.active {
  background-color: var(--bs-primary) !important;
  border-color: var(--bs-primary) !important;
}
.admin-dashboard-container .list-group-item:hover {
  background-color: var(--bs-gray-700); /* Hover rengi */
}
.card {
  border: none;
}
.form-control.bg-dark:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  background-color: var(--bs-gray-800) !important; /* Odaklandığında biraz daha açık bir gri */
}
</style>
