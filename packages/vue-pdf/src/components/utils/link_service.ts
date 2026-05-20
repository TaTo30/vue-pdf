import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { EventBus } from "pdfjs-dist/types/web/event_utils";
import type { PDFLinkService } from "pdfjs-dist/types/web/pdf_link_service";

const LINK = "link";
const INTERNAL_LINK = "internal-link";

/* eslint-disable @typescript-eslint/no-unused-vars */
class LinkService implements PDFLinkService {
  targets = ["_blank", "_self", "_parent", "_top"];
  externalLinkEnabled: boolean;
  externalLinkTarget: number;
  externalLinkRel: string;
  #pdfDocument: PDFDocumentProxy | null = null;
  #eventEmitter: any = null;
  eventBus: EventBus = null as any;
  baseUrl: any;
  _ignoreDestinationZoom: boolean = false;
  pdfDocument: any;
  pdfHistory: any;
  pdfViewer: any;

  constructor(eventEmitter: any) {
    this.externalLinkEnabled = true;
    this.externalLinkTarget = this.targets.indexOf("_blank");
    this.externalLinkRel = "noopener noreferrer";
    this.#eventEmitter = eventEmitter;
  }

  setHistory(pdfHistory: any): void {
    this.pdfHistory = pdfHistory;
  }

  setViewer(pdfViewer: any): void {
    this.pdfViewer = pdfViewer;
  }

  setDocument(pdfDocument: PDFDocumentProxy) {
    this.#pdfDocument = pdfDocument;
  }

  setRootEmit(rootEmit: any) {
    this.#eventEmitter = rootEmit;
  }

  get pagesCount() {
    return this.#pdfDocument?.numPages || 0;
  }

  get page() {
    return 0;
  }

  set page(_value: number) {}

  set rotation(_value: number) {}

  get rotation() {
    return 0;
  }

  get isInPresentationMode() {
    return false;
  }

  /**
   * @param {string|Array} dest - The named, or explicit, PDF destination.
   */
  async goToDestination(dest: string | Array<any>) {
    if (!this.#pdfDocument) {
      return;
    }

    let explicitDest, pageNumber;
    if (typeof dest === "string") {
      explicitDest = await this.#pdfDocument.getDestination(dest);
    } else {
      explicitDest = await dest;
    }
    if (!Array.isArray(explicitDest)) {
      console.error(
        `goToDestination: "${explicitDest}" is not a valid destination array, for dest="${dest}".`,
      );
      return;
    }
    // Dest array looks like that: <page-ref> </XYZ|/FitXXX> <args..>
    const [destRef] = explicitDest;

    if (destRef && typeof destRef === "object") {
      pageNumber = this.#pdfDocument.cachedPageNumber(destRef);

      if (!pageNumber) {
        // Fetch the page reference if it's not yet available. This could
        // only occur during loading, before all pages have been resolved.
        try {
          pageNumber = (await this.#pdfDocument.getPageIndex(destRef)) + 1;
        } catch {
          console.error(
            `goToDestination: "${destRef}" is not a valid page reference, for dest="${dest}".`,
          );
          return;
        }
      }
    } else if (Number.isInteger(destRef)) {
      pageNumber = destRef + 1;
    }
    if (!pageNumber || pageNumber < 1 || pageNumber > this.pagesCount) {
      console.error(
        `goToDestination: "${pageNumber}" is not a valid page number, for dest="${dest}".`,
      );
      return;
    }

    const offset = { left: 0, bottom: 0 };

    switch (explicitDest[1].name) {
      case "XYZ":
      case "FitR":
        offset.left = explicitDest[2];
        offset.bottom = explicitDest[3];
        break;
      case "FitV":
      case "FitBV":
        offset.left = explicitDest[2];
        break;
      case "FitH":
      case "FitBH":
        offset.bottom = explicitDest[2];

        if (
          offset.bottom === null ||
          typeof offset.bottom !== "number" ||
          offset.bottom < 0
        ) {
          offset.bottom = 0;
        }
        break;
    }

    this.#eventEmitter("annotation", {
      type: INTERNAL_LINK,
      data: {
        referencedPage: pageNumber,
        offset,
      },
    });
  }

  addLinkAttributes(link: HTMLAnchorElement, url: string, newWindow = false) {
    if (!this.externalLinkEnabled) return;

    const baseHref =
      typeof window !== "undefined" && window.location
        ? window.location.href
        : "about:blank";

    let safeUrl: URL;
    try {
      safeUrl = new URL(url, baseHref);
    } catch {
      return;
    }

    const protocol = safeUrl.protocol.toLowerCase();
    const allowed =
      protocol === "http:" ||
      protocol === "https:" ||
      protocol === "mailto:" ||
      protocol === "tel:";
    if (!allowed) return;

    link.href = safeUrl.toString();

    if (newWindow) {
      link.target = "_blank";
    } else if (this.externalLinkTarget !== -1) {
      link.target = this.targets[this.externalLinkTarget];
    } else {
      link.removeAttribute("target");
    }

    const rel = this.externalLinkRel;
    link.rel = rel.includes("noopener") ? rel : `noopener ${rel}`.trim();

    link.addEventListener("click", (evt) => {
      this.#eventEmitter("annotation", {
        type: LINK,
        data: {
          url: safeUrl,
          unsafeUrl: url,
        },
      });
    });
  }

  getDestinationHash(_dest: any): string {
    return "#";
  }

  getAnchorUrl(_hash: any): string {
    return "#";
  }

  setExternalLinkTarget(target: string) {
    this.externalLinkTarget = this.targets.indexOf(target);
  }

  setExternalLinkRel(rel: string) {
    this.externalLinkRel = rel;
  }

  setExternalLinkEnabled(enabled: boolean) {
    this.externalLinkEnabled = enabled;
  }

  setHash(_hash: string) {}
  executeNamedAction(_action: string) {}
  executeSetOCGState(_action: object): Promise<void> {
    return new Promise(() => {});
  }
  cachePageRef(_pageNum: number, _pageRef: object) {}
  goToPage(_val: number | string) {}
  goToXY(pageNumber: number, x: number, y: number): void {}
}

export { LinkService };
