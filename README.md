# 网易云音乐web端，之前项目太久没动已废弃
#### 本地运行此项目前请先运行api 并在vue.config.js中填入地址
### 技术栈
- MVVM框架：Vue.js (2.x)
- 前端路由：Vue Router
- 数据获取：axios
- 构建工具：webpack
- css预编译：stylus

### 已实现功能
- 每日推荐
- 排行榜
- 歌手列表
- 歌手详情
- 歌单列表
- 歌单详情
- 歌曲详情
- 专辑详情
- 视频列表
- 用户详情
- 音乐播放器
- 视频播放、mv播放
- 搜索音乐、歌单、用户、视频、mv、专辑、歌词、电台
- 用户动态

### 组件列表
- album-list：专辑列表组件
- comment-edit: 评论框组件
- comment-list: 评论列表组件
- fix-btn：固定按钮组件
- login：登录框组件
- mv-list：mv列表组件
- mv-rank-list：mv排行榜组件
- my-footer：全局底部组件
- my-header：全局头部组件
- play-list： 歌单列表组件
- playlist-control： 歌单控制组件
- singer-list：歌手列表组件
- song-control：歌曲控制组件
- song-list：歌曲列表组件
- user-card：作者卡片组件
- user-list： 用户列表组件
- v-player：视频播放器组件
- video-control：视频互动组件
- video-list： 视频列表组件
- video-related： 相关视频列表组件
- lyric：歌词组件
- dynamic-list: 动态列表组件
- xxx-ske：骨架屏组件
## 依赖安装
```
npm install
```

### 项目加载
```
npm run dev
```

### 项目打包
```
npm run build
```