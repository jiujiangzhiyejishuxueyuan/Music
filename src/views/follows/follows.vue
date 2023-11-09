<template>
    <div id="follows" class="container my-card">
      <div class="section-header">
        <div class="section-header-title">
          关注({{ user && user.follows }})
        </div>
      </div>
      <view v-if="follows.length">
        <user-list :users="follows"/>
        <Page
            :total="user&&user.follows"
            :page-size="20"
            @on-change="(page) => $router.replace(`/user/follows?id=${id}&page=${page}`)"
            :current="parseInt($route.query.page)||1"
            v-if="user&&user.follows>20"
        />
      </view>
      <p class="none" v-else>关注列表为空</p>

    </div>
</template>

<script>
    import {reqUserFollows} from "@/api";
    import userList from '@/components/user-list/user-list'
    export default {
        props: {
            user:Object
        },
        components: {
            userList
        },
        data() {
            return {
                id: '',
                follows: [],
            }
        },
        watch: {
            $route() {
                this.render()
            }
        },
        methods: {
            render() {
                this.id = this.$route.query.id
                let page = this.$route.query.page || 1
                let limit = 20
                let offset = (page-1) * limit
                reqUserFollows(this.id,limit,offset).then(res => {
                  if (res.code === 400) {
                    this.$Message.error(res.message)

                  } else {
                    this.follows = res.follow
                  }
                })
            }
        },
        created() {
            this.render()
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
#follows
  .none
    padding 100px
    text-align center
</style>
