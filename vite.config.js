import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      // 第三方组件库的解析器
      resolvers: [
        ElementPlusResolver(),

        // Auto import icon components
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
    }),
    Icons({
      compiler: 'vue3' ,
      autoInstall: true,
    }),
    Components({
      // dirs 指定组件所在位置，默认为 src/components
      // 可以让我们使用自己定义组件的时候免去 import 的麻烦
      dirs: ['src/components/'],
      // 配置需要将哪些后缀类型的文件进行自动按需引入
      extensions: ['vue', 'md'],
      // 解析的 UI 组件库，这里以 Element Plus 和 Ant Design Vue 为例
      resolvers: [ElementPlusResolver(),AntDesignVueResolver(),IconsResolver({
        enabledCollections: ['ep'],
      })],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions:['.vue','.js']
  },
  server: {
    disableHostCheck: true,
    port: 5173,
    https: false,
    //以上的ip和端口是我们本机的;下面为需要跨域的
    proxy: {//配置跨域
      '/api': {
        target: 'http://localhost:3000',//后台接口
        ws: true, //websocket支持
        changOrigin: true,//控制请求头中的host值
        rewrite:(path) => path.replace(/^\/api/, "")
      }
    }
  },

})
