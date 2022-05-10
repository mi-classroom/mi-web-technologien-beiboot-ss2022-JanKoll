<script setup lang="ts">
defineProps<{
  img: any
}>()
</script>

<template>
  <div class="card">
    <h3 class="green">{{ img.title }}</h3>
    <img :src="img.preview" :alt="img.title">
    <p><b>Art: </b>{{ img.kind }}</p>
    <p><b>Besitzer:in: </b>{{ img.owner }}</p>
    <p><b>Datum: </b>{{ img.date }}</p>
    <p><i>{{ img.sortingNumber }}</i></p>
    <hr>
  </div>
</template>

<style scoped>

</style>
