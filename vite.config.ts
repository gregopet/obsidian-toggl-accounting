import { fileURLToPath, URL } from 'url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from 'tailwindcss'
import { resolve } from "path"

// https://vitejs.dev/config/
export default defineConfig( ({mode}) => {
  return {
    plugins: [
      vue({ }),
      tailwindcss() as any,
    ],
    /*resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'vue': 'vue/dist/vue.esm-bundler.js', // https://github.com/fengyuanchen/vue-feather/issues/8
      }
    },*/
    build: {
		sourcemap: mode === 'development' ? 'inline' : false,
		lib: {
			entry: resolve(__dirname, "main.ts"),
			name: "ObsidianTogglAccounting",
			fileName: "main",
			formats: ['cjs'],
		},
		rollupOptions: {
			external: ['obsidian', 'electron', 'codemirror'],
			output: {
				entryFileNames: 'main.js',
				assetFileNames: 'styles.css',
			},
		},
		outDir: '.',
		emptyOutDir: false,
    },
  }
})
