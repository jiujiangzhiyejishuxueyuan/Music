<script setup>
import {reqPlaylistDetail, reqSongDetail, reqPlaylistComments, scrobble} from "@/api";
import {useRoute, useRouter} from "vue-router";
import {Message} from "view-ui-plus";
const route = useRoute(),
      router = useRouter()
const {playCount, dataFormat,playMusic} = getCurrentInstance().appContext.config.globalProperties.methods
let commentLimit = 10, //一页评论数
    songids = [], //歌曲id数组
    songs = ref([]), //歌曲数组
    onceSongsNum = 20, //一页歌曲数
    id = route.params.id || route.query.id, //歌单id
    maxPage = ref(1), //最大页数
    songlist = ref({}), //歌单对象
    page = computed(() => parseInt(route?.query.page) || 1), //当前页码
    loginState = !!window.localStorage.getItem('userInfo'), //登录状态
    hotComments = ref(true), //评论数组
    commentDom = ref(), //评论组件dom对象
    hotC = ref([]),
    comment = ref({})
onMounted(async () => {
  reqPlaylistDetail(id).then((res) => {
    songlist.value.playlist = res.playlist
    if (loginState) {
      render()
    } else {
      if (songlist.value.playlist.trackIds.length < 20) {
        songlist.value.playlist.trackIds.forEach((item, index) => {
          songids.push(item.id)
        })
        reqSongDetail(songids.join(',')).then(res => {
          console.log('未登录，拿到了歌曲信息---', res)
          songs.value = res.songlists
        })
      } else {
        render()
      }
    }
  })
  reqPlaylistComments(id, commentLimit, 0).then(res => {
    comment.value = res
    if (res.hotComments && res.hotComments.length) {
      hotC.value = res.hotComments
    } else {
      hotComments.value = false
    }

  })
})
async function render() {
  let idsLength = songlist.value.playlist?.trackIds.length
  maxPage = Math.ceil(idsLength / 20)
  if (page.value > maxPage.value) {
    Message({
      message: '页码错误,正在重定向',
      type: 'error'
    })
    router.push({path: '/music'})
  }
  let startCount = (page.value - 1) * onceSongsNum //开始位置
  let residue = songlist.value.playlist.trackCount - startCount  //剩余数量
  residue = residue >= 20 ? 20 : residue //最大取一页数据
  songids = []
  for (let i = 0; i < residue; i++) {
    songids.push(songlist.value.playlist.trackIds[startCount + i].id)
  }
  songs.value = []
  reqSongDetail(songids.join(',')).then(res => {
    songs.value = res.songs
  })
}
//评论翻页
function nextComment(page) {
  let offset = commentLimit * (page - 1)
  comment.value.comments = []
  comment.value.code = 0
  scrollToComment()
  reqPlaylistComments(id, commentLimit, offset).then(res => {
    comment.value = res
    if (!res.hotComments) {
      hotComments.value = false
    }
  })
}
//滚动到评论
function scrollToComment() {
  window.scrollTo(0, (commentDom.value.getBoundingClientRect().top + window.scrollY))
}
// 全部播放
function allPlay() {
  playMusic(songids)
}

watch(() =>route.query,()=> {
  render()
})
// let i = 0
// setInterval(() => {
//   scrobble({
//     id:'1807563171',
//     sourceid:'412745461',
//     time:230,
//     timestamp:new Date().getTime()
//   }).then(res => {
//     console.log(i++)
//   })
// },1000)
</script>
<template>
  <div class="playlist-detail">
    <div class="header-info" v-if="songlist.playlist">
      <div class="background-blur">
        <img :src="songlist.playlist.coverImgUrl+'?param=200y200'">
      </div>
      <div class="info-inner flex container my-card">
        <div class="img-box header-info-img">
          <img :src="songlist.playlist.coverImgUrl+'?param=500y500'" v-if="songlist.playlist.coverImgUrl">
        </div>
        <div class="content flex direction-column justify-between" v-if="songlist.playlist.creator">
          <div class="title ">
            <h1 class="ellipse" :title="songlist.playlist.name">{{ songlist.playlist.name }}</h1>
          </div>
          <div class="user-name flex">
            <div class="avatar">
              <img :src="songlist.playlist.creator.avatarUrl+'?param=50y50'">
            </div>
            <router-link :to="`/user/home?id=${songlist.playlist.creator.userId}`" title="查看主页">
              {{ songlist.playlist.creator.nickname }}
            </router-link>
            <div class="createTime">{{ dataFormat(songlist.playlist.createTime) }} 创建</div>
          </div>
          <div class="playcount">
            <span>播放量:</span>
            {{ playCount(songlist.playlist.playCount) }}
          </div>
          <div class="tags">
            <span>标签:</span>
            <template v-if="songlist.playlist.tags.length">
              <router-link :to="`/music/playlist?cat=${tag}`" v-for="(tag,index) in songlist.playlist.tags"
                           :key="index">{{ tag }}
              </router-link>
            </template>
            <template v-else> 暂无</template>
          </div>
          <div class="brief ellipse" :title="songlist.playlist.description">
            <span>简介:</span>
            {{ songlist.playlist.description || '暂无' }}

          </div>
          <playlist-control
              @allPlay="allPlay"
              @sub="sub"
              @scrollToComment="scrollToComment"
              :subed="subed"
          />
        </div>
      </div>
    </div>
    <header-info-ske v-else/>
    <div class="playlist-box" v-if="songlist.playlist">
      <div class="container my-card">
        <div class="playlist-inner">
          <div class="inner-title bb">
            <span class="title">歌曲列表</span>
            <span class="song-count">{{ songlist.playlist.trackCount }}首歌</span>
            <div class="play-count">
              播放: <span class="count">{{ playCount(songlist.playlist.playCount) }} </span>次
            </div>
          </div>
          <song-list :songs="songs" :player="false" :showHeader="true"/>
        </div>
        <template>
        </template>
                <Page
                    :total="songlist.playlist.trackCount"
                    :page-size="20"
                    @on-change="(page)=>router.replace(`${$route.path}?page=${page}`)"
                    :model-value="page"
                    v-if="songlist.playlist.trackCount>20"
                />
      </div>
    </div>

        <div class="playlist-comments container my-card" v-if="songlist.playlist">
          <div class="comment-count">
            {{ comment && comment.total }} 评论
          </div>
          <div class="comment-header flex" ref="commentDom">
            <a class="sort" :class="{active:hotComments}" @click="hotComments = true"
               v-if="hotC.length">最热评论</a>
            <a class="sort" :class="{active:!hotComments}" @click="hotComments = false">最新评论</a>
          </div>
          <comment-edit :id="songlist.playlist.id.toString()" type="2" class="input"/>
          <comment-list
              :id="songlist.playlist.id.toString()"
              type="2"
              :comments="hotComments ? hotC : comment.comments"
              :loading="!comment.code"
          />
          <Page
              class="comment"
              :total="comment.total"
              :page-size="commentLimit"
              @on-change="nextComment"
              v-if="comment&&!hotComments&&comment.total>20"
          />
        </div>

  </div>
</template>
<style lang="stylus" rel="stylesheet/stylus">
$blue = #00a1d6
$red = #e91e63
.playlist-detail
  .el-icon
    transform translateY(20%)

  .playlist-comments
    text-align left
    margin-top 50px

    .no-comments
      padding 20px 0 40px
      text-align center
      font-size 16px

    .comment-edit
      margin-bottom 20px

    .comment-count
      font-size 18px
      margin-bottom 20px

  .header-info
    position relative
    padding 50px 0

    .img-box > img
      cursor auto

    .content
      text-align left
      margin-left 50px
      color #000
      width 75%

      .playlist-control
        margin-top 15px


      .title
        padding 0 0 20px

      .user-name
        font-size 18px
        color #666
        line-height 25px

        .avatar
          width 25px
          height 25px
          border-radius 50%
          overflow hidden

          img
            display block
            width 100%

        .createTime
          margin-left 20px
          font-size 13px

        a

          font-size 14px
          color #666
          margin-left 5px

          &:hover
            color $red

      .playcount
        margin-top 20px

        span
          margin-right 5px

      .tags, .brief
        margin-top 10px

        span
          margin-right 10px

        a
          margin-right 10px

          &:hover
            color $red

  .playlist-box
    background #fff

    .inner-title
      padding 5px 20px
      text-align left
      position relative

      .title
        font-size 16px

      .play-count
        position absolute
        right 0
        bottom 5px
        font-size 14px

        .count
          color $blue

      .song-count
        color #999
        margin-left 20px
        font-size 12px
</style>
