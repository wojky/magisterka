<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCharacter } from "../data/useCharacter";
import SpinnerLoader from "@/components/SpinnerLoader.vue";

const route = useRoute();
const { fetchData, data: character } = useCharacter();

onMounted(() => {
  const idParam = route.params["id"];

  fetchData(Array.isArray(idParam) ? idParam[0] : idParam);
});
</script>

<template>
  <div class="flex flex-col bg-gray-100 p-4">
    <div v-if="character" class="card !p-8 max-w-2xl mx-auto">
      <div class="flex items-center mb-4">
        <img
          class="w-32 h-32 rounded-image mr-4"
          :src="character.image"
          alt="{{ character.name }}"
        />
        <div>
          <h2 class="text-2xl font-bold text-gray-700">
            {{ character.name }}
          </h2>
          <p class="text-gray-500">{{ character.type || "Unknown Type" }}</p>
        </div>
      </div>
      <div class="text-gray-700">
        <p><strong>Species:</strong> {{ character.species }}</p>
        <p><strong>Status:</strong> {{ character.status }}</p>
        <p><strong>Gender:</strong> {{ character.gender }}</p>
        <p><strong>Origin:</strong> {{ character.origin.name }}</p>
        <p><strong>Location:</strong> {{ character.location.name }}</p>
        <p><strong>Episodes count:</strong> {{ character.episode.length }}</p>
      </div>
    </div>
    <SpinnerLoader v-else />
  </div>
</template>
