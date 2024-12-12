<script>
import{ 
    Twitter,
    Github,
    Linkedin,
    Instagram,
    Link,
    Home,
    User,
    Settings,
    Contact,
    Mail,
    MapPin,
    Phone,
    BadgePercent,
} from 'lucide-vue-next';

export default {
  name: 'FooterComponent',
  components: {
    BadgePercent,
    Twitter,
    Github,
    Linkedin,
    Instagram,
    Link,
    Home,
    User,
    Settings,
    Contact,
    Mail,
    MapPin,
    Phone,
  },
}
</script>

<template>
    <footer class="footer-container">
        <div class="footer-content">
            <div class="footer-grid">
                <div class="footer-section">
                    <h3 class="footer-title">
                        <BadgePercent class="footer-icon" size="24"/>
                        <span>LOGINAR</span>
                    </h3>
                    <p class="footer-text">
                        LogiNar es una plataforma realizada para la gestion de inventarios de una manera mas eficiente y rapida con el uso de IA.
                    </p>
                    <div class="social-links">
                        <a href="https://x.com/home?lang=es" class="social-icon" aria-label="Twitter">
                            <Twitter size="24"/>
                        </a>
                        <a href="" class="social-icon" aria-label="Github">
                            <Github size="24"/>
                        </a>
                        <a href="https://www.linkedin.com/feed/" class="social-icon" aria-label="LinkedIn">
                            <Linkedin size="24"/>
                        </a>
                        <a href="https://www.instagram.com" class="social-icon" aria-label="Instagram">
                            <Instagram size="24"/>
                        </a>
                    </div>
                </div>
                <div class="footer-section">
                    <h3 class="footer-title">
                        <Link class="footer-icon" size="24"/>
                        <span>Links</span>
                    </h3>
                    <ul class="footer-list">
                        <li class="footer-item">
                            <Home size="20"/>
                            <a href="/">Inicio</a>
                        </li>
                        <li class="footer-item">
                            <User size="20"/>
                            <a href="/about">Nosotros</a>
                        </li>
                        <li class="footer-item">
                            <Settings size="20"/>
                            <a href="/">Dashboard</a>
                        </li>
                        <li class="footer-item">
                            <Contact size="20"/>
                            <a href="/soporte">Soporte</a>
                        </li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3 class="footer-title">
                        <Mail class="footer-icon" size="24"/>
                        <span>Contact</span>
                    </h3>
                    <ul class="footer-list">
                        <li class="footer-item">
                            <MapPin size="20"/>
                            <span>Pasto, Nariño</span>
                        </li>
                        <li class="footer-item">
                            <Phone size="20"/>
                            <span> +57 (310)640-6198 <br>+57 (318)247-5546 <br> +57 (316)889-5127</span>
                        </li>
                        <li class="footer-item">
                            <Mail size="20"/>
                            <span>pandelpipas@gmail.com <br> makabeuz6618@gmail.com<br>dylansantiagorodriguez.p@gmail.com</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p class="copyright">
                    © {{ new Date().getFullYear() }} フレ -../MAKEBUZ/..-ン, T0m4s1n,  KlauZ.  Todos los derechos reservados.
                </p>
            </div>
        </div>
    </footer> 
</template>

<style scoped>
.footer-container {
    font-family: "Poppins", serif;
    background: linear-gradient(180deg, #462989 0%, #2b195c 100%);
    color: #fff;
    padding: 6rem 0 2rem;
    position: relative;
    overflow: hidden;
}

.footer-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 4rem;
    margin-bottom: 4rem;
}

.footer-section {
    animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.footer-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #fff;
    letter-spacing: 0.5px;
}

.footer-text {
    color: #fff;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
}

.social-links {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.social-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #fff;
}

.social-icon:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-4px);
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.footer-list {
    list-style: none;
    padding: 0;
}

.footer-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    color: #fff;
    transition: all 0.3s ease;
}

.footer-item a {
    color: inherit;
    text-decoration: none;
    font-size: 0.95rem;
    transition: all 0.3s ease;
}

.footer-item:hover {
    color: #fff;
    transform: translateX(4px);
}

.footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 2rem;
    text-align: center;
}

.copyright {
    color: #fff;
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .footer-container {
        padding: 4rem 0 2rem;
    }
    
    .footer-grid {
        gap: 3rem;
    }
    
    .footer-section {
        text-align: center;
    }
    
    .footer-title {
        justify-content: center;
    }
    
    .social-links {
        justify-content: center;
    }
    
    .footer-item {
        justify-content: center;
    }
}
</style>
