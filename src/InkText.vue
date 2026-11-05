<script>
let observer
function observe(el){
  observer??=new IntersectionObserver(entries=>{for(const {target,isIntersecting} of entries){
    if(isIntersecting){target.classList.add('ink-on');observer.unobserve(target)}
  }},{threshold:0})
  observer.observe(el)
}
export default {
  mounted(){observe(this.$el)},
  beforeUnmount(){observer?.unobserve(this.$el)}
}
</script>
<template><span class="ink-word"><span class="ink-content"><slot/></span><span class="ink-drop" aria-hidden="true"></span></span></template>
