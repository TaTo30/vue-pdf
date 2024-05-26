import { version } from '../package.json'

export default {
  vite: {
    optimizeDeps: {
      esbuildOptions: {
        supported: {
          'top-level-await': true,
        },
      },
    },
    build: {
      target: 'esnext',
    },
  },
  title: 'VuePDF',
  description: 'PDF component for Vue 3',
  base: '/vue-pdf/',
  lastUpdated: true,
  head: [['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }]],
  themeConfig: {
    logo: '/logo.png',
    editLink: {
      pattern: 'https://github.com/TaTo30/vue-pdf/edit/master/docs/:path',
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/TaTo30/vue-pdf',
      },
    ],
    search: {
      provider: 'local',
    },
    nav: [
      {
        text: 'Guide',
        link: '/guide/introduction.md',
      },
      {
        text: 'Examples',
        items: [
          {
            text: 'Basic usages',
            link: '/examples/basic/one_page.md',
          },
          {
            text: 'Advanced usages',
            link: '/examples/advanced/watermark.md',
          },
          {
            text: 'Events',
            link: '/examples/loaded_events/loaded.md',
          },
        ],
      },
      {
        text: `v${version}`,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/TaTo30/vue-pdf/releases',
          },
          {
            text: 'Contributing',
            link: 'https://github.com/TaTo30/vue-pdf#contributing',
          },
        ],
      },
    ],
    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          {
            text: 'Guide',
            items: [
              {
                text: 'Introduction',
                link: 'introduction',
              },
              {
                text: 'Composables',
                link: 'composables',
              },
            ],
          },
          {
            text: 'Reference',
            items: [
              {
                text: 'Props',
                link: 'props',
              },
              {
                text: 'Events',
                link: 'events',
              },
              {
                text: 'Methods',
                link: 'methods',
              },
              {
                text: 'Slots',
                link: 'slots',
              },
            ],
          },
        ],
      },
      '/examples/': {
        items: [
          {
            text: 'Basic usages',
            base: '/examples/basic/',
            items: [
              {
                text: 'One Page',
                link: 'one_page',
              },
              {
                text: 'All Pages',
                link: 'all_pages',
              },
              {
                text: 'Scale',
                link: 'scale',
              },
              {
                text: 'Rotation',
                link: 'rotation',
              },
              {
                text: 'Text Layer',
                link: 'text_layer',
              },
              {
                text: 'Annotation Layer',
                link: 'annotation_layer',
              },
              {
                text: 'XFA Layer',
                link: 'xfa_layer',
              },
            ],
          },
          {
            text: 'Advanced usages',
            base: '/examples/advanced/',
            items: [
              {
                text: 'Watermark',
                link: 'watermark',
              },
              {
                text: 'Fit Parent',
                link: 'fit_parent',
              },
              {
                text: 'Highlight Text',
                link: 'highlight_text',
              },
              {
                text: 'Annotation Filter',
                link: 'annotation_filter',
              },
              {
                text: 'Multiple PDF',
                link: 'multiple_pdf',
              },
              {
                text: 'Table of Content',
                link: 'toc',
              },
            ],
          },
          {
            text: 'Events',
            base: '/examples/',
            items: [
              {
                text: 'Loaded Event',
                link: '/loaded_events/loaded',
              },
              {
                text: 'Text Loaded Event',
                link: '/loaded_events/text_loaded',
              },
              {
                text: 'Annotation Loaded Event',
                link: '/loaded_events/annotation_loaded',
              },
              {
                text: 'XFA Loaded Event',
                link: '/loaded_events/xfa_loaded',
              },
              {
                text: 'Highlight Event',
                link: '/text_events/text_highlight',
              },
              {
                text: 'Annotation Events',
                base: '/examples/annotation_events/',
                items: [
                  {
                    text: 'Form fields',
                    link: 'annotation_forms',
                  },
                  {
                    text: 'Links',
                    link: 'annotation_links',
                  },
                  {
                    text: 'Attachment',
                    link: 'annotation_attachment',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
}
