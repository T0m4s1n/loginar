<script setup lang="ts">
import { ref } from 'vue';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Code, 
  PenTool, 
  Database, 
  Server,
  Beef 
} from 'lucide-vue-next';
import AiComponent from './AiComponent.vue';

interface Skill {
  name: string;
  percentage: number;
  icon?: any;
}

interface SocialLink {
  name: string;
  url: string;
  icon?: any;
}

interface CardData {
  title: string;
  subtitle: string;
  name: string;
  profession: string;
  description: string;
  profileImage: string;
  skills: Skill[];
  socialLinks: SocialLink[];
}
interface QRImageData {
  imageUrl: string;
  title: string;
  description: string;
}

const qrImages = ref<QRImageData[]>([
  {
    imageUrl: new URL('../assets/qr-code.png', import.meta.url).href,
    title: 'Escanea mi QR',
    description: 'Conecta conmigo escaneando este código'
  }
]);

const cards = ref<CardData[]>([
  {
    title: 'Acerca de Maka',
    subtitle: 'Desarrollador de Backend',
    name: 'Maka',
    profession: 'Desarrollador de la IA',
    description: 'Maka es un desarrollador de backend que disfruta creando aplicaciones web escalables y de alto rendimiento...',
    profileImage: new URL('../assets/maka.jpeg', import.meta.url).href,
    skills: [
      { name: 'Frontend', percentage: 82, icon: Code },
      { name: 'Diseño', percentage: 86, icon: PenTool },
      { name: 'Backend', percentage: 43, icon: Server },
      { name: 'Base de datos', percentage: 48, icon: Database }
    ],
    socialLinks: [
      { name: 'GitHub', url: 'https://github.com/MAKEBUZ', icon: Github },
      { name: 'LinkedIn', url: 'https://linkedin.com', icon: Linkedin },
      { name: 'Steam', url: 'https://steamcommunity.com/profiles/76561198385975559/', icon: Beef }
    ]
  },
  {
    title: 'About T0m4s1n',
    subtitle: 'Desarrollador Frontend',
    name: 'T0m4s1n',
    profession: 'Frontend y JSON',
    description: 't0m4s1n ama Red Dead Redemption...',
    profileImage: new URL('../assets/t0m4s1n.jpg', import.meta.url).href,
    skills: [
      { name: 'Frontend', percentage: 93, icon: Code },
      { name: 'Diseño', percentage: 78, icon: PenTool },
      { name: 'Backend', percentage: 25, icon: Server },
      { name: 'Base de datos', percentage: 45, icon: Database }
    ],
    socialLinks: [
      { name: 'GitHub', url: 'https://github.com/T0m4s1n', icon: Github },
      { name: 'LinkedIn', url: 'https://linkedin.com', icon: Linkedin },
      { name: 'Steam', url: 'https://steamcommunity.com/profiles/76561199201904773/', icon: Beef }
    ]
  },
  {
    title: 'Acerca de KlauZ',
    subtitle: 'Desarrollador de IA',
    name: 'KlauZ',
    profession: 'IA Developer',
    description: 'KlauZ es un desarrollador de IA que disfruta creando aplicaciones web escalables y de alto rendimiento...',
    profileImage: new URL('../assets/KlauZ.jpeg', import.meta.url).href,
    skills: [
      { name: 'Frontend', percentage: 46, icon: Code },
      { name: 'Diseño', percentage: 36, icon: PenTool },
      { name: 'Backend', percentage: 70, icon: Server },
      { name: 'Base de datos', percentage: 80, icon: Database }
    ],
    socialLinks: [
      { name: 'GitHub', url: 'https://github.com/Dev3', icon: Github },
      { name: 'Twitter', url: 'https://twitter.com/Dev3', icon: Twitter },
    ]
  },
]);

</script>
<template>
  <div class="container">
      <div class="qr-container">
      <div class="qr-wrapper" v-for="(qr, index) in qrImages" :key="index">
        <div class="qr-content">
          <div class="qr-text">
            <h2>{{ qr.title }}</h2>
            <p>{{ qr.description }}</p>
          </div>
          <div class="qr-code">
            <img :src="qr.imageUrl" :alt="qr.title" class="qr-image">
          </div>
        </div>
      </div>
    </div>
    <AiComponent />
    <div class="about-container" v-for="(card, index) in cards" :key="index">
      <div class="about-wrapper">
        <div class="about-content">
          <div class="about-text">
            <div class="text-container">
              <h1>{{ card.title }}</h1>
              <h2>{{ card.subtitle }}</h2>
              <p>{{ card.description }}</p>
              
              <div class="skills-section">
                <h3>Skills</h3>
                <div class="skill-grid">
                  <div v-for="skill in card.skills" :key="skill.name" class="skill-item">
                    <div class="skill-icon">
                      <component :is="skill.icon" v-if="skill.icon" />
                    </div>
                    <div class="skill-details">
                      <span class="skill-name">{{ skill.name }}</span>
                      <div class="skill-bar">
                        <div class="skill-progress" :style="{ width: `${skill.percentage}%` }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="action-buttons">
                <a v-for="link in card.socialLinks" :key="link.name" :href="link.url" class="social-link" target="_blank">
                  <component :is="link.icon" />
                  <span>{{ link.name }}</span>
                </a>
              </div>
            </div>
          </div>
          
          <div class="about-visual">
            <div class="profile-card">
              <div class="profile-image-wrapper">
                <img :src="card.profileImage" :alt="card.title" class="profile-image" />
              </div>
              <div class="profile-details">
                <h2>{{ card.name }}</h2>
                <p>{{ card.profession }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.about-container {
  margin-top: 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  padding: 1rem;
  z-index: 1001;
}
.qr-container {
  margin-top: 6rem;
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.qr-wrapper {
  max-width: 600px;
  width: 100%;
}

.qr-content {
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 10px 30px rgba(0, 0, 0, 0.3);
}

.qr-text {
  text-align: center;
}

.qr-text h2 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.qr-text p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.qr-code {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.qr-image {
  width: 300px;
  height: 300px;
  object-fit: contain;
}

.qr-code:hover {
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .qr-container {
    margin-top: 4rem;
  }

  .qr-content {
    padding: 1.5rem;
  }

  .qr-text h2 {
    font-size: 1.75rem;
  }

  .qr-text p {
    font-size: 1rem;
  }

  .qr-code {
    padding: 1.5rem;
  }

  .qr-image {
    width: 250px;
    height: 250px;
  }
}

@media (max-width: 480px) {
  .qr-container {
    margin-top: 3rem;
  }

  .qr-wrapper {
    padding: 0.5rem;
  }

  .qr-text h2 {
    font-size: 1.5rem;
  }

  .qr-image {
    width: 200px;
    height: 200px;
  }
}
.about-wrapper {
  max-width: 1200px;
  width: 100%;
}

.about-content {
  display: flex;
  align-items: stretch;
  gap: 2rem;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  overflow: hidden;
  background: var(--bg-secondary);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
}

.about-text {
  flex: 1;
  padding: 2.5rem;
  background: var(--bg-secondary);
}

.text-container h1 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.text-container h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.text-container p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.skills-section {
  margin-bottom: 2rem;
}

.skills-section h3 {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skill-icon {
  background-color: var(--bg-primary);
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.skill-details {
  flex-grow: 1;
  min-width: 0;
}
.qr-container {
  margin-top: 6rem;
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.qr-wrapper {
  max-width: 600px;
  width: 100%;
}

.qr-content {
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 10px 30px rgba(0, 0, 0, 0.3);
}

.qr-text {
  text-align: center;
}

.qr-text h2 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.qr-text p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.qr-code {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.qr-code:hover {
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .qr-container {
    margin-top: 4rem;
  }

  .qr-content {
    padding: 1.5rem;
  }

  .qr-text h2 {
    font-size: 1.75rem;
  }

  .qr-text p {
    font-size: 1rem;
  }

  .qr-code {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .qr-container {
    margin-top: 3rem;
  }

  .qr-wrapper {
    padding: 0.5rem;
  }

  .qr-text h2 {
    font-size: 1.5rem;
  }
}

.skill-name {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background-color: #643ac7;
  border-radius: 4px;
  transition: width 1s ease-in-out;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
  border: 1px solid #ddd;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 140px;
  justify-content: center;
}

.social-link:hover {
  background-color: var(--bg-primary);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.about-visual {
  flex: 0.8;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-secondary);
  padding: 2rem;
  min-width: 300px;
}

.profile-card {
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  overflow: hidden;
  text-align: center;
}

.profile-image-wrapper {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
}

.profile-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-details {
  padding: 1.5rem;
  background-color: var(--bg-primary);
}

.profile-details h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.profile-details p {
  margin: 0.5rem 0 0;
  color: var(--text-secondary);
}

@media (max-width: 1200px) {
  .about-content {
    margin: 0 1rem;
  }
  
  .skill-grid {
    gap: 1rem;
  }
}

@media (max-width: 1024px) {
  .about-content {
    flex-direction: column;
  }

  .about-visual {
    padding: 2rem;
  }

  .profile-card {
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .about-container {
    margin-top: 4rem;
    padding: 0.5rem;
  }

  .about-content {
    gap: 1rem;
    margin: 0;
  }

  .about-text {
    padding: 1.5rem;
  }

  .text-container h1 {
    font-size: 2rem;
  }

  .text-container h2 {
    font-size: 1.25rem;
  }

  .skill-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    justify-content: center;
  }

  .social-link {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .about-container {
    margin-top: 3rem;
  }

  .about-content {
    border-radius: 15px;
  }

  .text-container h1 {
    font-size: 1.75rem;
  }

  .text-container p {
    font-size: 0.95rem;
  }

  .profile-image-wrapper {
    padding-top: 75%;
  }

  .profile-details h2 {
    font-size: 1.25rem;
  }

  .skill-item {
    gap: 0.75rem;
  }

  .skill-icon {
    padding: 0.5rem;
  }
}

@keyframes growSkill {
  from { width: 0; }
  to { width: var(--skill-percentage); }
}

.skill-progress {
  animation: growSkill 1.5s ease-out forwards;
}
</style>