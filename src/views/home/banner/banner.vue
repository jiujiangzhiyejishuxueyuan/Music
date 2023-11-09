<template>
  <div class="home-banner container">
    <el-carousel
        :interval="5000"
        type="card"
        trigger="click"
    >
      <el-carousel-item v-for="item in banners.banners" :key="item.url">
        <div class="img-box" @click.stop="skip(item)">
          <img :src="item.imageUrl" :alt="item.typeTitle">
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script>
import bannerSke from '@/views/home/banner/banner-ske'

export default {
  components: {
    bannerSke
  },
  props: {
    banners: Array
  },
  methods: {
    skip(banner) {
      let type = {
        '1': '/music/song',
        '1004': '/mv',
        '10': '/music/album',
        '1014': '/video'
      }
      if (banner.url) {
        window.open(banner.url)
      } else {
        this.$router.push(`${type[banner.targetType]}/${banner.targetId}`)
      }
    }
  }
}
</script>

<style lang="stylus">
.home-banner
  width 1900px
  margin-top 30px
  .el-carousel__mask
    background none
  .el-carousel__container
    height 350px
  .el-carousel__item
    border-radius 15px
    overflow hidden
    box-shadow 0 0 3px 0 rgba(0,0,0,.3)
  @media screen and (max-width: 1900px)
    width 1500px
    .el-carousel__container
      height 275px
  @media screen and (max-width: 1500px)
    width 1200px
    .el-carousel__container
      height 220px
  @media screen and (max-width: 1200px)
    width 800px
    .el-carousel__container

      height 150px


</style>
