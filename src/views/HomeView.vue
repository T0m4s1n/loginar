<script setup lang="ts">
import { defineOptions } from 'vue';
import ParticleCanvas from '../components/ParticleCanvas.vue';
import HeroComponent from '../components/HeroComponent.vue';
import HomeComponent from '../components/HomeComponent.vue';

defineOptions({
  components: {
  ParticleCanvas,
  HeroComponent,
  HomeComponent,
  }
});
</script>

<template>
  <main>
    <ParticleCanvas/>
    <HeroComponent/>
    <HomeComponent/>
  </main>
</template>
