import path from 'path';

import {vitePlugin as remix} from '@remix-run/dev';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    oxygen(),
    hydrogen(),
    remix({
      presets: [hydrogen.preset()],
      ignoredRouteFiles: ['**/.*'],
      future: {
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_singleFetch: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    watch: {
      usePolling: false,
      interval: 0,
      binaryInterval: 0,
      awaitWriteFinish: false,
    },
    hmr: {
      overlay: true,
      timeout: 5000,
    },
  },
  ssr: {
    optimizeDeps: {
      include: [
        'hex-to-rgba',
        '@pack/types',
        '@remix-run/dev/server-build',
        'cookie',
        'fast-deep-equal',
        'fast-xml-parser',
        'lodash/debounce',
        'lodash/kebabCase',
        'lodash/snakeCase',
        'lodash/startCase',
        'snakecase-keys',
        'uuid',
        'react-markdown',
        'remark-gfm',
        'remark-breaks',
      ],
    },
  },
  optimizeDeps: {
    include: [
      '@headlessui/react',
      '@pack/react',
      '@shopify/hydrogen-react',
      'react-intersection-observer',
      'swiper/modules',
      'swiper/react',
    ],
  },
  build: {
    assetsInlineLimit: 0,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
    },
  },
});
