<template>
  <ul class="playlists-list">
    <li class="playlist"
        v-for="(playlist,index) in playlists"
        :key="index"
        :class="{active: $route.query.id == playlist.id}"
    >
      <router-link :to="`/my/playlist?id=${playlist.id}`" class="flex">
        <div class="img-box">
          <img :src="playlist.coverImgUrl+'?param=100y100'" alt="">
        </div>
        <div class="info">
          <p class="name" :title="playlist.name">{{ playlist.name }}</p>
          <p class="count">
            {{ playlist.trackCount }}首
            <span class="by ellipse" v-if="!isCreator"
                  :title="playlist.creator.nickname"> by {{ playlist.creator.nickname }}</span>
          </p>
        </div>
      </router-link>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    playlists: Array,
    isCreator: Boolean
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.playlists-list
  .playlist
    padding 10px 0 10px 20px
    margin 3px 0
    cursor pointer

    &.active, &:hover
      background rgba(0, 0, 0, .05)

    .info
      width 150px
      margin-left 10px



      .by
        max-width 100px
        margin-left 10px

      .count
        margin-top 5px
        color #999
        font-size 12px

    .img-box
      flex-shrink 0
      width 60px
      height 60px
</style>
