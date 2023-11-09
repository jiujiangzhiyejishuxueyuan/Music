<script setup>
import {reqLikeSong,changeplaylistSong,reqUserPlaylist} from "@/api";
import {Message} from "view-ui-plus";
let {songs, showHeader, player, btns,showFooter,pid} = defineProps(['songs', 'player', 'showHeader', 'btns','showFooter','isplay','pid'])
const {playMusic}  = getCurrentInstance().appContext.config.globalProperties.methods
const emit = defineEmits(['checked','play','ondelete','batchDelete'])
let userInfo = JSON.parse(window.localStorage.getItem('userInfo'))
let likeIds = ref([]),
    value = ref([]),
    playlistsShow = ref(false),
    playlists = ref([]),
    cpSongs = ref([])
const pbtns = btns ? btns : [
  {
    icon: 'ios-play',
    event: 'onplay',
    title: '播放'
  },
  {
    icon: 'md-heart-outline',
    event: 'onlove',
    title: '喜欢'
  },
  {
    icon: 'ios-add',
    event: 'onadd',
    title: '添加到'
  }
]
if (userInfo) {
  reqLikeSong(userInfo.userId).then(res => {
    likeIds.value = res.ids
  })
  reqUserPlaylist(userInfo.userId).then(res => {
    playlists.value = res.playlist.filter(item => {
      return !item.subscribed
    })
  })
}
// 歌曲删除键
function deleteOne(id) {
  emit('ondelete', id)
  let index = value.value.indexOf(id)
  console.log(value.value[index],'---删除了')
  if (index !== -1) {
    console.log(value.value[index],'---删除了')
    value.value.splice(index, 1)
  }
}
// 批量删除键
function batchDelete() {
  if (value.value.length) {
    emit('batchDelete')
    value.value = []
  }
}
// 点击复选框
function check(song) {
  let index = value.value.indexOf(song.id)
  index !== -1 ? value.value.splice(index, 1) : value.value.push(song.id)
}
// 播放音乐
function playmusic(ids) {
  if (ids.length === 0) {
    Message.error('请选中歌曲')
  } else if (!player) {
    playMusic(ids)
  } else {
    emit('play', ids)
  }
}
// 添加到歌单
function addToPlaylist(pid) {
  changeplaylistSong(pid, 'add', value.value.join(',')).then(res => {
    if (res.code === 200) {
      Message.success('添加到歌单成功')
      value.value = []
    } else if (res.code === 502) {
      Message.info('歌单歌曲重复')
    } else {
      Message.error('操作失败')
    }
  })
}
// 切换歌单列表显隐
function switchPlaylistsShow(type) {
  if (playlistsShow.value) {
    playlistsShow.value = false
  } else if (value.value.length) {
    playlistsShow.value = type
    setTimeout(() => {
      window.onclick = () => {
        playlistsShow.value = false
        window.onclick = null
      }
    })
  }
}
// props歌单数据丢失，模板传值保留！！！
function wocaonide(songs) {
  cpSongs.value = songs
}
// 全选框计算属性
let allChecked = computed({
    set(v) {
      if (v) {
        cpSongs.value.forEach(item => {
          if (value.value.indexOf(item.id) === -1) {
            value.value.push(item.id)
          }
        })
      } else {
        value.value = []
      }

    },
    get() {
      if (value.value.length) {
        return value.value.length === cpSongs.value.length
      }
      return false
    }
})
// 监视选中列表
watch(value,(v) => {
    emit('checked', value)
    if (!v.length) {
      playlistsShow.value = false
    }
})
</script>
<template>
  {{wocaonide(songs)}}
  <div class="my-song-list" :class="{isplayer: player}">
    <!--        播放器头-->
    <div class="menu-toolbar flex" v-if="player">
      <div class="button" :class="{active:value.length}" @click="switchPlaylistsShow('top')">
        <Icon type="ios-add-circle-outline"/>
        添加到歌单
        <ul class="playlist-list top" v-if="playlistsShow==='top'">
          <li v-for="(playlist,index) in playlists" :key="index" class="ellipse"
              @click.stop="addToPlaylist(playlist.id)">
            {{ playlist.name }}
          </li>
        </ul>
      </div>
      <div class="button" @click="batchDelete" :class="{active:value.length}">
        <Icon type="ios-trash"/>
        删除
      </div>
    </div>
    <!--        头部-->
    <div class="songlist-header" v-if="!hiddenHeader" @click="console.log(!songs.length&&!player)">
      <div class="row flex align-center disable">
        <div @click="allChecked=!allChecked" class="song-check"  v-if="player">
          <Icon type="ios-checkmark" v-show="allChecked"/>
        </div>
        <div class="song-index"></div>
        <div class="song-name">歌曲</div>
        <div class="singer">歌手</div>
        <div class="album">专辑</div>
      </div>
    </div>
    <!--        内容-->

    <ul class="songlist-ske" v-if="!songs.length&&!player">
      <li class="song flex justify-between align-center" v-for="index in 10" :key="index">
        <div class="song-name"></div>
        <div class="song-singer"></div>
        <div class="song-album"></div>
      </li>
    </ul>
    <div class="songlist-inner" v-else>
      <div class="scroll">
        <div :class="{active:song.id===pid}"
             :key="index"
             class="row flex align-center"
             v-for="(song,index) in songs"
        >
<!--          复选框-->
          <div @click="check(song)" class="song-check" v-if="player">
                        <Icon type="ios-checkmark" v-show="value.indexOf(song.id)!==-1"/>
          </div>
          <div class="song-on" v-if="isplay&&song.id===pid">
          </div>
<!--          序号-->
          <div class="song-index" v-else>
            {{ index < 9 ? '0'+(index + 1) :  index + 1}}
          </div>
<!--          播放键-->
          <div class="play" v-if="!isplay||song.id!==pid">

            <Icon type="ios-play" @click="playmusic(song.id)"/>
          </div>
          <!--歌名-->
          <div class="song-name">
            <router-link :to="`/music/song/${song.id}`" v-if="!player">{{ song.name }}</router-link>
            <a :href="`/music/song/${song.id}`" target="_blank" v-else>{{ song.name }}</a>
          </div>
          <!--歌手-->
          <div class="singer ellipse">
                        <span

                            :key="index"
                            class="text-hv"
                            v-for="(art,index) in (song.ar || song.artists)"
                        >
                            <router-link :to="`/music/artist/${art.id}`" v-if="!player">{{ art.name }}</router-link>
                            <a :href="`/music/artist/${art.id}`" target="_blank" v-else>{{ art.name }}</a>
                            <span v-if="index+1<(song.ar || song.artists).length">/</span>
                        </span>
          </div>
          <!--专辑-->
          <div class="album text-hv ellipse">
            <router-link
                class="text-hv"
                :to="`/music/album/${song.al?song.al.id:song.album.id}`"
                v-if="!player"
            >
              《{{ (song.al || song.album).name }}》
            </router-link>
            <a target="_blank" :href="`/music/album/${song.al?song.al.id:song.album.id}`" v-else>《{{
                (song.al
                    || song.album).name
              }}》</a>
          </div>
          <div class="song-control-box">
            <song-control
                :btns="pbtns"
                :id="song.id"
                :like-ids="likeIds"
                @ondelete="deleteOne(song.id)"
            />
          </div>

        </div>
      </div>
    </div>
    <!--        底部-->
    <div class="songlist-foot" v-if="showFooter">
      <div class="row flex align-center disable">
        <div @click="allChecked=!allChecked" class="song-check">
          <Icon type="ios-checkmark" v-show="allChecked"/>
        </div>
        <div class="song-index">全选</div>
        <div class="button-card" :class="{active:value.length}" @click="playmusic(value)">
          <Icon type="ios-play-outline"/>
          播放选中歌曲
        </div>
        <div class="button-card relative" :class="{active:value.length}" @click="switchPlaylistsShow('bottom')">
          <Icon type="md-add"/>
          添加到
          <ul class="playlist-list playlist-list-bottom" v-if="playlistsShow==='bottom'">
            <li v-for="(playlist,index) in playlists" :key="index" class="ellipse"
                @click.stop="addToPlaylist(playlist.id)">
              {{ playlist.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus" rel="stylesheet/stylus">
$red = #e91e63
.my-song-list
  padding-top 65px
  position relative
  height 100%

  &.isplayer
    padding-top 110px

    .songlist-header
      top 45px

    .song-check
      color #fff !important
      border-color rgba(255, 255, 255, .8) !important

  .button-card
    margin-right 10px

  .songlist-ske
    .song
      border-radius 15px
      overflow hidden
      height 50px
      margin 15px 0
      padding 0 20px

      .song-name, .song-singer, .song-album
        animation ske .8s linear infinite alternate
        background rgba(0, 0, 0, .05)
        height 50%

      .song-singer
        width 20%

      .song-album
        width 15%

      .song-name
        width 40%

  .playlist-list
    z-index 11
    position absolute
    transform translateX(-100%)
    left 0
    text-align left
    box-shadow 0 5px 8px rgba(0, 0, 0, .5)

    &.playlist-list-bottom
      width 150px
      transform none
      margin-left 100px
      right 0
      bottom 0
      background #ffffff
      color #333333

    li
      padding 5px 10px

      &:hover
        color #fff
        background #E91E63

  .menu-toolbar
    color #fff
    position absolute
    top 0
    left 0
    line-height 35px
    height 35px


    .button
      border-color #fff
      margin-right 20px

  .songlist-inner
    height 100%
    overflow auto

  /*滚动条整体样式*/

  .songlist-inner::-webkit-scrollbar
    width: 8px;
    height: 0;

  /*滚动条滑块*/

  .songlist-inner::-webkit-scrollbar-thumb
    border-radius: 10px;
    -webkit-box-shadow: none
    background: rgba(255, 255, 255, 0.2);

  /*滚动条轨道*/

  .songlist-inner::-webkit-scrollbar-track
    -webkit-box-shadow: inset 0 0 1px rgba(0, 0, 0, 0);
    border-radius: 10px;
    background: transparent;

  .songlist-header
    position absolute
    top 0
    left 0
    width 100%

  .button
    padding 0 18px
    margin-right 20px

  .songlist-foot .song-index,
  .songlist-header .row
    font-size 12px
    color #999

  .songlist-foot .row, .songlist-header .row
    &:hover
      .song-index
        display block

      .play
        display none

  .row
    position relative
    box-sizing content-box
    height 33px
    text-align left
    line-height 35px
    padding 16px 20px
    font-size 14px

    &.disable
      .hv
        background #fff !important

      &:hover
        background transparent !important

    &.active
      color #E91E63 !important

      a
        color #E91E63 !important

    a
      color #333

      &:hover
        color $red !important

    &:hover
      background #F2F2F2

      .song-control
        opacity 1

      .song-index
        display none

      .play
        display block

    .song-check
      cursor pointer
      position relative
      width 16px
      height 16px
      border 1px solid #666

      i
        font-size: 20px
        font-weight 800
        position absolute
        left -2px
        top -2px

    .play,
    .song-on,
    .song-index
      text-align center
      width 6%
      min-width 35px
    .song-index
      color #999

    .song-on
      height 100%
      background url("../../static/imgs/isplay.gif") no-repeat center

    .play
      font-size 20px
      display none

      i:hover
        cursor pointer
        color $red

    .song-name
      width 40%

    .singer
      width 20%

    .album
      width 15%

    .song-control-box
      height 100%
      width 18%

      .song-control
        position absolute
        right 20px

</style>
