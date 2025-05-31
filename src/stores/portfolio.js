// src/stores/portfolio.js
import { defineStore } from 'pinia';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, setDoc, deleteDoc } from 'firebase/firestore'; // deleteDoc'u ekledik

export const usePortfolioStore = defineStore('portfolio', {
  state: () => ({
    about: null,
    socialLinks: [],
    projects: [],
    experiences: [], // Bu alan iş tecrübelerini tutuyor
    contact: null,
    loading: false,
    error: null,
  }),
  actions: { // <-- ACTIONS OBJESİNİN BAŞLANGICI
    async fetchPortfolioContent() {
      this.loading = true;
      this.error = null;
      try {
        // Hakkımda Bilgileri
        const aboutDocRef = doc(db, 'settings', 'about');
        const aboutSnap = await getDoc(aboutDocRef);
        if (aboutSnap.exists()) {
          this.about = aboutSnap.data();
        } else {
          console.warn("Firestore'da 'settings/about' dokümanı bulunamadı.");
          this.about = {};
        }

        // Sosyal Medya Linkleri
        const socialLinksDocRef = doc(db, 'settings', 'socialLinks');
        const socialLinksSnap = await getDoc(socialLinksDocRef);
        if (socialLinksSnap.exists()) {
          this.socialLinks = (socialLinksSnap.data().links || []).map(link => {
            return { ...link, id: link.id || String(Date.now() + Math.random()) };
          });
        } else {
          console.warn("Firestore'da 'settings/socialLinks' dokümanı bulunamadı.");
          this.socialLinks = [];
        }

        // İletişim Bilgileri
        const contactDocRef = doc(db, 'settings', 'contact');
        const contactSnap = await getDoc(contactDocRef);
        if (contactSnap.exists()) {
          this.contact = contactSnap.data();
        } else {
          console.warn("Firestore'da 'settings/contact' dokümanı bulunamadı.");
          this.contact = {};
        }

        // Projeler
        const projectsColRef = collection(db, 'projects');
        const projectsQuery = query(projectsColRef, orderBy('order', 'asc'));
        const projectsSnap = await getDocs(projectsQuery);
        this.projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // İş Tecrübeleri
        const experiencesColRef = collection(db, 'experiences');
        const experiencesQuery = query(experiencesColRef, orderBy('startDate', 'desc'));
        const experiencesSnap = await getDocs(experiencesColRef);
        this.experiences = experiencesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      } catch (err) {
        console.error("Portfolyo verileri çekilirken hata oluştu:", err);
        this.error = "Veriler yüklenirken bir hata oluştu.";
      } finally {
        this.loading = false;
      }
    },

    async updateAbout(aboutData) {
      this.loading = true;
      this.error = null;
      try {
        const aboutDocRef = doc(db, 'settings', 'about');
        await setDoc(aboutDocRef, aboutData);
        this.about = aboutData;
        console.log("Hakkımda bilgileri başarıyla güncellendi!");
      } catch (err) {
        console.error("Hakkımda bilgileri güncellenirken hata oluştu:", err);
        this.error = "Hakkımda bilgileri güncellenemedi.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async uploadImage(file) {
      this.loading = true;
      this.error = null;
      try {
        const CLOUDINARY_CLOUD_NAME = 'dfqhqykcx';
        const CLOUDINARY_UPLOAD_PRESET = 'portfolio_images';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error.message || 'Cloudinary yükleme hatası.');
        }

        const data = await response.json();
        console.log("Cloudinary'ye resim başarıyla yüklendi:", data.secure_url);
        return data.secure_url;
      } catch (err) {
        console.error("Resim yüklenirken hata oluştu:", err);
        this.error = err.message || "Resim yüklenemedi.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateSocialLinks(newLinksArray) {
        this.loading = true;
        this.error = null;
        try {
            const socialLinksDocRef = doc(db, 'settings', 'socialLinks');
            const cleanedLinksArray = newLinksArray.map(link => {
                const cleanedLink = {};
                for (const key in link) {
                    if (link[key] !== undefined) {
                        cleanedLink[key] = link[key];
                    }
                }
                cleanedLink.id = cleanedLink.id ? String(cleanedLink.id) : String(Date.now());
                return cleanedLink;
            });

            await setDoc(socialLinksDocRef, { links: cleanedLinksArray });
            this.socialLinks = cleanedLinksArray;
            console.log("Sosyal medya linkleri başarıyla güncellendi!");
        } catch (err) {
            console.error("Sosyal medya linkleri güncellenirken hata oluştu:", err);
            this.error = "Sosyal medya linkleri güncellenemedi.";
            throw err;
        } finally {
            this.loading = false;
        }
    },

    async addSocialLink(newLink) {
        const cleanedNewLink = {};
        for (const key in newLink) {
            if (newLink[key] !== undefined) {
                cleanedNewLink[key] = newLink[key];
            }
        }
        const linkWithId = { ...cleanedNewLink, id: String(Date.now()) };
        const updatedLinks = [...this.socialLinks, linkWithId];
        await this.updateSocialLinks(updatedLinks);
    },

    async editSocialLink(updatedLink) {
        const cleanedUpdatedLink = {};
        for (const key in updatedLink) {
            if (updatedLink[key] !== undefined) {
                cleanedUpdatedLink[key] = updatedLink[key];
            }
        }
        if (cleanedUpdatedLink.id) {
            cleanedUpdatedLink.id = String(cleanedUpdatedLink.id);
        } else {
            throw new Error("Düzenlenecek linkin ID'si bulunamadı.");
        }

        const updatedLinks = this.socialLinks.map(link => 
            link.id === cleanedUpdatedLink.id ? cleanedUpdatedLink : link
        );
        await this.updateSocialLinks(updatedLinks);
    },

    async deleteSocialLink(linkId) {
        const idToDelete = String(linkId);
        const updatedLinks = this.socialLinks.filter(link => link.id !== idToDelete);
        await this.updateSocialLinks(updatedLinks);
    },

    // Proje Yönetimi Aksiyonları
    async addProject(projectData) {
      this.loading = true;
      this.error = null;
      try {
        const newProjectRef = doc(collection(db, 'projects'));
        await setDoc(newProjectRef, { ...projectData, id: newProjectRef.id });
        this.projects.push({ ...projectData, id: newProjectRef.id });
        await this.fetchPortfolioContent();
        console.log("Yeni proje başarıyla eklendi!");
      } catch (err) {
        console.error("Proje eklenirken hata oluştu:", err);
        this.error = "Proje eklenemedi.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async editProject(updatedProject) {
      this.loading = true;
      this.error = null;
      try {
        if (!updatedProject.id) {
          throw new Error("Düzenlenecek projenin ID'si bulunamadı.");
        }
        const projectDocRef = doc(db, 'projects', updatedProject.id);
        const cleanedProject = {};
        for (const key in updatedProject) {
            if (updatedProject[key] !== undefined) {
                cleanedProject[key] = updatedProject[key];
            }
        }
        await setDoc(projectDocRef, cleanedProject);
        this.projects = this.projects.map(p => 
            p.id === cleanedProject.id ? cleanedProject : p
        );
        await this.fetchPortfolioContent();
        console.log("Proje başarıyla güncellendi!");
      } catch (err) {
        console.error("Proje güncellenirken hata oluştu:", err);
        this.error = "Proje güncellenemedi.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteProject(projectId) {
      this.loading = true;
      this.error = null;
      try {
        if (!projectId) {
          throw new Error("Silinecek projenin ID'si bulunamadı.");
        }
        const projectDocRef = doc(db, 'projects', projectId);
        await deleteDoc(projectDocRef);
        this.projects = this.projects.filter(p => p.id !== projectId);
        console.log("Proje başarıyla silindi!");
      } catch (err) {
        console.error("Proje silinirken hata oluştu:", err);
        this.error = "Proje silinemedi.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // İş Tecrübeleri Yönetimi Aksiyonları <-- BU ÜÇ AKSİYON BURADAN BAŞLAYACAK!
    async addExperience(experienceData) {
      this.loading = true;
      this.error = null;
      try {
        const newExperienceRef = doc(collection(db, 'experiences'));
        const dataToSave = { ...experienceData, id: newExperienceRef.id };

        if (dataToSave.startDate instanceof Date) {
          dataToSave.startDate = dataToSave.startDate;
        }
        if (dataToSave.endDate instanceof Date) {
          dataToSave.endDate = dataToSave.endDate;
        } else if (dataToSave.endDate === null) {
          dataToSave.endDate = null;
        }

        await setDoc(newExperienceRef, dataToSave);
        this.experiences.push(dataToSave);
        await this.fetchPortfolioContent();
        console.log("Yeni iş tecrübesi başarıyla eklendi!");
      } catch (err) {
        console.error("İş tecrübesi eklenirken hata oluştu:", err);
        this.error = "İş tecrübesi eklenemedi.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async editExperience(updatedExperience) {
      this.loading = true;
      this.error = null;
      try {
        if (!updatedExperience.id) {
          throw new Error("Düzenlenecek iş tecrübesinin ID'si bulunamadı.");
        }
        const experienceDocRef = doc(db, 'experiences', updatedExperience.id);
        
        const cleanedExperience = {};
        for (const key in updatedExperience) {
            if (updatedExperience[key] !== undefined) {
                cleanedExperience[key] = updatedExperience[key];
            }
        }
        if (cleanedExperience.startDate instanceof Date) {
          cleanedExperience.startDate = cleanedExperience.startDate;
        }
        if (cleanedExperience.endDate instanceof Date) {
          cleanedExperience.endDate = cleanedExperience.endDate;
        } else if (cleanedExperience.endDate === '') {
            cleanedExperience.endDate = null;
        }

        await setDoc(experienceDocRef, cleanedExperience);
        this.experiences = this.experiences.map(exp => 
            exp.id === cleanedExperience.id ? cleanedExperience : exp
        );
        await this.fetchPortfolioContent();
        console.log("İş tecrübesi başarıyla güncellendi!");
      } catch (err) {
        console.error("İş tecrübesi güncellenirken hata oluştu:", err);
        this.error = "İş tecrübesi güncellenemedi.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteExperience(experienceId) {
      this.loading = true;
      this.error = null;
      try {
        if (!experienceId) {
          throw new Error("Silinecek iş tecrübesinin ID'si bulunamadı.");
        }
        const experienceDocRef = doc(db, 'experiences', experienceId);
        await deleteDoc(experienceDocRef);
        this.experiences = this.experiences.filter(exp => exp.id !== experienceId);
        console.log("İş tecrübesi başarıyla silindi!");
      } catch (err) {
        console.error("İş tecrübesi silinirken hata oluştu:", err);
        this.error = "İş tecrübesi silinemedi.";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateContact(contactData) {
        this.loading = true;
        this.error = null;
        try {
            const contactDocRef = doc(db, 'settings', 'contact');
            // undefined değerleri temizle
            const cleanedContact = {};
            for (const key in contactData) {
                if (contactData[key] !== undefined) {
                    cleanedContact[key] = contactData[key];
                }
            }
            await setDoc(contactDocRef, cleanedContact);
            this.contact = cleanedContact;
            console.log("İletişim bilgileri başarıyla güncellendi!");
        } catch (err) {
            console.error("İletişim bilgileri güncellenirken hata oluştu:", err);
            this.error = "İletişim bilgileri güncellenemedi.";
            throw err;
        } finally {
            this.loading = false;
        }
    }
  }, // <-- ACTIONS OBJESİNİN SONU
});