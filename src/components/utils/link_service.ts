import type { IPDFLinkService } from 'pdfjs-dist/types/web/interfaces'

class SimpleLinkService implements IPDFLinkService {
  externalLinkEnabled: boolean

  constructor() {
    this.externalLinkEnabled = true
  }

  /**
     * @type {number}
     */
  get pagesCount() {
    return 0
  }

  /**
     * @type {number}
     */
  get page() {
    return 0
  }

  /**
     * @param {number} _value
     */
  set page(_value: number) {}

  /**
     * @type {number}
     */
  get rotation() {
    return 0
  }

  /**
     * @param {number} _value
     */
  set rotation(_value: number) {}

  /**
     * @type {boolean}
     */
  get isInPresentationMode() {
    return false
  }

  /**
     * @param {string|Array} _dest - The named, or explicit, PDF destination.
     */
  async goToDestination(_dest: string | Array<any>) {}

  /**
     * @param {number|string} _val - The page number, or page label.
     */
  goToPage(_val: number | string) {}

  /**
     * @param {HTMLAnchorElement} link
     * @param {string} url
     * @param {boolean} [_newWindow]
     */
  addLinkAttributes(link: HTMLAnchorElement, url: string, _newWindow = false) { }

  /**
     * @param _dest - The PDF destination object.
     * @returns {string} The hyperlink to the PDF object.
     */
  getDestinationHash(_dest: any): string {
    return '#'
  }

  /**
     * @param _hash - The PDF parameters/hash.
     * @returns {string} The hyperlink to the PDF object.
     */
  getAnchorUrl(_hash: any): string {
    return '#'
  }

  /**
     * @param {string} _hash
     */
  setHash(_hash: string) {}

  /**
     * @param {string} _action
     */
  executeNamedAction(_action: string) {}

  /**
     * @param {Object} _action
     */
  executeSetOCGState(_action: object) {}

  /**
     * @param {number} _pageNum - page number.
     * @param {Object} _pageRef - reference to the page.
     */
  cachePageRef(_pageNum: number, _pageRef: object) {}
}

export { SimpleLinkService }
