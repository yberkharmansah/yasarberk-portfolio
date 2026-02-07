// seedFirestore.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";

// Firebase configuration (Ortam değişkenleri üzerinden)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Firebase ortam değişkenleri eksik. Lütfen .env dosyanızı kontrol edin.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Demo verileri
const portfolioData = {
  about: {
    heading: "Merhaba, Ben Bir Yazılımcıyım!",
    text: "Kullanıcı deneyimini merkezine alan modern web uygulamaları geliştiriyorum. Vue.js, Firebase ve çağdaş frontend araçlarıyla üretken, ölçeklenebilir projeler üzerinde çalışmayı seviyorum.",
    profileImageUrl: "https://via.placeholder.com/200/4F46E5/FFFFFF?text=Profil" // Geçici URL, Storage'a yükleyince değişecek
  },
  socialLinks: {
    links: [
      { name: "LinkedIn", url: "https://www.linkedin.com/", icon: "fab fa-linkedin-in" },
      { name: "GitHub", url: "https://github.com/", icon: "fab fa-github" },
      { name: "Instagram", url: "https://www.instagram.com/", icon: "fab fa-instagram" }
    ]
  },
  contact: {
    phone: "+90 555 555 55 55",
    email: "ornek@mail.com"
  },
  projects: [
    {
      id: "project-1",
      title: "AI Prompt Helper Uygulaması",
      description: "Yapay zeka destekli içerik üreticileri için özel prompt'lar oluşturan ve yöneten bir Vue.js uygulaması. Firebase ve Pinia ile entegre.",
      technologies: ["Vue.js", "Firebase", "Pinia", "Tailwind CSS"],
      imageUrl: "https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=AI+Prompt+Helper",
      liveDemoUrl: "https://example.com",
      githubUrl: "https://github.com/example/ai-prompt-helper",
      order: 1
    },
    {
      id: "project-2",
      title: "E-ticaret Sitesi (Mock)",
      description: "Modern bir e-ticaret sitesi arayüzü ve temel işlevsellikleri. Dinamik ürün listeleme ve sepet özellikleri.",
      technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
      imageUrl: "https://via.placeholder.com/400x250/EC4899/FFFFFF?text=E-commerce+Mock",
      liveDemoUrl: "https://example.com",
      githubUrl: "https://github.com/example/ecommerce-mock",
      order: 2
    },
    {
      id: "project-3",
      title: "Hava Durumu Uygulaması",
      description: "Gerçek zamanlı hava durumu verilerini çeken ve kullanıcıya gösteren basit bir web uygulaması. API entegrasyonu.",
      technologies: ["JavaScript", "HTML", "CSS", "OpenWeatherMap API"],
      imageUrl: "https://via.placeholder.com/400x250/10B981/FFFFFF?text=Weather+App",
      liveDemoUrl: "https://example.com",
      githubUrl: "https://github.com/example/weather-app",
      order: 3
    }
  ],
  experiences: [
    {
      id: "exp-1",
      company: "ABC Teknoloji A.Ş.",
      position: "Frontend Geliştirici",
      startDate: new Date("2022-09-01"),
      endDate: null, // Halen çalışıyor
      responsibilities: [
        "Vue.js ile kullanıcı arayüzü geliştirme.",
        "RESTful API'lerle entegrasyon sağlama.",
        "Sürdürülebilir ve temiz kod yazma pratikleri uygulama.",
        "Takım içi kod incelemelerine katılma."
      ],
      qualifications: [
        "Responsive Tasarım",
        "Performans Optimizasyonu",
        "DevOps Temelleri"
      ],
      references: "İstek üzerine sağlanabilir.",
      order: 1
    },
    {
      id: "exp-2",
      company: "XYZ Dijital Ajans",
      position: "Junior Web Geliştirici",
      startDate: new Date("2021-03-01"),
      endDate: new Date("2022-08-31"),
      responsibilities: [
        "HTML, CSS ve JavaScript kullanarak web siteleri oluşturma.",
        "Mevcut projelerde hata giderme ve iyileştirmeler yapma.",
        "Tasarım ekipleriyle yakın çalışma."
      ],
      qualifications: [
        "Temel SEO Bilgisi",
        "Versiyon Kontrol Sistemleri (Git)"
      ],
      references: null,
      order: 2
    }
  ]
};

// Fonksiyon: Verileri Firestore'a yükle
async function seedFirestore() {
  console.log("Firestore'a veri yükleniyor...");

  try {
    // Settings verileri (tek dokümanlar)
    await setDoc(doc(db, 'settings', 'about'), portfolioData.about);
    await setDoc(doc(db, 'settings', 'socialLinks'), portfolioData.socialLinks);
    await setDoc(doc(db, 'settings', 'contact'), portfolioData.contact);
    console.log("Settings verileri yüklendi.");

    // Projeler
    for (const project of portfolioData.projects) {
      await setDoc(doc(db, 'projects', project.id), project);
    }
    console.log("Projeler yüklendi.");

    // Tecrübeler
    for (const experience of portfolioData.experiences) {
      // Firebase Firestore Date objelerini timestamp'e dönüştürür
      await setDoc(doc(db, 'experiences', experience.id), experience);
    }
    console.log("İş tecrübeleri yüklendi.");

    console.log("Tüm veriler Firestore'a başarıyla yüklendi!");
  } catch (error) {
    console.error("Veri yüklenirken bir hata oluştu:", error);
  }
}

// Script'i çalıştır
seedFirestore();
