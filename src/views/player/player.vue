<template>
  <div class="player-audio">
    <div class="player-header flex justify-between">
      <a class="logo" href="/music" target="_blank"></a>
      <div class="right"></div>
    </div>
    <div class="player-content flex justify-center">
      <div class="left"></div>
      <div class="center" v-show="!immerse">
        <div class="music-list">
          <song-list
              :songs="songlist"
              :show-footer="false"
              :show-header="true"
              @checked="(value) => checked=value"
              :player="true"
              @play="changeMusic"
              :pid="+song.id"
              :isplay="isplay"
              :btns="btns"
              @ondelete="ondelete"
              v-model="checked"
              ref="songlist"
              @batchDelete="batchDelete"
          />
        </div>
      </div>
      <div class="right flex direction-column" :class="{immerse:immerse}">
        <div class="song-cover" v-show="!immerse">
          <img :src="song.al.picUrl+'?param=200y200'" alt="" v-if="song.al">
        </div>
        <div class="song-info" v-if="song.name&&!immerse">
          <p class="song_name ">歌曲名: <span class="ellipse">{{ song.name }}</span></p>
          <p class="song_name">
            歌手名:
            <span class="ellipse" v-for="(singer,index) in song.ar" :key="index">
                            {{ singer.name }}
                            <span v-if="index!=song.ar.length-1">/</span>
                        </span>
          </p>
          <p class="album">
            专辑名
            <span class="ellipse">{{ song.al.name }}</span>
          </p>
        </div>
        <lyric
            v-if="song.lyrics&&lyricShow"
            :lyrics="song.lyrics"
            :current-time="+song.currentTime"
            :class="{immerse: immerse}"
        />
        <div class="nolyric" v-else>
          纯音乐,请欣赏
        </div>
      </div>
    </div>
    <!--        底部-->
    <div class="player-footer">
      <div class="section-container flex align-center">
        <!--                左侧按钮-->
        <div class="action-left flex">
          <div class="prev" @click="previous">
            <Icon type="md-skip-backward"/>
          </div>
          <div class="play-pause" @click="isplay=!isplay">
            <Icon type="md-play" v-if="!this.isplay"/>
            <Icon type="md-pause" v-else/>
          </div>
          <div class="next" @click="changeMusic(nextId)">
            <Icon type="md-skip-forward"/>
          </div>
        </div>
        <!--                中间-->
        <div class="play-info expend">
          <div class="song-info flex justify-between " v-if="song.name">
            <div class="song-mate">
              <a :href="`/music/song/${song.id}`" target="_blank" class="text-hv">{{ song.name }}</a>-
              <span v-for="(singer,index) in song.ar" :key="index">
                                <a :href="`/music/artist/${singer.id}`" class="text-hv" target="_blank">
                                    {{ singer.name }}
                                </a>
                                <span v-if="index==song.ar.length">/</span>
                            </span>
            </div>
            <div class="current-time">
              {{ toMinutes(parseInt(song.currentTime)) }} /
              <span>{{ toMinutes(parseInt(song.moreTime)) }}</span>
            </div>
          </div>
          <Slider
              show-tip="never"
              v-model="progress"
              @on-change="resizeTime"
              :step="0.001"
              :max="1"
          />
        </div>
        <!--                右侧-->
        <div class="action-right flex align-center">
          <div class="immerse-btn flex align-center" @click="immerse = !immerse" :class="{on: immerse}">
            <div class="circle">
              {{ immerse ? 'on' : 'off' }}
            </div>
            <p>沉浸模式</p>
          </div>
          <div class="download">
            <a :href="url" target="_blank">
              <Icon type="md-download"/>
            </a>
            <Icon type="ios-heart-outline"/>
          </div>
          <div class="bit-switch" v-if="song.quality" @click="dropShow=!dropShow">
            {{ this.bit }}
            <Icon type="ios-arrow-down" v-if="dropShow"/>
            <Icon type="ios-arrow-up" v-else/>
            <ul class="dorp" v-show="dropShow">
              <li class="flex align-center" v-for="(item,index) in song.quality" :key="index" @click="switchBit(item)">
                <span :class="item&&item.sty"></span>
                {{ item && item.text }}
              </li>

            </ul>
          </div>
          <div class="control flex">
            <Icon type="md-volume-up" @click="player.muted=true" v-if="!player.muted"/>
            <Icon type="md-volume-mute" @click="player.muted=false" v-else/>
            <div class="p-box">
              <Slider
                  show-tip="never"
                  v-model="player.volume"
                  :step="0.01"
                  :max="1"
              />
            </div>
          </div>
        </div>
        <audio ref="play"
               @timeupdate="playmonitor"
               @loadeddata="songload"
               autoplay
               @error="err"
        ></audio>
      </div>
    </div>
    <div class="player-bg">
      <img :src="song.al.picUrl+'?param=10y7'" v-if="song.ar">
    </div>
  </div>
</template>

<script>
import songList from '@/components/song-list/song-list'
import lyric from "@/views/player/lyric/lyric";
import {reqSongDetail, reqSonglyric, reqSongUrl} from "@/api";
export default {
  name: "player",
  components: {
    songList,
    lyric
  },
  data() {
    return {
      lyricShow: true, //歌词显示
      immerse: false, //沉浸模式
      songlist: [], //歌曲数组
      ids: [], //歌曲id数组
      progress: 0,  //播放进度条位置
      player: '', //播放器对象
      isplay: false, //正在播放
      song: {  //歌曲对象
        name: '',
        currentTime: 0,
        lyrics: [],
        al: '',
        id: ''
      },
      url: '', //歌曲链接
      dropShow: false, //音质选择
      btns: [ //歌曲控制按钮
        {
          icon: "ios-trash-outline",
          event: 'ondelete',
          title: '从播放列表中删除'
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
      ],
      checked: [], //多选框数组
      bit: '无损', //当前音质
      setTime: 0, //定时器
    }
  },
  methods: {
    // audio加载出错时触发
    err() {
      this.$Message.error('歌曲加载出错')
      this.changeMusic(this.nextId)
    },
    skip(singer) {
      window.open(`/music/artist/${singer.id}`)
    },
    // 切换歌曲品质
    switchBit(v) {
      this.bit = v.text
      reqSongUrl(this.song.id, v.v.br).then(res => {
        this.url = res.data[0].url
      })
    },
    // 批量删除
    batchDelete() {
      console.log(this.checked,'--batchDelete')
      let current = false
      this.checked.forEach(item => {
        let index = this.ids.indexOf(item)
        this.ids.splice(index, 1)
        this.songlist.splice(index, 1)
        if (item === this.song.id) {
          current = true
        }
      })
      if (current) {
        this.changeMusic(this.nextId)
      }
      window.localStorage.setItem('musics', JSON.stringify({ids: this.ids}))
    },
    //上一曲
    previous() {
      let index = this.ids.indexOf(this.song.id)
      index = index ? index - 1 : this.ids.length - 1
      this.changeMusic(this.ids[index])
    },
    //歌曲右边删除键
    ondelete(id) {
      let index = this.ids.indexOf(id)
      this.ids.splice(index, 1)
      this.songlist.splice(index, 1)
      if (id === this.song.id) {
        this.changeMusic(this.nextId)
      }
      window.localStorage.setItem('musics', JSON.stringify({ids: this.ids}))
      console.log(id)
    },
    //播放中触发
    playmonitor(e) {
      this.song.currentTime = +this.player.currentTime.toFixed(1)
      this.progress = +(e.target.currentTime / this.song.moreTime).toFixed(3)
      if (this.player.ended) {
        this.changeMusic(this.nextId)
      }
    },
    //播放器每次准备好时触发
    songload() {
      this.song.moreTime = parseInt(this.player.duration)
    },
    //拖动歌曲进度条
    resizeTime(value) {
      this.isplay = true
      this.player.currentTime = parseInt(this.song.moreTime * value.toFixed(2))
    },
    //切歌
    changeMusic(id) {
      clearInterval(this.setTime)
      if (id) {
        reqSongDetail(id).then(res => {

          let song = res.songs[0]
          this.progress = 0
          this.song.id = song.id
          this.song.al = song.al
          this.song.ar = song.ar
          this.song.name = song.name
          this.song.quality = {
            h: song.h && {v: song.h, text: '无损', sty: 'h'},
            m: song.m && {v: song.m, text: '高清', sty: 'm'},
            l: song.l && {v: song.l, text: '标准', sty: 'l'}
          }
          let title = `正在播放 ${song.name} - ${song.ar[0].name}..`

          this.setTime = setInterval(() => {
            document.title = title.substring(1, title.length) + title.substring(0, 1);//截取字符重新赋值给title
            title = document.title.substring(0, title.length);
          }, 1000)
        }).catch(() => {
          console.log('未找到歌曲', id)
          this.changeMusic(this.nextId)
        })
        // 歌曲Url
        reqSongUrl(id).then(res => {
          console.log(this)
          this.url = res.data[0].url
          if (!this.url) {
            this.$Message.error('获取播放链接失败')
            this.changeMusic(this.nextId)
          }
        })
        // 歌曲歌词
        reqSonglyric(id).then(res => {
          this.song.lyrics = []
          if (!res.nolyric) {
            let lrc = res.lrc.lyric.split('\n')
            lrc.forEach((item) => {
              let time = (item.substring(item.indexOf("[") + 1, item.indexOf("]"))).split(':')
              if (item.substring(item.indexOf(']') + 1)) {
                this.song.lyrics.push({
                  time: time[0] * 60 + parseInt(time[1]),
                  text: item.substring(item.indexOf(']') + 1)
                })
              }
            })
          } else {
            this.song.lyrics = false
          }
        })
      } else {
        this.url = ''
        this.song = {}
        this.progress = 0
        this.isplay = false
        this.song.lyrics = false
      }

    },
    add(value) {
      let id = value.ids[0]
      if (value.index !== -1) {
        this.songlist.splice(value.index, 1)
      }
      this.ids = value.ids
      reqSongDetail(id).then(res => {
        const song = res.songs[0]
        this.songlist.unshift(song)
        this.changeMusic(id)
      })
    },
    adds(value) {
      let ids = value.ids.slice(0, value.count).slice(0,200)
      //console.log('新增',ids)
      this.ids = [...ids,...this.ids].slice(0,200)
      reqSongDetail(this.ids.join(',')).then(res => {
        this.songlist = res.songs
        this.changeMusic(ids[0])
      })
    },
    toMinutes(s) {
      let m = parseInt(s/60)
      s = s%60
      if(m<10) {
        m = '0' + m
      }
      if(s<10) {
        s = '0' + s
      }
      return isNaN(m)||isNaN(s) ? '00:00':`${m}:${s}`
    }

  },
  computed: {
    nextId() {
      let num = this.ids.indexOf(this.song.id)
      return num !== -1 && this.ids[num + 1] ? this.ids[num + 1] : this.ids[0]
    }
  },
  created() {
    let storage = JSON.parse(window.localStorage.getItem('musics')) || {}
    storage.state = true
    window.localStorage.setItem('musics', JSON.stringify(storage))
    this.ids = storage.ids || []
    if (this.ids.length) {
      this.ids.splice(200)
      reqSongDetail(this.ids.join(',')).then(res => {
        this.songlist = this.songlist.concat(res.songs)
      })
    }
    window.addEventListener('storage', (e) => {
      if (e.key === 'musics') {
        let echo = JSON.parse(e.newValue)
        echo.state = true
        window.localStorage.setItem('musics', JSON.stringify(echo))
        this[JSON.parse(e.newValue).type]&&this[JSON.parse(e.newValue).type](JSON.parse(e.newValue))
      }
    })
  },
  mounted() {
    this.player = this.$refs.play
    if (this.ids.length) {
      this.changeMusic(this.ids[0])
    }
    window.addEventListener("keydown", ev => {
      if (ev.keyCode === 32) {
        this.isplay = !this.isplay
      }
    })
  },
  watch: {
    immerse() {
      this.lyricShow = false
      setTimeout(() => this.lyricShow = true)
    },
    isplay(value) {
      if (value) {
        if (this.url) {
          this.player.play().then(() => {
          }).catch(() => {
            this.$Message.error('浏览器暂不支持自动播放')
            this.isplay = false
          })
        } else {
          this.$Message.info('暂无歌曲可以播放')
          this.isplay = false
        }
      } else {
        this.player.pause()
      }
    },
    url(value) {
      this.player.src = value
      this.isplay = true
    },
    ids(value) {
      if (value.length >= 200) {
        console.log('我操 ')
        window.localStorage.setItem('musics',JSON.stringify({
          ids: this.ids,
          type: 'normal'
        }))
        this.songlist.splice(200)
      }
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.player-audio
  height 100vh
  overflow hidden
  .songlist-inner
    margin-right 50px

  .my-song-list .row
    padding 10px 20px

  .ivu-slider-wrap
    height 3px
    background #615f5f

    .ivu-slider-button
      border-color #fff

    .ivu-slider-bar
      background #f8f8f8
      height 3px

  .player-footer
    position absolute
    width 100%
    height 110px
    bottom 0
    z-index 10
    padding 0 100px

    .song-info

      margin-bottom 10px

      .song-mate, a
        color #E0E0E0

      .current-time
        color #e0e0e0

        span
          color #959595

    .section-container
      height 100%

      .action-left
        color #fff
        font-size 30px
        width 240px

        div
          cursor pointer
          margin 0 10px

        .play-pause
          line-height: 46px;
          font-size 40px

      .action-right
        margin-left 40px

        .immerse-btn
          color rgba(255, 255, 255, .8)
          width 120px
          height 40px
          border-radius 20px
          border 3px solid rgba(255, 255, 255, .8)
          cursor pointer

          &.on
            p
              transform translateX(-25px)

            .circle
              transform translateX(80px)

          p
            width 80px

          &.on, &:hover
            color #fff
            border-color #fff

            .circle
              background #fff

          .circle
            color #000
            margin-left 2px
            width 30px
            height 30px
            border-radius 50%
            background rgba(255, 255, 255, .8)
            font-size 12px
            text-align center
            line-height 30px
            transition all .1s


        .download
          color #fff
          font-size 30px

          i
            margin 0 10px

        .bit-switch
          margin-left 10px
          color #fff
          width: 88px;
          height: 30px;
          line-height: 30px;
          border-radius: 20px;
          background-color: hsla(0, 0%, 100%, .1);
          text-align: center;
          cursor: pointer;
          font-size: 12px;
          position relative

          & > span
            display block

          .dorp
            position absolute
            bottom 35px
            width 100%

            li
              padding 0 15px

              &:hover
                background-color: hsla(0, 0%, 100%, .1);
                border-radius 25px

            .h, .m,
            display inline-block
              width 29px
              height 17px
              margin-right 5px

            .h
              background url("../../static/imgs/quality.png") no-repeat -35px

            .m
              background url("../../static/imgs/quality.png") no-repeat -70px

            .l
              margin-right 17px

        .control

          width 130px

          .ivu-icon
            font-size 28px
            color #fff
            display block
            width 30px
            margin 0 10px
            line-height 35px

          .p-box
            width 100px

  .player-bg
    position fixed
    top 0
    right 0
    bottom 0
    left 0
    overflow hidden
    z-index -1
    background-color: #000;

    img
      opacity .6
      filter blur(155px)
      width 100%
      height 100%

  .player-header
    height 70px
    padding 0 40px
    position absolute
    top 0
    z-index 10

    .logo
      cursor pointer
      width 180px
      height 100%
      background url("../../static/imgs/topbar.png")

  .player-content
    height 100%
    position absolute
    top 0
    width 100%
    padding 70px 0 110px
    overflow hidden

    .left
      width 200px

    .right
      width 280px
      margin-right 100px
      overflow hidden
      color #999

      &.immerse
        margin 0 auto

      a
        color #999

      .song-cover
        img
          display block
          margin 0 auto
          width 200px
          height 200px

      .song-info
        color #fff
        margin 20px 0

        p
          margin 8px 0

      .nolyric
        margin-top 50%
        height 20px


    .center
      height 100%
      position relative
      flex 1 0 auto

      .music-list
        height 100%

        .row
          color rgba(255, 255, 255, .8)

          a
            color rgba(255, 255, 255, .8)

          &:hover
            background-color: hsla(0, 0%, 100%, .05)

          &.disabled:hover
            background transparent


</style>
