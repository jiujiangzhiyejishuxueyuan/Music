<script setup>
import {changeplaylistSong, likeSong, reqUserPlaylist} from "@/api";
const {playMusic}  = getCurrentInstance().appContext.config.globalProperties.methods
import {Message} from "view-ui-plus";
const emit = defineEmits(['onlove','onadd','onplay','ondelete'])
let {id,likeIds,btns} = defineProps(['id','likeIds','btns'])
let playlistsShow = ref(false),
    playlists = ref([]),
    userInfo = window.localStorage.getItem('userInfo') || ''
// 添加到歌单
const myMethods = {
  onadd() {
    console.log('onadd')
    if (userInfo) {
      if (!playlistsShow.value) {
        playlistsShow.value = true
        reqUserPlaylist(userInfo.userId).then(res => {
          playlists.value = res.playlist.filter(item => {
            return !item.subscribed
          })
        })
        setTimeout(() => {
          window.onclick = () => {
            playlistsShow.value = false
            window.onclick = null
          }
        })
      }
    } else {
      Message.info('请先登录')
    }
  },
  onlove(id) {
    console.log('onlove')
    if (userInfo) {
      like = !like
    } else {
      Message.info('请先登录')
    }
  },
  onplay(id) {
    playMusic(id)
    console.log('onplay')
  }
}
function addToPlaylist(pid) {
  changeplaylistSong(pid, 'add', id).then(res => {
    if (res.code === 200) {
      Message.success('添加到歌单成功')
      playlistsShow.value = false
    } else if (res.code === 502) {
      Message.info('歌单中已存在此歌曲')
      playlistsShow.value = false
    } else {
      Message.error('操作失败')
    }
  })
}
function fun(type) {
  emit(type)
  myMethods[type] && myMethods[type]((id))
}

let like = computed({
  get:() => likeIds?.includes(id),
  set(value) {
    if (value) {
      likeSong(id, true).then(res => {
        Message.success('添加到我喜欢的音乐成功')
        likeIds.push(id)
      }).catch(error => Message.error('喜欢失败'))
    } else {
      likeSong(id, false).then(res => {
        Message.success('取消喜欢成功')
        likeIds.splice(likeIds.indexOf(id), 1)
      }).catch(error => Message.error('取消喜欢失败'))
    }
  }
})
</script>

<template>
  <div class="song-control flex align-center justify-end" :class="{active: playlistsShow}">
        <span class="item" @click="fun(item.event)" v-for="(item,index) in btns" :key="index">
            <Icon type="md-heart" v-if="item.event==='onlove'&&like" title="取消喜欢"/>
            <Icon :type="item.icon" v-else :title="item.title"/>
        </span>
    <ul class="playlist-list" v-if="playlistsShow">
      <li v-for="(playlist,index) in playlists" :key="index" class="ellipse"
          @click.stop="addToPlaylist(playlist.id)">
        {{ playlist.name }}
      </li>
    </ul>
  </div>
</template>

<!--<script>-->
<!--import {changeplaylistSong, likeSong, reqUserPlaylist} from "@/api";-->

<!--export default {-->
<!--  props: {-->
<!--    id: Number,-->
<!--    likeIds: Array,-->
<!--    btns: {-->
<!--      type: Array,-->
<!--      default: () => [-->
<!--        {-->
<!--          icon: 'ios-play',-->
<!--          event: 'onplay',-->
<!--          title: '播放'-->
<!--        },-->
<!--        {-->
<!--          icon: 'md-heart-outline',-->
<!--          event: 'onlove',-->
<!--          title: '喜欢'-->
<!--        },-->
<!--        {-->
<!--          icon: 'ios-add',-->
<!--          event: 'onadd',-->
<!--          title: '添加到'-->
<!--        }-->
<!--      ]-->
<!--    }-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      playlistsShow: false,-->
<!--      playlists: [],-->
<!--      userInfo: ''-->
<!--    }-->
<!--  },-->
<!--  methods: {-->
<!--    addToPlaylist(pid) {-->
<!--      changeplaylistSong(pid, 'add', this.id).then(res => {-->
<!--        if (res.code === 200) {-->
<!--          this.$Message.success('添加到歌单成功')-->
<!--          this.playlistsShow = false-->
<!--        } else if (res.code === 502) {-->
<!--          this.$Message.info('歌单中已存在此歌曲')-->
<!--          this.playlistsShow = false-->
<!--        } else {-->
<!--          this.$Message.error('操作失败')-->
<!--        }-->
<!--      })-->
<!--    },-->
<!--    click(type, id) {-->
<!--      this.$emit(type, id)-->
<!--      this[type] && this[type](id)-->
<!--    },-->
<!--    onadd() {-->
<!--      if (this.userInfo) {-->
<!--        if (!this.playlistsShow) {-->
<!--          this.playlistsShow = true-->
<!--          reqUserPlaylist(this.userInfo.userId).then(res => {-->
<!--            this.playlists = res.playlist.filter(item => {-->
<!--              return !item.subscribed-->
<!--            })-->
<!--          })-->
<!--          setTimeout(() => {-->
<!--            window.onclick = () => {-->
<!--              this.playlistsShow = false-->
<!--              window.onclick = null-->
<!--            }-->
<!--          })-->
<!--        }-->
<!--      } else {-->
<!--        this.$Message.info('请先登录')-->
<!--      }-->
<!--    },-->
<!--    onlove(id) {-->
<!--      if (this.userInfo) {-->
<!--        this.like = !this.like-->
<!--      } else {-->
<!--        this.$Message.info('请先登录')-->
<!--      }-->
<!--    },-->
<!--    onplay(id) {-->
<!--      this.publicMethods.playMusic(id)-->
<!--    }-->
<!--  },-->
<!--  computed: {-->
<!--    like: {-->
<!--      get() {-->
<!--        return this.likeIds.includes(this.id)-->
<!--      },-->
<!--      set(value) {-->
<!--        if (value) {-->
<!--          likeSong(this.id, true).then(res => {-->
<!--            this.$Message.success('添加到我喜欢的音乐成功')-->
<!--            this.likeIds.push(this.id)-->
<!--          }).catch(error => this.$Message.error('喜欢失败'))-->
<!--        } else {-->
<!--          likeSong(this.id, false).then(res => {-->
<!--            this.$Message.success('取消喜欢成功')-->
<!--            this.likeIds.splice(this.likeIds.indexOf(this.id), 1)-->
<!--          }).catch(error => this.$Message.error('取消喜欢失败'))-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--  },-->
<!--  created() {-->
<!--    this.userInfo = window.localStorage.getItem('userInfo') || ''-->
<!--  }-->
<!--}-->
<!--</script>-->

<style lang="stylus" rel="stylesheet/stylus">
.song-control
  text-align center
  line-height 35px
  opacity 0
  font-size 20px
  position relative

  &.active
    opacity 1

  .ivu-icon-md-heart
    color #E91E63

  .playlist-list
    z-index 11
    position absolute
    transform translateX(-100%)
    top 0
    left 0
    text-align left
    background #ffffff
    color #333
    font-size 14px
    box-shadow 0 3px 5px rgba(0, 0, 0, .3)

    li
      cursor pointer
      padding 5px 10px

      &:hover
        color #fff
        background #E91E63

  .item
    display block
    width 35px
    height 35px
    border-radius 50%
    margin-right 5px
    transition all .2s
    cursor pointer

    &:hover
      background rgba(0, 0, 0, .1)
</style>
