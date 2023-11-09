<template>
  <div id="comment-list" v-if="!loading">
    <ul class="comment-list" v-if="comments.length">
      <li class="comment-item  flex" v-for="(comment,index) in comments" :key="index">
        <div class="user-face img-box">
          <a :href="`/user/home?id=${comment.user.userId}`" target="_blank">
            <img :src="comment.user.avatarUrl+'?param=50y50'" alt="comment.user.nickname"
                 :title="comment.user.nickname">
          </a>
        </div>
        <div class="comment-inner bb">
          <a :href="`/user/home?id=${comment.user.userId}`" target="_blank" class="user-name"
             :title="comment.user.nickname">{{ comment.user.nickname }}</a>
          <p class="text">{{ comment.content }}</p>
          <div class="reply" v-if="comment.beReplied && comment.beReplied.length">
            <a target="_blank" :href="`/user/home?id=${comment.beReplied[0].user.userId}`" class="user-name">
              @{{ comment.beReplied[0].user.nickname }}
            </a>
            :
            <span class="text">{{ comment.beReplied[0].content }}</span>
          </div>
          <span class="time">{{ methods.dataFormat(comment.time) }}</span>
          <span class="like" @click="jump('giveLike',[comment])"  :class="{active:comment.liked}">
            <Icon type="md-thumbs-up"/>
            <span class="count">{{ comment.likedCount }}</span>
          </span>
          <span class="send-btn"
                @click="sendCommentId = sendCommentId===comment.commentId ? '' :comment.commentId">回复</span>
          <span class="comment-delete" v-if="comment.user.userId===userInfo.userId"
                @click="jump('commentDelete',[comment.commentId,index])">删除</span>
          <comment-edit reply v-if="sendCommentId===comment.commentId" @submit="(value)=>jump('sendComment',[value])"/>
        </div>
      </li>
    </ul>
    <div class="no-comment text-center" v-else>
      暂无评论
    </div>
  </div>
  <ul class="comment-list comment-list-ske" v-else>
    <li class="comment-item flex" v-for="index in 8" :key="index">
      <div class="user-face ske-ani"></div>
      <div class="comment-inner">
        <div class="name ske-ani"></div>
        <div class="text ske-ani"></div>
        <div class="foot ske-ani"></div>
      </div>
    </li>
  </ul>
</template>

<script>
import {giveCommentLike, submitComment} from "@/api";
import commentEdit from '@/components/comment-edit/comment-edit'

export default {
  props: {
    comments: Array,
    id: String,
    type: String,
    loading: Boolean
  },
  components: {
    commentEdit
  },
  data() {
    return {
      sendCommentId: '',
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
    giveLike(comment) {
      if (!comment.liked) {
        giveCommentLike(this.id, comment.commentId, this.type, 1).then(res => {
          if (res.code === 200) {
            comment.liked = true
            comment.likedCount++
          }
        })
      } else {
        giveCommentLike(this.id, comment.commentId, this.type, 0).then(res => {
          if (res.code === 200) {
            comment.liked = false
            comment.likedCount--
          }
        })
      }
    },
    sendComment(value) {
      submitComment(this.id, this.type, value, 2, this.sendCommentId).then(res => {
        if (res.code === 200) {
          this.$Message.success('发送评论成功')
        }
        this.sendCommentId = ''
      }).catch(() => {
        this.$Message.error('发送评论失败')
      })
    },
    commentDelete(id, index) {
      submitComment(this.id, this.type, '', 0, id).then(res => {
        this.comments.splice(index, 1)
      })
    },
  },
  created() {
    let userInfo = JSON.parse(window.localStorage.getItem('userInfo')) || ''
    if (userInfo) {
      this.userInfo = userInfo
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
$blue = #00a1d6
$blueh = #00b5e5
.no-comment
  margin 20px 0

.comment-list
  text-align left


  &.comment-list-ske
    ske(height, width)
      height height
      width width
      margin-bottom 10px

    .name
      ske(18px, 120px)

    .text
      ske(25px, 100%)

    .foot
      ske(15px, 50%)

  .comment-edit
    margin-top 20px

  .bb
    border-bottom 1px solid #e5e9f0

  .comment-item
    width 100%

    .user-face
      flex-shrink 0
      width 50px
      height 50px
      border-radius 50%
      overflow hidden

    .comment-inner
      width 90%
      margin 5px 0 20px 25px
      padding-bottom 20px

      .reply
        font-size 12px
        padding 8px 10px
        width 100%
        background #F1F1F4

        .user-name
          color $blue

          &:hover
            color $blueh

      p
        margin-bottom 0

      .user-name
        font-size 12px
        color #6d757a
        font-weight 600

        &:hover
          color $blue

      .text
        color rgba(0, 0, 0, .65)
        margin 10px 0

      .time
        font-size 12px
        color #99a2aa

      .like
        margin-left 10px
        cursor pointer

        &:hover,&.active
          color $blue

        .ivu-icon
          transform translateY(-2px)
      .send-btn, .comment-delete
        font-size 12px
        color #99a2aa
        margin-left 30px
        padding 4px 5px
        cursor pointer

        &:hover
          border-radius 5px
          background #e5e9ef
          color $blue

</style>
