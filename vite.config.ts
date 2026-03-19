/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill process.env for libraries that rely on it
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.PUBLIC_URL': JSON.stringify(''),
  },
  resolve: {
    alias: {
      // mui-datatables still imports from @material-ui/* internally.
      // The styles shim re-exports @mui/material/styles + makeStyles/withStyles from @mui/styles.
      '@material-ui/core/styles': path.resolve(__dirname, 'src/shims/material-ui-styles.ts'),
      '@material-ui/core': '@mui/material',
      '@material-ui/icons': '@mui/icons-material',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
