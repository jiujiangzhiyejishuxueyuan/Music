<script setup>
import {ElMessage} from "element-plus";
import {phoneLogin, reqLoginState, reqUserInfo, sendAuth, submitAuth} from "@/api";

let loginType = ref('password')
let sendDisable = ref({is: false, time: 60})
const regPhone = /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/
const loginBody = ref({})
console.log()

function check() {
  for (let key in loginBody.value) {
    if (!loginBody.value[key].length) {
      ElMessage('手机号或密码不能为空.')
      return false
    }
  }
  if (!regPhone.test(loginBody.value.phoneNumber)) {
    ElMessage('手机号格式错误')
    return false
  }
  return true
}

let sendActive = computed(() => {
  return !regPhone.test(loginBody.value.phoneNumber)
})
reqLoginState().then(res => {
  if (res.code === 200) {
    reqUserInfo(res.profile.userId).then(res => {
      userInfo.value = res.profile
      userInfo.value.level = res.level
      window.localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      console.log(userInfo.value, '已是登录状态 --74')
    })
  }
}).catch(err => {
  window.localStorage.removeItem('userInfo')
  err.toString()
  console.log('不是登录状态  --80')
  // this.loginShow = true
})

// 密码登录
function passwordLogin() {
  if (check()) {
    console.log('提交密码登录', loginBody.value.phoneNumber, '--', loginBody.value.password)
    phoneLogin(loginBody.value.phoneNumber, loginBody.value.password).then(res => {
      ElMessage({
        message: '登录成功',
        type: 'success',
      })
      reqLoginState().then(res => {
        if (res.code === 200) {
          reqUserInfo(res.profile.userId).then(res => {
            userInfo.value = res.profile
            userInfo.value.level = res.level
            window.localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
            console.log(userInfo.value, '已是登录状态 --74')
          })
        }
      }).catch(err => {
        window.localStorage.removeItem('userInfo')
        err.toString()
        console.log('不是登录状态  --80')
        // this.loginShow = true
      })
    }).catch(err => {
      ElMessage({
        message: '登录失败',
        type: 'error',
      })
      console.log(err)
    })
  }
}

// 发送验证码
function send() {

  sendDisable.value.is = true
  console.log('验证码手机号为', loginBody.value.phoneNumber)
  sendAuth(loginBody.value.phoneNumber).then(res => {
    ElMessage({
      message: '发送验证码成功',
      type: 'success',
    })
    console.log(res)
  }).catch(err => {
    ElMessage({
      message: '发送验证码失败',
      type: 'error',
    })
    console.log(err)
  })
  // 发送验证码倒计时
  let interval = setInterval(() => {
    sendDisable.value.time--
    if (sendDisable.value.time === 0) {
      clearInterval(interval)
      sendDisable.value.is = false
      sendDisable.value.time = 60
    }
  }, 1000)
}

// 验证码登录
function authLogin() {
  if (check()) {
    console.log('提交验证码', loginBody.value.phoneNumber, '--', loginBody.value.password)
    submitAuth(loginBody.value.phoneNumber, loginBody.value.password).then(res => {
      console.log(res)
      ElMessage({
        message: '登录成功',
        type: 'success',
      })
      reqLoginState().then(res => {
        if (res.code === 200) {
          reqUserInfo(res.profile.userId).then(res => {
            userInfo.value = res.profile
            userInfo.value.level = res.level
            window.localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
            console.log(userInfo.value, '已是登录状态 --74')
          })
        }
      }).catch(err => {
        window.localStorage.removeItem('userInfo')
        err.toString()
        console.log('不是登录状态  --80')
        // this.loginShow = true
      })
    }).catch(err => {
      ElMessage({
        message: '登录失败',
        type: 'error',
      })
      console.log(err)
    })
  }
}

// 写入用户信息
function setUserInfo(info) {
  window.localStorage.setItem('userInfo', JSON.stringify(info))
}
</script>
<template>
  <div class="login flex justify-center align-center">
    <div class="login-inner">
      <el-icon @click="$emit('loginClose')">
        <Close/>
      </el-icon>
      <el-tabs v-model="loginType" class="demo-tabs" @tab-click="loginBody={}">
        <el-tab-pane label="密码登录" name="password" class="inputBoxPassword">
          <el-input v-model="loginBody.phoneNumber" placeholder="请输入手机号" :maxlength="11"/>
          <el-input v-model="loginBody.password" placeholder="请输入密码" class="passwordInput" show-password/>
          <el-button type="primary" round @click="passwordLogin" class="loginbutton loginbutton_password">登录
          </el-button>
        </el-tab-pane>
        <el-tab-pane label="验证码登录" name="authCode">
          <el-input v-model="loginBody.phoneNumber" placeholder="请输入手机号"/>
          <div class="flex">
            <el-input v-model="loginBody.password" placeholder="请输入验证码"/>
            <el-button type="primary" @click="send" class="sendbutton" :disabled="sendActive || sendDisable.is">
              {{ !sendDisable.is ? '发送验证码' : `${sendDisable.time}秒后可重新发送` }}
            </el-button>
          </div>
          <el-button type="primary" round @click="authLogin" class="loginbutton">登录</el-button>
        </el-tab-pane>
        <el-tab-pane label="二维码登陆" name="QRCode">
          er
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<!--<script>-->
<!--    import {checkRegister, phoneLogin} from "@/api";-->

<!--    export default {-->
<!--        name: "login",-->
<!--        data() {-->
<!--            return {-->
<!--                loginBody:{-->
<!--                    phone:'',-->
<!--                    pwd:'',-->
<!--                },-->
<!--            }-->
<!--        },-->
<!--        inject:['reload'],-->
<!--        methods: {-->
<!--            login() {-->
<!--                if(this.check()) {-->
<!--                    checkRegister(this.loginBody.phone).then(res => {-->
<!--                        if(res.exist===1) {-->
<!--                            phoneLogin(this.loginBody.phone,this.loginBody.pwd).then(res=> {-->
<!--                                if(res.code===200) {-->
<!--                                    this.$Message.success('登陆成功')-->
<!--                                    location.reload()-->
<!--                                } else {-->
<!--                                    this.$Message.error(res.message)-->
<!--                                }-->
<!--                            })-->
<!--                        } else {-->
<!--                            this.$Message.error('该手机号暂未注册，请先注册')-->
<!--                        }-->
<!--                    }).catch(() => 0)-->
<!--                }-->
<!--            },-->
<!--            check() {-->
<!--                const regPhone = /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/-->
<!--                const {loginBody} = this-->
<!--                for (let key in loginBody) {-->
<!--                    if(!loginBody[key].length) {-->
<!--                        this.$Message.error('手机号或密码不能为空')-->
<!--                        return false-->
<!--                    }-->
<!--                }-->
<!--                if(!regPhone.test(loginBody.phone))  {-->
<!--                    this.$Message.error('手机号格式错误')-->
<!--                    return false-->
<!--                }-->
<!--                return true-->
<!--            },-->

<!--        },-->

<!--    }-->
<!--</script>-->

<style lang="stylus" rel="stylesheet/stylus" scoped>
.login
  position fixed
  top 0
  left 0
  z-index 1000
  width 100%
  height 100%
  background rgba(0, 0, 0, .4)

  .login-inner
    width 280px
    border-radius 10px
    background #fff
    padding 20px 40px
    position relative

    .inputBoxPassword
      height 172px

    .passwordInput
      margin-top -40px

    .sendbutton
      width 290px
      margin-left 10px

    .loginbutton
      width 100%

    .loginbutton_password
      margin-top -76px

    .form
      margin-bottom 20px

    .el-icon
      position absolute
      top 0
      right 0
      display block
      width 20px
      height 20px
      border-radius 50%
      color #000
      font-size 20px
      cursor pointer

  .title
    padding 20px 0 30px
    font-size 20px
    color #000

  .ivu-input-wrapper
    margin-bottom 10px

  .tip
    text-align left
    color #fa4472
    font-size 12px

  .button
    width 100%
    background #fa4472
    color #fff
    border none
</style>