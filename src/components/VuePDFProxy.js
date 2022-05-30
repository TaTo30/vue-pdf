import { ref } from "vue";

import * as PDFJSlib from "pdfjs-dist/build/pdf";
import PDFJSWorker from "pdfjs-dist/build/pdf.worker.entry";

PDFJSlib.GlobalWorkerOptions.workerSrc = PDFJSWorker;

/**
 * 
 * @param {string | URL | TypedArray | PDFDataRangeTransport | DocumentInitParameters} src
 * Can be a URL where a PDF file is located, a typed array (Uint8Array) already populated with data, or a parameter object.
 * @param {function} onProgress
 * Callback to request a password if a wrong or no password was provided. The callback receives two parameters: a function that should be called with the new password, and a reason (see PasswordResponses). 
 * @param {function} onPassword 
 * Callback to be able to monitor the loading progress of the PDF file (necessary to implement e.g. a loading bar). The callback receives an OnProgressParameters argument.
 * @returns 
 */
export default function VuePDF(src, onProgress, onPassword) {
  const pdf = ref();
  const pages = ref(0);
  const info = ref({})

  const loadingTask = PDFJSlib.getDocument(src)
  loadingTask.onProgress = onProgress
  loadingTask.onPassword = onPassword

  loadingTask.promise.then((doc) => {
    pdf.value = doc.loadingTask;
    pages.value = doc.numPages;
    doc.getMetadata().then(data => {
      info.value = data
    })
  });

  
  return {
    pdf,
    pages,
    info
  };
}
