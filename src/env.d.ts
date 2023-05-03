declare module "*?worker" {
  const workerConstructor: {
    new(): Worker
  };
  export default workerConstructor;
}

declare module "*?url" {
  const url: string;
  export default url;
}

declare module "*?worker&url" {
  const workerUrl: string;
  export default workerUrl;
}

declare module "pdfjs-dist/build/pdf" {
  export * from 'pdfjs-dist'
}
