<script setup>
import { RouterLink, RouterView } from 'vue-router'
import myHeader from '@/components/my-header/my-header.vue'
import MyFooter from "@/components/my-footer/my-footer.vue";
import FixBtn from "@/components/fix-btn/fix-btn.vue";
let isRouterActive = ref(true)
function reload() {
  isRouterActive.value = false
  this.$nextTick(() => {
    isRouterActive.value = true
  })
}

provide('reload',reload)
</script>

<template>
  <my-header v-if="!$route.meta.hidden"/>
  <view id="app-view">
    <transition name="view" >
      <RouterView v-if="isRouterActive"/>
    </transition>
  </view>
  <BackTop :duration="2000"/>
  <fix-btn v-if="!$route.meta.hidden"/>
  <my-footer v-if="!$route.meta.hiddenFooter"/>
</template>

<style lang="stylus">
.view-enter-active, .view-leave-active
  transition opacity .2s

.view-enter, .view-leave-to
  opacity 0


.comment-header
  margin 0 0 20px 0
  .sort
    margin-right 20px
    &.active,&:hover
      color #00a1d6
#app
  display flex
  flex-direction column
  min-height 100vh
  text-align: center;

#header
  flex-shrink 0
#app-view
  flex-grow 2
#footer
  flex-shrink 0
</style>
