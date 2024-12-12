<script setup lang="ts">
import { defineOptions } from 'vue'
import Login from '../components/Login.vue';

defineOptions({
  name: 'LoginView'
})
</script>

<template>
  <main>
    <Login />
  </main>
</template>
<style>
main {
  width: 100%;
  min-height: 100vh;
}
</style>