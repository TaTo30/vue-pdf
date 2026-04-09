import type { IPDFLinkService } from 'pdfjs-dist/types/web/interfaces'

class SimpleLinkService implements IPDFLinkService {
  externalLinkEnabled: boolean

  externalLinkTarget: string
  externalLinkRel: string


  constructor(externalLinkEnabled: boolean = true) {
    this.externalLinkEnabled = externalLinkEnabled

    this.externalLinkTarget = ""
    this.externalLinkRel = "noopener noreferrer"
  }

  setExternalLinkTarget(target: string) {
    this.externalLinkTarget = target
  }

  setExternalLinkRel(rel: string) {
    this.externalLinkRel = rel
  }

   goToXY(pageNumber: number, x: number, y: number): void {}

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
  addLinkAttributes(link: HTMLAnchorElement, url: string, newWindow = false) {
    if (!this.externalLinkEnabled) return;

    const baseHref = 
      typeof window !== "undefined" && window.location
        ? window.location.href
        : "about:blank"

    let safeUrl: URL
    try {
      safeUrl = new URL(url, baseHref)
    } catch {
      return
    }

    const protocol = safeUrl.protocol.toLowerCase()
    const allowed = 
      protocol === "http:" || 
      protocol === "https:" ||
      protocol === "mailto:" ||
      protocol === "tel:"
    if (!allowed) return

    link.href = safeUrl.toString()

    if (newWindow) {
      link.target = "_blank"
    } else if (this.externalLinkTarget) {
      link.target = this.externalLinkTarget
    } else {
      link.removeAttribute("target")
    }

    const rel = this.externalLinkRel || "noopener noreferrer"
    link.rel = rel.includes("noopener") ? rel : `noopener ${rel}`.trim()
  }
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
