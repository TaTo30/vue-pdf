/**
 * Written by Jason Harwig as part of PDFjs React Outline Viewer
 * Source: https://codesandbox.io/s/rp18w
 */
import { PDFDocumentProxy, RefProxy } from "pdfjs-dist/types/src/display/api";


type Base<T, S> = {type: T, spec: S}
// These are types from the PDF 1.7 reference manual; Adobe
// Table 151 – Destination syntax
// (Coordinates origin is bottom left of page)
type XYZ = Base<'XYZ', [left: number, top: number, zoom: number]>
type Fit = Base<'Fit', []>
type FitH = Base<'FitH', [top: number]>
type FitV = Base<'FitV', [left: number]>
type FitR = Base<'FitR', [ left: number, bottom: number, right: number, top: number ]>
type FitB = Base<'FitB', []>
type FitBH = Base<'FitBH', [top: number]>
type FitBV = Base<'FitBV', [left: number]>

type PDFLocation = XYZ | Fit | FitH | FitV | FitR | FitB | FitBH | FitBV
export interface PDFDestination {
  pageIndex: number
  location: PDFLocation
}

const isRefProxy = (obj: unknown): obj is RefProxy =>
  Boolean(typeof obj === "object" && obj && "gen" in obj && "num" in obj);

const getDestinationArray = async (
  doc: PDFDocumentProxy,
  dest: string | any[] | null
): Promise<any[] | null> =>
  typeof dest === "string" ? doc.getDestination(dest) : dest;

const getDestinationRef = async (
  doc: PDFDocumentProxy,
  destArray: any[] | null
): Promise<RefProxy | null> => {
  if (destArray && isRefProxy(destArray[0])) {
    return destArray[0];
  }
  return null;
};

const isXYZ = (obj: {type: string, spec: number[]}): obj is XYZ => obj.type === 'XYZ' && obj.spec.length === 3
const isFit = (obj: {type: string, spec: number[]}): obj is Fit => obj.type === 'Fit' && obj.spec.length === 0
const isFitH = (obj: {type: string, spec: number[]}): obj is FitH => obj.type === 'FitH' && obj.spec.length === 1
const isFitV = (obj: {type: string, spec: number[]}): obj is FitV => obj.type === 'FitV' && obj.spec.length === 1
const isFitR = (obj: {type: string, spec: number[]}): obj is FitR => obj.type === 'FitR' && obj.spec.length === 4
const isFitB = (obj: {type: string, spec: number[]}): obj is FitB => obj.type === 'FitB' && obj.spec.length === 0
const isFitBH = (obj: {type: string, spec: number[]}): obj is FitBH => obj.type === 'FitBH' && obj.spec.length === 1
const isFitBV = (obj: {type: string, spec: number[]}): obj is FitBV => obj.type === 'FitBV' && obj.spec.length === 1


const getLocation = (type: string, spec: number[]): PDFLocation | null => {
  const obj = {type, spec}
  if (isXYZ(obj)) return obj
  if (isFit(obj)) return obj
  if (isFitH(obj)) return obj
  if (isFitV(obj)) return obj
  if (isFitR(obj)) return obj
  if (isFitB(obj)) return obj
  if (isFitBH(obj)) return obj
  if (isFitBV(obj)) return obj
  console.warn("no location type found for ", type, spec)

  return null
}

const isSpecLike = (list: any[]): list is number[] => list && list.every(v => !isNaN(v))

export async function getPDFDestination(document: PDFDocumentProxy, destination: string | any[] | null): Promise<PDFDestination | null> {
  const destArray = await getDestinationArray(document, destination)
  const destRef = await getDestinationRef(document, destArray);
  if (!destRef || !destArray) return null;

  const pageIndex = await document.getPageIndex(destRef);
  const name = destArray[1].name
  const rest = destArray.slice(2)
  const location = isSpecLike(rest) ? getLocation(name, rest) : null

  return {pageIndex, location: location ?? {type: 'Fit', spec: []}};
}
