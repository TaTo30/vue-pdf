import { defineUserConfig } from '@vuepress/cli';
import { defaultTheme } from '@vuepress/theme-default';
import { searchPlugin } from '@vuepress/plugin-search'

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
        text: 'Docs',
        link: '/guide/introduction.md'
      },
      {
        text: 'Examples',
        children: [
          {
            text: 'Basic usages',
            link: '/examples/basic/one_page.md'
          },
          {
            text: 'Advanced usages',
            link: '/examples/advanced/fit_parent.md'
          },
          {
            text: 'Events',
            link: '/examples/loaded_events/loaded.md'
          },
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          children: [
            '/guide/introduction.md',
            '/guide/composables.md',
          ],
        },
        {
          text: 'VuePDF Component',
          children: [
            '/guide/props.md',
            '/guide/events.md',
            '/guide/methods.md',
            '/guide/slots.md',
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Basic usages',
          children: [
            '/examples/basic/one_page.md',
            '/examples/basic/all_pages.md',
            '/examples/basic/scale.md',
            '/examples/basic/rotation.md',
            '/examples/basic/text_layer.md',
            '/examples/basic/annotation_layer.md',
            '/examples/basic/xfa_layer.md',
          ],
        },
        {
          text: 'Advanced usages',
          children: [
            '/examples/advanced/watermark.md',
            '/examples/advanced/fit_parent.md',
            '/examples/advanced/annotation_filter.md',
            '/examples/advanced/multiple_pdf.md',
          ]
        },
        {
          text: 'Events',
          children: [
            '/examples/loaded_events/loaded.md',
            {
              text: 'Annotation Events',
              children: [
                '/examples/annotation_events/annotation_forms.md',
                '/examples/annotation_events/annotation_links.md',
                '/examples/annotation_events/annotation_attachment.md',
              ]
            }
          ]
        }
      ],
    },
  }),
  plugins: [
    searchPlugin({
      locales: {
        '/': {
          placeholder: 'Search',
        }
      },
    })
  ]
});
