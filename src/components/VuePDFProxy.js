import { ref } from "vue";

import * as PDFJSlib from "pdfjs-dist/build/pdf";
import PDFJSWorker from "pdfjs-dist/build/pdf.worker.entry";

PDFJSlib.GlobalWorkerOptions.workerSrc = PDFJSWorker;

export default function VuePDF(data) {
  const pdf = ref();
  const pages = ref(0);

  PDFJSlib.getDocument(data).promise.then((doc) => {
    pdf.value = doc.loadingTask;
    pages.value = doc.numPages;
  });
  
  return {
    pdf,
    pages,
  };
}
