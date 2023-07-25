import * as PDFJS from 'pdfjs-dist'
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min?url'
import { shallowRef } from 'vue'

import type { PDFDocumentLoadingTask } from 'pdfjs-dist'
import type { DocumentInitParameters, PDFDataRangeTransport, TypedArray } from 'pdfjs-dist/types/src/display/api'
import type { OnPasswordCallback, UsePDFInfo, UsePDFOptions } from './types'

// Could not find a way to make this work with vite, importing the worker entry bundle the whole worker to the the final output
// https://erindoyle.dev/using-pdfjs-with-vite/
// PDFJS.GlobalWorkerOptions.workerSrc = PDFWorker
function configWorker(wokerSrc: string) {
  PDFJS.GlobalWorkerOptions.workerSrc = wokerSrc
}

/**
 * @typedef {Object} UsePDFParameters
 * @property {string} password
 * Document password to unlock content
 * @property {function} onProgress
 * Callback to request a password if a wrong or no password was provided. The callback receives two parameters: a function that should be called with the new password, and a reason (see PasswordResponses).
 * @property {function} onPassword
 * Callback to be able to monitor the loading progress of the PDF file (necessary to implement e.g. a loading bar). The callback receives an OnProgressParameters argument. if this function is used option.password is ignored
 * @property {function} onError
 * Callback to be able to handle errors during loading
 * */

/**
 *
 * @param {string | URL | TypedArray | PDFDataRangeTransport | DocumentInitParameters} src
 * Can be a URL where a PDF file is located, a typed array (Uint8Array) already populated with data, or a parameter object.
 * @param {UsePDFParameters} options
 * UsePDF object parameters
 */
export function usePDF(src: string | URL | TypedArray | PDFDataRangeTransport | DocumentInitParameters, options: UsePDFOptions = {
  onProgress: undefined,
  onPassword: undefined,
  onError: undefined,
  password: '',
}) {
  if (!PDFJS.GlobalWorkerOptions?.workerSrc)
    configWorker(PDFWorker)

  const pdf = shallowRef<PDFDocumentLoadingTask>()
  const pages = shallowRef(0)
  const info = shallowRef<UsePDFInfo | {}>({})

  const loadingTask = PDFJS.getDocument(src)
  if (options.onProgress)
    loadingTask.onProgress = options.onProgress

  if (options.onPassword) {
    loadingTask.onPassword = options.onPassword
  }
  else if (options.password) {
    const onPassword: OnPasswordCallback = (updatePassword, _) => {
      updatePassword(options.password ?? '')
    }
    loadingTask.onPassword = onPassword
  }

  loadingTask.promise.then(async (doc) => {
    pdf.value = doc.loadingTask
    pages.value = doc.numPages

    const metadata = await doc.getMetadata()
    const attachments = (await doc.getAttachments()) as Record<string, unknown>
    const javascript = await doc.getJavaScript()

    info.value = {
      metadata,
      attachments,
      javascript,
    }
  }, (error) => {
    // PDF loading error
    if (typeof options.onError === 'function')
      options.onError(error)
  })

  return {
    pdf,
    pages,
    info,
  }
}
