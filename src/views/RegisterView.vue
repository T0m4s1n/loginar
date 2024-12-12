<script setup lang="ts">
import { defineOptions } from 'vue'
import Register from '../components/Register.vue';

defineOptions({
  name: 'RegisterView'
})
</script>

<template>
  <main>
    <Register />
  </main>
</template>
<style>
main {
  width: 100%;
  min-height: 100vh;
}
</style>