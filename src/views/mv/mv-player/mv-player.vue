<template>
  <div class="mv-player">
    <div class="mv-player-header container flex align-center" v-if="mv">
      <i class="mv"></i>
      <span class="name">{{ mv.name }}</span>
      <ul class="artists ellipse flex">
        <li class="art" v-for="(art,index) in mv.artists" :key="index">
          <a :href="`/music/artist/${art.id}`" target="_blank">
            {{ art.name }}
          </a>
          <i v-if="index<mv.artists.length-1">/ </i>
        </li>
      </ul>
    </div>
    <div class="mv-player-header-ske container flex align-end" v-else>
      <div class="name ske-ani"></div>
      <div class="art ske-ani"></div>
    </div>
    <div class="mv-player-content container flex">
      <div class="left">
        <div class="player" :class="{'player-ske':!vReady}">
          <div class="background-blur">
            <img :src="mv.cover" alt="">
          </div>
          <v-player :url="url" @ready="vReady = true"/>
        </div>
        <div class="video-control flex">
          <div class="praised" :class="{active:count.liked}" @click="jump('like')">
            <Icon type="md-thumbs-up"/>
            {{ count.likedCount | playCount }}
          </div>
          <div class="subscribe" :class="{active:mv.subed}" @click="jump('sub')">
            <Icon type="md-star"/>
            {{ mv.subCount | playCount }}
          </div>
          <div class="share" @click="jump('share')">
            <Icon type="ios-share-alt"/>
            {{ mv.shareCount | playCount }}
          </div>
        </div>
        <div class="comment" ref="comment">
          <div class="comment-count">
            {{ comment.total }} 评论
          </div>
          <div class="comment-header flex" ref="comment">
            <a class="sort" :class="{active:ishot}" @click="ishot = true"
               v-if="c.length">最热评论</a>
            <a class="sort" :class="{active:!ishot}" @click="ishot = false">最新评论</a>
          </div>
          <comment-edit :id="id.toString()" type="1" class="input"/>
          <comment-list
              :id="id.toString()"
              type="1"
              :comments="ishot&&c.length ? c : comment.comments"
              v-if="comment.total>0"
          />
          <Page
              class="comment"
              :total="comment.total"
              :page-size="commentLimit"
              @on-change="nextComment"
              v-if="comment&&!ishot&&comment.total>20"
          />
          <div class="text-center" v-else>没有更多评论了~`</div>
        </div>
      </div>
      <div class="right">
        <div class="title">MV介绍</div>
        <div class="info">
          <div class="time flex justify-between">
                        <span class="publish-time">
                            发布时间: {{ mv.publishTime }}
                        </span>
            <span class="play-count">
                            播放次数: {{ mv.playCount |playCount }}
                        </span>
          </div>
          <div class="desc text-wrap">
            简介: {{ mv.desc || '无' }}
          </div>
        </div>
        <div class="title">相关推荐</div>
        <video-related :videos="relateMvs"/>
      </div>
    </div>
  </div>
</template>

<script>
import {
  reqLoginState,
  reqMvComments,
  reqMvDetail,
  reqMvInfo,
  reqMvUrl,
  reqRelatedVideo, reqVideoList,
  resourceLike,
  subMv
} from "@/api";
import VPlayer from "@/components/v-player/v-player";
import VideoRelated from '@/components/video-related/video-related'
import CommentEdit from "@/components/comment-edit/comment-edit";
import commentList from '@/components/comment-list/comment-list'

export default {
  components: {CommentEdit, VPlayer, VideoRelated, commentList},
  data() {
    return {
      mv: '',
      subed: false,
      url: '',
      count: '',
      id: 0,
      relateMvs: [],
      comment: '',
      ishot: false,
      commentLimit: 20,
      c: [],
      vReady: false,
      userInfo: ''
    }
  },
  methods: {
    jump(e, params = []) {
      if (this.userInfo) {
        this[e](...params)
      } else {
        this.$Message.info('请先登录')
      }
    },
    share() {
      this.mv.shareCount++
      this.$Message.success('分享成功!')
    },
    nextComment(page) {
      let offset = this.commentLimit * (page - 1)
      reqMvComments(this.id, this.commentLimit, offset).then(res => {
        this.comment = res
        window.scrollTo(0, (this.$refs.comment.getBoundingClientRect().top + window.scrollY))
      })
    },
    like() {
      if (!this.count.liked) {
        resourceLike({id: this.id, type: 1, t: 1}).then(res => {
          if (res.code === 200) {
            this.count.liked = true
            this.count.likedCount++
          } else {
            this.$Message.info('操作失败')
          }
        })
      } else {
        resourceLike({id: this.id, type: 1, t: 0}).then(res => {
          if (res.code === 200) {
            this.count.liked = false
            this.count.likedCount--
          } else {
            this.$Message.info('操作失败')
          }
        })
      }
    },
    sub() {
      if (!this.mv.subed) {
        subMv(this.id, 1).then(res => {
          if (res.code === 200) {
            this.mv.subed = true
            this.mv.subCount++
            this.$Message.success('收藏成功')
          } else {
            this.$Message.info('操作失败')
          }
        }).catch(() => {
          this.$Message.info('操作失败')
        })
      } else {
        subMv(this.id, 0).then(res => {
          if (res.code === 200) {
            this.mv.subed = false
            this.mv.subCount--
            this.$Message.success('取消收藏成功')
          } else {
            this.$Message.info('操作失败')
          }
        }).catch(() => {
          this.$Message.info('操作失败')
        })
      }
    }
  },
  created() {
    let id = this.$route.params.id
    this.id = id
    let userInfo = JSON.parse(window.localStorage.getItem('userInfo')) || ''
    if (userInfo) {
      this.userInfo = userInfo
    }
    reqMvDetail(id).then(res => {
      this.subed = res.subed
      this.mv = res.data
      document.title = res.data.name + ' - mv - 网易云音乐'
    })
    reqMvUrl(id).then(res => {
      this.url = res.data.url
    })
    reqMvInfo(id).then(res => {
      this.count = res
    })
    // reqRelatedVideo(id).then(res => {
    //   this.relateMvs = res.data
    //   console.log(res)
    //   reqRelatedVideo(res.data[1].vid).then(res => {
    //     this.relateMvs = [...this.relateMvs, ...res.data]
    //     reqRelatedVideo(res.data[1].vid).then(res => {
    //       this.relateMvs = [...this.relateMvs, ...res.data]
    //     })
    //   })
    // })
    reqVideoList(58100).then(res => {
      res.datas.forEach(item => {
        if (!item.data.creator.length) {
          item.data.creator = [item.data.creator]
        }
        this.relateMvs.push(item.data)
      })
    })
    reqMvComments(id, this.commentLimit, 0).then(res => {
      if (res.hotComments && res.hotComments.length) {
        this.c = res.hotComments
        this.ishot = true
      }
      this.comment = res
    })
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
$blue = #00a1d6
$blueh = #00b5e5
.mv-player
  .mv-player-content
    margin-top 10px
    overflow hidden

    .right
      margin-left 10px
      width 340px
      text-align left
      @media screen and (max-width: 1200px)
        width 280px
        .time
          font-size 12px !important

      #video-related
        margin-top 20px

      .info
        padding 0 5px 50px

      .desc
        width 100%

      .time
        padding 10px 0
        font-size 14px
        color #999

      .title
        padding 5px 0
        width 100%
        border-bottom 1px solid #e5e9f0
        font-size 20px

    .left
      color #222
      width 1050px
      text-align left

      a:hover
        color $blue
      @media screen and (max-width: 1550px)
        max-width 850px
      @media screen and (max-width: 1200px)
        max-width 710px

      .desc
        padding 10px 0

      .comment-count
        margin 20px 0
        font-size 18px

      .video-control
        padding 10px 0
        border-bottom 1px solid #e5e9f0

        div
          cursor pointer
          padding-right 30px

          &:hover, &.active
            color $blue

            i
              color $blue

        i
          color #757575
          font-size 35px

  .mv-player-header-ske
    margin-top 20px

    .name
      width 25%
      height 36px

    .art
      margin-left 20px
      width 10%
      height 16px

  .mv-player-header
    margin-top 20px
    text-align left

    .mv
      display block
      width 30px
      height 18px
      background url("../../../static/imgs/icon.png") -270px -478px no-repeat

    .artists
      color #999
      margin-top 10px
      margin-left 20px

      .art:hover
        color $blue

    .name
      margin-left 10px
      font-size 24px
</style>
