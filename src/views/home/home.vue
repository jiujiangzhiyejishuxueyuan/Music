<script setup>
import banner from '@/views/home/banner/banner.vue'
import bannerSke from "@/views/home/banner/banner-ske.vue";
import recommendHot from '@/views/home/recommend-hot/recommend-hot.vue'
import playlistListSke from '@/components/playlist-list-ske/playlist-list-ske.vue'
import recommendToday from "@/views/home/recommend-today/recommend-today.vue";
import newAlbumList from '@/views/home/new-album-list/new-album-list.vue'
import rank from "@/views/home/rank/rank.vue";
import {reqBanner, reqHotSongList} from "@/api";
import {onMounted, reactive} from "vue";

let userInfo = window.localStorage.getItem('userInfo') || ''
let banners = reactive({})
let hotPlaylist = reactive({})
onMounted(async () => {
  let bannersData = await reqBanner()
  banners.banners = bannersData.banners
  banners.code = bannersData.code

  let hotPlaylistData = await reqHotSongList(12)
  hotPlaylist.list = hotPlaylistData.result
  hotPlaylist.code = hotPlaylistData.code
})

</script>

<template>
  <div class="home">
    <banner :banners="banners" v-if="banners.code===200"/>
    <banner-ske v-else/>
    <recommend-hot v-if="hotPlaylist.code === 200" :list="hotPlaylist.list" title="热门推荐"/>
    <playlistListSke :row="2" v-else/>
    <recommend-today v-if="userInfo"/>
    <new-album-list/>
    <rank/>
  </div>
</template>

<style lang="stylus">

</style>