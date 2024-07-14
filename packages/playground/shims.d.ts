declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.pdf' {
  const pdfurl: string
  export default pdfurl
}
