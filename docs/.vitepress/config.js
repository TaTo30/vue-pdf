import { version } from '../package.json'

export default {
  title: 'VuePDF',
  description: 'PDF Viewer for Vue 3',
  base: '/VuePDF/',
  lastUpdated: true,
  themeConfig: {
    logo: '/logo.png',
    editLink: {
      pattern: 'https://github.com/TaTo30/VuePDF/edit/master/docs/:path',
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/TaTo30/VuePDF',
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
            link: '/examples/advanced/fit_parent.md',
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
            link: 'https://github.com/TaTo30/VuePDF/releases',
          },
          {
            text: 'Contributing',
            link: 'https://github.com/TaTo30/VuePDF#contributing',
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
                text: 'TOC',
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
