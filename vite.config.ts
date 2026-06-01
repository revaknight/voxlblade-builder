import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  base:'/voxlblade-builder/',

  plugins: [
    svelte(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets:['favicon.ico'],

      manifest: {
        name:'voxlblade builder',
        short_name:'voxlbuilder',

        start_url:'/voxlblade-builder/',

        display:'standalone',

        background_color:'#ffffff',
        theme_color:'#ffffff',
      },

      workbox: {
        globPatterns:['**/*.{js,css,html,ico,png,svg}'],

        skipWaiting:true,
        clientsClaim:true,

        runtimeCaching:[
          {
            urlPattern:({request})=>request.mode==='navigate',
            handler:'StaleWhileRevalidate',

            options:{
              cacheName:'html-cache'
            }
          }
        ]
      }
    }),
  ],

  build:{
    rollupOptions:{
      output:{
        manualChunks:undefined
      }
    }
  }

})