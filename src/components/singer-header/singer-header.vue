<template>
  <div class="singer-header">
    <div class="background-blur">
      <img :src="singer.picUrl+'?param=200y200'">
    </div>
    <div class="container my-card">
      <div class="avatar">
        <router-link :to="`/music/artist/${singer.id}`">
          <img :src="singer.picUrl+'?param=300y300'" alt="">
        </router-link>
      </div>
      <h2 class="name">
        {{ singer.name }}
        <span class="alias" v-for="(aliase,index) in singer.alias" :key="index">{{ aliase }}<i
            v-if="index<singer.alias.length-1">,</i></span>
      </h2>
      <p class="desc ellipse" :title="desc.briefDesc">
        {{ desc.briefDesc }}
        <router-link :to="`/music/artist/${singer.id}/desc`" class="more"
                     v-if="desc.introduction&&desc.introduction.length">查看全部
        </router-link>
      </p>
      <div class="button-card active" @click="follow" :class="{followed: followed}">
          <view v-if="followed">
              <Icon type="ios-heart"/>
              <span class="s"> 已收藏 </span>
              <span class="hv">取消收藏</span>
          </view>
          <view v-else>
              <Icon type="md-heart-outline"/>
              收藏
          </view>
      </div>
    </div>
  </div>
</template>

<script>
import {reqSingerAlbum, reqSingerDesc, reqSubSinger, subSinger} from "@/api";
import {View} from "@element-plus/icons-vue";

export default {
  components: {View},
  data() {
    return {
      singer: '',
      desc: '',
      followed: false
    }
  },
  methods: {
    follow() {
      subSinger(this.$route.params.id, this.followed ? 0 : 1).then(res => {
        if (res.code === 200) {
          this.followed = !this.followed
        } else {
          this.$Message.error('操作失败')
        }
      })
    }
  },
  created() {
    let id = +this.$route.params.id
    reqSingerAlbum(id, 1, 0).then(res => {
      this.singer = res.artist
      document.title = `${this.singer.name} - 歌手 - 网易云音乐`
    })
    reqSingerDesc(id).then(res => {
      this.desc = res
    })
    let userInfo = JSON.parse(window.localStorage.getItem('userInfo')) || ''
    if (userInfo) {
      reqSubSinger().then(res => {
        let b = res.data.every(item => {
          return item.id !== id
        })
        this.followed = !b
      })
    }
  },
  watch: {
    $route() {
      document.title = `${this.singer.name} - 歌手 - 网易云音乐`
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.singer-header
  position relative
  padding 50px 0

  .button-card
    margin 10px auto 0
    width 120px
    text-align center

    .hv
      display none

    &.followed
      border-color #E91E63
      color #E91E63

      &:hover
        border-color rgba(0, 0, 0, .05)
        background rgba(0, 0, 0, .05)

        .hv
          display inline

        .s
          display none

  .name
    margin-top 15px
    font-size 24px
    color #000
    font-weight 800
    text-align center

    .alias
      font-weight normal
      font-size 16px
      color #999

  .desc
    position relative
    line-height 21px
    padding 0 50px
    margin 10px auto 0
    max-width 80%

    .more
      position absolute
      right 0
      bottom 0
      color #E91E63

  .avatar
    width 220px
    height 220px
    border-radius 50%
    margin 0 auto
    overflow hidden

    img

      width 100%
      height 100%

</style>
