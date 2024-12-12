<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import Header from './components/Header.vue';
import FooterComponent from './components/Footer.vue';
import './assets/main.css'

</script>
<template>
  <Header/>
  <RouterView />
  <FooterComponent/>
</template>
