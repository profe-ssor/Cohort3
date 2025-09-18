declare module 'pdfjs-dist/build/pdf' {
  export * from 'pdfjs-dist/types/src/display/api';
  export * from 'pdfjs-dist/types/src/display/worker_options';
  export const version: string;
}

declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  const worker: string;
  export default worker;
}
