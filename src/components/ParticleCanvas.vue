<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const canvas = ref(null);
const container = ref(null);
let gl = null;
let animationId = null;
let program = null;
let positionBuffer = null;
let positions = null;

const config = {
  particleCount: 3000,
  emojiArray: ['🍽️','☕', '🍺', '🍕', '🥖', '🧁', '🍦', '👕', '👗', '👞', '🖥️', '📱', '🎮', '⌨️', '⚕️', '💅', '💆', '💪', '💊', '🛒', '🏪', '📚', '🎪', '🐾', '🚗', '🎵', '🎨', '🌸', '💎', '⚽', '🔧', '📓', '🏪', '🏭', '🛠️'],
  mouseRadius: 0.2,
  particleSize: 2,
  forceMultiplier: 0.002,
  returnSpeed: 0.005,
  velocityDamping: 0.98,
  textChangeInterval: 5000,
  transitionDuration: 2000,
};

const state = ref({
  particles: [],
  currentEmojiIndex: 0,
  nextEmojiTimeout: null,
  textCoordinates: [],
  mouse: { x: -500, y: -500, radius: 0.2 },
  isActive: true,
  themeObserver: null
});

const getThemeColors = () => {
  const computedStyle = getComputedStyle(document.documentElement);
  const bgPrimary = computedStyle.getPropertyValue('--bg-primary').trim();
  const textPrimary = computedStyle.getPropertyValue('--text-primary').trim();
  return { bgPrimary, textPrimary };
};

const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r: r / 255, g: g / 255, b: b / 255 };
};

const createShaders = () => {
  const { textPrimary } = getThemeColors();
  const particleColor = hexToRgb(textPrimary);

  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_PointSize = ${config.particleSize.toFixed(1)};
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    void main() {
      vec4 color = vec4(${particleColor.r}, ${particleColor.g}, ${particleColor.b}, 0.8);
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      float alpha = 1.0 - smoothstep(0.45, 0.5, dist);
      gl_FragColor = vec4(color.rgb, color.a * alpha);
    }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  if (program) {
    gl.deleteProgram(program);
  }

  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  positionBuffer = gl.createBuffer();
  positions = new Float32Array(config.particleCount * 2);
};

const getTextCoordinates = (emoji) => {
  if (!canvas.value) return [];
  
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = canvas.value.width;
  ctx.canvas.height = canvas.value.height;
  const fontSize = Math.min(ctx.canvas.width / 4, ctx.canvas.height / 4);
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, ctx.canvas.width / 2, ctx.canvas.height / 2);
  
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
  const coordinates = [];
  const step = 8;
  
  for (let y = 0; y < ctx.canvas.height; y += step) {
    for (let x = 0; x < ctx.canvas.width; x += step) {
      const index = (y * ctx.canvas.width + x) * 4;
      if (imageData[index + 3] > 128) {
        coordinates.push({
          x: (x / ctx.canvas.width) * 2 - 1,
          y: (y / ctx.canvas.height) * -2 + 1
        });
      }
    }
  }
  return coordinates;
};

const initParticles = () => {
  state.value.particles = [];
  for (let i = 0; i < config.particleCount; i++) {
    state.value.particles.push({
      x: 0,
      y: 0,
      baseX: 0,
      baseY: 0,
      vx: 0,
      vy: 0
    });
  }
};

const createParticles = () => {
  const coordinates = getTextCoordinates(config.emojiArray[state.value.currentEmojiIndex]);
  if (coordinates.length === 0) return;

  const oldPositions = state.value.particles.map(p => ({ x: p.baseX, y: p.baseY }));
  const startTime = Date.now();

  const newPositions = [];
  for (let i = 0; i < config.particleCount; i++) {
    const randomIndex = Math.floor(Math.random() * coordinates.length);
    newPositions.push(coordinates[randomIndex]);
  }

  const animateTransition = () => {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / config.transitionDuration, 1);
    
    const easing = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const easedProgress = easing(progress);

    for (let i = 0; i < config.particleCount; i++) {
      const oldPos = oldPositions[i];
      const newPos = newPositions[i];
      
      state.value.particles[i].baseX = oldPos.x + (newPos.x - oldPos.x) * easedProgress;
      state.value.particles[i].baseY = oldPos.y + (newPos.y - oldPos.y) * easedProgress;
    }

    if (progress < 1) {
      requestAnimationFrame(animateTransition);
    }
  };

  animateTransition();
};

const updateParticles = () => {
  if (!state.value.isActive) return;

  const { mouse } = state.value;
  for (let i = 0; i < config.particleCount; i++) {
    const particle = state.value.particles[i];
    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < mouse.radius) {
      const force = (mouse.radius - distance) / mouse.radius;
      particle.vx -= dx * force * config.forceMultiplier;
      particle.vy -= dy * force * config.forceMultiplier;
    }

    particle.vx += (particle.baseX - particle.x) * config.returnSpeed;
    particle.vy += (particle.baseY - particle.y) * config.returnSpeed;

    particle.vx *= config.velocityDamping;
    particle.vy *= config.velocityDamping;

    particle.x += particle.vx;
    particle.y += particle.vy;

    positions[i * 2] = particle.x;
    positions[i * 2 + 1] = particle.y;
  }
};

const observeThemeChanges = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class' || 
          mutation.attributeName === 'data-theme') {
        updateThemeColors();
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme']
  });

  return observer;
};

const updateThemeColors = () => {
  if (!gl) return;
  gl.clearColor(0, 0, 0, 0);
  createShaders();
};

const render = () => {
  if (!gl || !state.value.isActive) return;

  updateParticles();
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.POINTS, 0, config.particleCount);
  animationId = requestAnimationFrame(render);
};

const handleMouseMove = (event) => {
  if (!canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();
  state.value.mouse.x = ((event.clientX - rect.left) / canvas.value.width) * 2 - 1;
  state.value.mouse.y = -((event.clientY - rect.top) / canvas.value.height) * 2 + 1;
};

const handleMouseLeave = () => {
  state.value.mouse.x = -500;
  state.value.mouse.y = -500;
};

const changeEmoji = () => {
  if (!state.value.isActive) return;
  state.value.currentEmojiIndex = (state.value.currentEmojiIndex + 1) % config.emojiArray.length;
  createParticles();
  state.value.nextEmojiTimeout = setTimeout(changeEmoji, config.textChangeInterval);
};

const initGL = () => {
  if (!canvas.value) return;
  
  gl = canvas.value.getContext('webgl', { 
    antialias: true,
    alpha: true,
    premultipliedAlpha: false
  });
  
  if (!gl) return;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  
  createShaders();
  initParticles();
  createParticles();
  render();
  changeEmoji();
};

const handleResize = () => {
  if (!canvas.value || !gl) return;
  
  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;
  gl.viewport(0, 0, canvas.value.width, canvas.value.height);
  createParticles();
};

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;
    initGL();
    
    const themeObserver = observeThemeChanges();
    state.value.themeObserver = themeObserver;
    
    window.addEventListener('resize', handleResize);
    canvas.value.addEventListener('mousemove', handleMouseMove);
    canvas.value.addEventListener('mouseleave', handleMouseLeave);
  }
});

onBeforeUnmount(() => {
  state.value.isActive = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (state.value.nextEmojiTimeout) {
    clearTimeout(state.value.nextEmojiTimeout);
  }
  if (state.value.themeObserver) {
    state.value.themeObserver.disconnect();
  }
  window.removeEventListener('resize', handleResize);
  if (canvas.value) {
    canvas.value.removeEventListener('mousemove', handleMouseMove);
    canvas.value.removeEventListener('mouseleave', handleMouseLeave);
  }
  if (gl && program) {
    gl.deleteProgram(program);
  }
});
</script>
<template>
    <div class="particle-wrapper">
      <div class="particle-container" ref="container">
        <canvas ref="canvas" class="particle-canvas"></canvas>
      </div>
    </div>
</template> 
<style scoped>
.particle-wrapper {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  transform: translateX(-32.5%);
}

.particle-container {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
}

.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

:deep(header),
:deep(footer),
:deep(.header),
:deep(.footer),
:deep([data-overlay="true"]) {
  position: relative;
  z-index: 1;
}
</style>