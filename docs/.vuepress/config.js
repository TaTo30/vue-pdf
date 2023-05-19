// TODO: Fix relative route for gh-pages, remove "edit-page"

import { defineUserConfig } from "@vuepress/cli";
import { defaultTheme } from "@vuepress/theme-default";

export default defineUserConfig({
  title: "VuePDF",
  description: "PDF Viewer for Vue 3",
  base: "/VuePDF/",
  theme: defaultTheme({
    logo: "/logo.png",
    repo: "https://github.com/TaTo30/VuePDF",
    colorMode: "auto",
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
      "/guide/": [
        {
          text: "Guide",
          children: [
            { text: "Get started", link: "/guide/README.md" },
            "/guide/props.md",
            "/guide/events.md",
            "/guide/methods.md",
            "/guide/slots.md",
          ],
        },
        {
          text: "Examples",
          children: [
            {
              text: "Basic usage",
              children: [
                "/guide/examples/one_page.md",
                "/guide/examples/all_pages.md",
                "/guide/examples/scale.md",
                "/guide/examples/rotation.md",
                "/guide/examples/text_layer.md",
                "/guide/examples/annotation_layer.md",
              ],
            },
          ],
        },
      ],
    },
  }),
});
