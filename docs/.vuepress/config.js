import { defineUserConfig } from '@vuepress/cli';
import { defaultTheme } from '@vuepress/theme-default';

export default defineUserConfig({
  title: 'VuePDF',
  description: 'PDF Viewer for Vue 3',
  base: '/VuePDF/',
  theme: defaultTheme({
    logo: '/logo.png',
    repo: 'https://github.com/TaTo30/VuePDF',
    colorMode: 'auto',
    docsBranch: 'master',
    docsDir: 'docs',
    navbar: [
      {
        text: 'Guide',
        link: '/guide/'
      },
      {
        text: 'Examples',
        link: '/guide/examples/one_page'
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          children: [
            { text: 'Get started', link: '/guide/README.md' },
            '/guide/props.md',
            '/guide/events.md',
            '/guide/methods.md',
            '/guide/slots.md',
          ],
        },
        {
          text: 'Examples',
          children: [
            {
              text: 'Basic usages',
              children: [
                '/guide/examples/one_page.md',
                '/guide/examples/all_pages.md',
                '/guide/examples/scale.md',
                '/guide/examples/rotation.md',
                '/guide/examples/text_layer.md',
                '/guide/examples/annotation_layer.md',
              ],
            },
            {
              text: 'Advance usages',
              children: [
                '/guide/examples/fit_parent.md',
              ]
            },
            {
              text: 'Events playground',
              children: [
                {
                  text: 'Annotation Events',
                  children: [
                    '/guide/examples/annotation_events/annotation_forms.md',
                    '/guide/examples/annotation_events/annotation_links.md',
                    '/guide/examples/annotation_events/annotation_attachment.md',
                  ]
                },
                '/guide/examples/loaded_events/loaded.md'
              ]
            }
          ],
        },
      ],
    },
  }),
});
