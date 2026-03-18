import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class AnimeParticleSystem {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector('#webgl'),
      alpha: true,
      antialias: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.position.z = 5;

    this.particleSystems = [];
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };

    this.init();
    this.addLights();
    this.createParticles();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.05);
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0x6600ff, 0.5);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff0066, 2, 100);
    pointLight1.position.set(5, 5, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight2.position.set(-5, -5, 5);
    this.scene.add(pointLight2);
  }

  createParticles() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorPalette = [
      new THREE.Color(0xff0066),
      new THREE.Color(0x00ffff),
      new THREE.Color(0x6600ff),
      new THREE.Color(0xff00ff),
      new THREE.Color(0x00ff88)
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 4 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    this.particleSystems.push(particles);

    this.createGeometricShapes();
  }

  createGeometricShapes() {
    const geometries = [
      new THREE.TorusGeometry(1, 0.3, 16, 100),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.IcosahedronGeometry(0.8, 0)
    ];

    geometries.forEach((geometry, index) => {
      const material = new THREE.MeshPhongMaterial({
        color: [0xff0066, 0x00ffff, 0x6600ff][index],
        wireframe: true,
        transparent: true,
        opacity: 0.3,
        emissive: [0xff0066, 0x00ffff, 0x6600ff][index],
        emissiveIntensity: 0.5
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 - 2
      );

      this.scene.add(mesh);
      this.particleSystems.push(mesh);
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        this.camera.position.y = self.progress * 5;
        this.camera.rotation.x = self.progress * 0.5;
      }
    });
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    this.camera.position.x = this.mouse.x * 0.5;
    this.camera.position.y = -this.mouse.y * 0.5;
    this.camera.lookAt(0, 0, 0);

    const time = Date.now() * 0.0005;

    this.particleSystems.forEach((system, index) => {
      if (system.geometry && system.geometry.attributes.position) {
        const positions = system.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(time + i) * 0.01;
        }

        system.geometry.attributes.position.needsUpdate = true;
        system.rotation.y += 0.001;
      } else {
        system.rotation.x += 0.001 * (index + 1);
        system.rotation.y += 0.002 * (index + 1);
      }
    });

    this.renderer.render(this.scene, this.camera);
  }
}

class AnimationController {
  constructor() {
    this.initAnimations();
  }

  initAnimations() {
    this.animateHero();
    this.animateSections();
    this.animateCards();
    this.animateStats();
    this.setupNavigation();
  }

  animateHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.from('.hero-subtitle', {
      y: 50,
      opacity: 0,
      duration: 1,
      delay: 0.5
    })
    .from('.hero-title-line', {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power4.out'
    }, '-=0.5')
    .from('.hero-description', {
      y: 30,
      opacity: 0,
      duration: 1
    }, '-=0.5')
    .from('.hero-button', {
      scale: 0.8,
      opacity: 0,
      duration: 0.8
    }, '-=0.3')
    .from('.scroll-indicator', {
      y: -20,
      opacity: 0,
      duration: 1
    }, '-=0.5');

    gsap.to('.scroll-arrow', {
      y: 10,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });
  }

  animateSections() {
    gsap.utils.toArray('.section').forEach(section => {
      gsap.from(section.querySelector('.section-title'), {
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse'
        },
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });
  }

  animateCards() {
    gsap.utils.toArray('.world-card').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 80,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power3.out'
      });
    });

    gsap.utils.toArray('.character-card').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.15,
        ease: 'back.out(1.7)'
      });
    });
  }

  animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
      const target = stat.getAttribute('data-target');

      ScrollTrigger.create({
        trigger: stat,
        start: 'top 80%',
        onEnter: () => {
          if (target === '∞') {
            let count = 0;
            const interval = setInterval(() => {
              stat.textContent = count;
              count += 50;
              if (count > 999) {
                stat.textContent = '∞';
                clearInterval(interval);
              }
            }, 30);
          } else {
            gsap.to(stat, {
              textContent: target,
              duration: 2,
              snap: { textContent: 1 },
              ease: 'power1.inOut'
            });
          }
        }
      });
    });
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);

        gsap.to(window, {
          duration: 1.5,
          scrollTo: { y: target, offsetY: 0 },
          ease: 'power3.inOut'
        });
      });
    });

    const heroButton = document.querySelector('.hero-button');
    heroButton.addEventListener('click', () => {
      gsap.to(window, {
        duration: 1.5,
        scrollTo: { y: '#worlds', offsetY: 0 },
        ease: 'power3.inOut'
      });
    });

    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      toggleClass: { className: 'nav-scrolled', targets: '.nav' }
    });
  }
}

new AnimeParticleSystem();
new AnimationController();
