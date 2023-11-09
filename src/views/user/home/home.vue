<script setup>
import {useRoute, useRouter} from 'vue-router'
import {reqUserRecord,reqUserInfo,reqUserPlaylist} from "@/api";
import recordList from '@/views/user/record-list/record-list.vue'
const route = useRoute()
const router = useRouter()
const record = ref([])
const recordDom = ref()
let id = ref(0)
let recordType = ref('week')
let createdPlaylist = ref([])
let subPlaylist = ref([])
let user = ref({peopleCanSeeMyPlayRecord:true})
let recordMore = ref(false)
render()
function render() {
  id.value = parseInt(route.query.id)
  subPlaylist.value = []
  createdPlaylist.value = []
  reqUserInfo(id.value).then(res => {
    user.value = res
  })
  // console.log('获取用户听歌记录',reqUserRecord)

  reqUserRecord(id.value).then(res => {
    record.value = res.weekData
    console.log('获取用户听歌记录',record.value)
  }).catch(err => err.toString())
  // console.log('获取用户听歌记录',record.value)

  reqUserPlaylist(id.value).then(res => {
    res.playlist.forEach(item => {
      item.creator.userId === id.value ? createdPlaylist.value.push(item) : subPlaylist.value.push(item)
    })
  })
}
function cutRecordMore() {
  if (recordMore.value) {
    window.scrollTo(0, (recordDom.value.getBoundingClientRect().top + window.scrollY))
  }
  recordMore.value = !recordMore.value
}
watch(() =>route.query,()=> {
  render()
})
// 切换听歌记录时间
watch(recordType,(value)=> {
  record.value = []
  if (value === 'week') {
    reqUserRecord(id.value,1).then(res => {
      record.value = res.weekData
    })
  } else if (value === 'all') {
    console.log('all')
    reqUserRecord(id.value, 0).then(res => {
      record.value = res.allData
    })
  }
})
let propRecord = computed(() => {
  // console.log('computed',record.value)
  return recordMore.value?record.value:record.value.slice(0,10)
})
</script>

<template>
  <div class="user-home">
<!--    听歌排行-->
    <div class="record container my-card"  v-if="user.peopleCanSeeMyPlayRecord">
      <div class="record-header section-header" ref="recordDom" >
                <span class="section-header-title">
                    听歌排行
                    <span class="total">累计听歌{{ user.listenSongs }}首</span>
                </span>
        <div class="control">
          <span class="item" @click="recordType='week'" :class="{disabled: recordType!=='week'}">最近一周 </span>|
          <span class="item " @click="recordType='all'" :class="{disabled: recordType!=='all'}"> 所有时间</span>
        </div>
      </div>
      <record-list :songs="propRecord"/>
      <div class="record-footer">
        <a class="text-hv" @click="cutRecordMore">{{ recordMore ? '收起' : '查看更多' }}</a>
      </div>
    </div>
    <div class="my-playlist container my-card">
      <div class="section-header">
                <span class="section-header-title">
                    {{ user.profile && user.profile.nickname }}创建的歌单
                    ({{ createdPlaylist.length }})
                </span>
      </div>
      <play-list :playlists="createdPlaylist"/>
    </div>
    <div class="sub-playlist container my-card" v-if="subPlaylist.length">
      <div class="section-header">
                <span class="section-header-title">
                    {{ user.profile && user.profile.nickname }}收藏的歌单
                    ({{ subPlaylist.length }})
                </span>
      </div>
      <play-list :playlists="subPlaylist"/>
    </div>
  </div>
</template>

<style lang="stylus" rel="stylesheet/stylus">
.sub-playlist
  margin-top 20px
.record
  padding 20px 20px 10px 20px

</style>
