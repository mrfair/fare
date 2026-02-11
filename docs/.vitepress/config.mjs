import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "th-TH",
  title: "fare",
  base: "/fare/",
  description: "Route-first vanilla SPA toolkit for jQuery/vanilla devs",
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Docs", link: "/README" },
      { text: "Routing", link: "/ROUTING" },
      { text: "Lifecycle", link: "/LIFECYCLE" },
      { text: "Components", link: "/COMPONENTS" },
      { text: "jQuery helpers", link: "/JQUERY" },
      { text: "Deploy", link: "/DEPLOY" },
      { text: "Versioning", link: "/VERSIONING" },
      { text: "GitHub", link: "https://github.com/mrfair/fare" }
    ],
    sidebar: [
      {
        text: "Start",
        items: [
          { text: "Docs Index", link: "/README" },
          { text: "Getting Started", link: "/GETTING_STARTED" }
        ]
      },
      {
        text: "Core",
        items: [
          { text: "Routing", link: "/ROUTING" },
          { text: "Lifecycle", link: "/LIFECYCLE" },
          { text: "Components", link: "/COMPONENTS" },
          { text: "jQuery-like helpers", link: "/JQUERY" }
        ]
      },
      {
        text: "Production",
        items: [
          { text: "Deploy", link: "/DEPLOY" },
          { text: "Versioning", link: "/VERSIONING" },
          { text: "FAQ", link: "/FAQ" }
        ]
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/mrfair/fare" }
    ],
    footer: {
      message: "MIT Licensed",
      copyright: "© fare"
    },
    search: { provider: "local" }
  }
});
