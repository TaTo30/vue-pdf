import * as PDFJS from 'pdfjs-dist'
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min?url'
import { isRef, shallowRef, watch } from 'vue'

import type { PDFDocumentLoadingTask } from 'pdfjs-dist'
import type { Ref } from 'vue'
import type { OnPasswordCallback, PDFDestination, PDFInfo, PDFOptions, PDFSrc } from './types'
import { getDestinationArray, getDestinationRef, getLocation, isSpecLike } from './utils/destination'

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
export function usePDF(src: PDFSrc | Ref<PDFSrc>,
  options: PDFOptions = {
    onProgress: undefined,
    onPassword: undefined,
    onError: undefined,
    password: '',
  },
) {
  if (!PDFJS.GlobalWorkerOptions?.workerSrc)
    configWorker(PDFWorker)

  const pdf = shallowRef<PDFDocumentLoadingTask>()
  const pages = shallowRef(0)
  const info = shallowRef<PDFInfo | {}>({})

  function processLoadingTask(source: PDFSrc) {
    const loadingTask = PDFJS.getDocument(source!)
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

    loadingTask.promise.then(
      async (doc) => {
        pdf.value = doc.loadingTask
        pages.value = doc.numPages

        const metadata = await doc.getMetadata()
        const attachments = (await doc.getAttachments()) as Record<string, unknown>
        const javascript = await doc.getJavaScript()
        const outline = await doc.getOutline()

        info.value = {
          metadata,
          attachments,
          javascript,
          outline,
        }
      },
      (error) => {
        // PDF loading error
        if (typeof options.onError === 'function')
          options.onError(error)
      },
    )
  }

  async function getPDFDestination(destination: string | any[] | null): Promise<PDFDestination | null> {
    const document = await pdf.value?.promise
    if (!document)
      return null

    const destArray = await getDestinationArray(document, destination)
    const destRef = await getDestinationRef(document, destArray)
    if (!destRef || !destArray)
      return null

    const pageIndex = await document.getPageIndex(destRef)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const name = destArray[1].name
    const rest = destArray.slice(2)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const location = isSpecLike(rest) ? getLocation(name, rest) : null

    return { pageIndex, location: location ?? { type: 'Fit', spec: [] } }
  }

  if (isRef(src)) {
    if (src.value)
      processLoadingTask(src.value)
    watch(src, () => {
      if (src.value)
        processLoadingTask(src.value)
    })
  }
  else {
    if (src)
      processLoadingTask(src)
  }

  return {
    pdf,
    pages,
    info,
    getPDFDestination,
  }
}
