<script setup>
defineProps({direction:{type:String,default:'diagonal'}})
const angles={right:0,left:180,up:-90,diagonal:-45}
</script>
<template>
  <svg class="arrow-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 12h15m-6-6 6 6-6 6" :transform="'rotate('+angles[direction]+' 12 12)'"/>
  </svg>
</template>
