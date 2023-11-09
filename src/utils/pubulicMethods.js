import format from "date-fns/format";
import {Message} from "view-ui-plus";

export default {
    playMusic(ids) {
        if (ids) {
            let musics = JSON.parse(window.localStorage.getItem('musics')) || {}
            let echoTime = 100
            musics = musics.ids || []
            if (typeof ids === 'object') {
                musics = [...ids, ...musics]
                musics.forEach(item => {
                    let lastIndex = musics.lastIndexOf(item)
                    if (musics.indexOf(item) !== lastIndex) {
                        musics.splice(lastIndex, 1)
                    }
                })
                musics = {
                    ids: musics,
                    type: 'adds',
                    count: ids.length
                }
                echoTime = 1000
            } else {
                let index = musics.indexOf(ids)
                if (index !== -1) {
                    musics.splice(index, 1)
                }
                musics.unshift(ids)
                musics = {
                    ids: musics,
                    type: 'add',
                    index
                }
                echoTime = 100
            }
            window.localStorage.setItem('musics', JSON.stringify(musics))
            setTimeout(() => {
                let state = JSON.parse(window.localStorage.getItem('musics')).state
                console.log('咋了')
                if (state) {
                    Message.success('添加到播放器成功')
                } else {
                    window.open('/music/player')
                }
            }, echoTime)
        }
    },
    onShow(el,callback) {
        el = typeof el === 'string' ? document.querySelector(el) : el
        let observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                callback()
                observer.unobserve(el)
            }
        })
        observer.observe(el)
    },
    dataFormat (value,t = 1) {
        return t === 1 ? format(value, 'yyyy/MM/dd HH:mm') : format(value, 'yyyy/MM/dd')
    },
    playCount(count) {
        if (count > 100000000) {
            count = parseInt(count / 100000000) + '亿'
        } else if (count >= 10000) {
            count = (count / 10000).toFixed(1) + '万'
        }
        return count
    },
    sminute(s) {
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
}