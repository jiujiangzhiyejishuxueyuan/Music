<template>
  <div id="playlist-list">
    <ul class="flex flex-wrap" v-if="playlists.length">
      <li v-for="(playlist,index) in playlists" :key="index">
        <div class="content img-scale-hover" :title="playlist.name">
          <div class="cover relative img-scale">
            <router-link :to="`/music/playlist/${playlist.id}`">
              <div class="img-box ">
                <img alt="封面图" :src="playlist.coverImgUrl">
              </div>
            </router-link>
          </div>
          <div class="info ellipse">
            <a class="text-hv" :title="playlist.name">{{ playlist.name }}</a>
          </div>
          <div class="play-count" :title="'播放量:'+playlist.playCount">
            <Icon type="ios-headset"/>
            {{ playlist.playCount | playCount }}
          </div>
        </div>
      </li>
    </ul>
    <playlist-ske :row="5" v-else/>
  </div>
</template>

<script>
import PlaylistSke from "@/components/play-list/playlist-ske";

export default {
  name: 'play-list',
  components: {PlaylistSke},
  props: {
    playlists: Array
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
#playlist-list
  margin-bottom 40px

  ul li
    width 20%
    margin-bottom 20px

    .content
      padding 0 14px

      .cover:hover .btn-play
        opacity 1

      .img-box
        border-radius 10px
        width 100%
        height 252px
        overflow hidden
        @media screen and (max-width: 1200px)
          width 172px !important
          height 172px !important
        @media screen and (max-width: 1550px)
          width 212px
          height 212px

    .info
      text-align left
      margin-top 15px
      font-size 16px

    .play-count
      padding 3px 0
      font-size 14px
      color #999
      text-align left


</style>
