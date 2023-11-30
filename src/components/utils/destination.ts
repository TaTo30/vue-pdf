/**
 * Written by Jason Harwig as part of PDFjs React Outline Viewer
 * Source: https://codesandbox.io/s/rp18w
 */
import type { PDFDocumentProxy, RefProxy } from 'pdfjs-dist/types/src/display/api'
import type { Fit, FitB, FitBH, FitBV, FitH, FitR, FitV, PDFLocation, XYZ } from '../types'

function isRefProxy(obj: unknown): obj is RefProxy {
  return Boolean(typeof obj === 'object' && obj && 'gen' in obj && 'num' in obj)
}

async function getDestinationArray(doc: PDFDocumentProxy,
  dest: string | any[] | null): Promise<any[] | null> {
  return typeof dest === 'string' ? doc.getDestination(dest) : dest
}

// eslint-disable-next-line @typescript-eslint/require-await
async function getDestinationRef(doc: PDFDocumentProxy,
  destArray: any[] | null): Promise<RefProxy | null> {
  if (destArray && isRefProxy(destArray[0]))
    return destArray[0]

  return null
}

const isXYZ = (obj: { type: string; spec: number[] }): obj is XYZ => obj.type === 'XYZ' && obj.spec.length === 3
const isFit = (obj: { type: string; spec: number[] }): obj is Fit => obj.type === 'Fit' && obj.spec.length === 0
const isFitH = (obj: { type: string; spec: number[] }): obj is FitH => obj.type === 'FitH' && obj.spec.length === 1
const isFitV = (obj: { type: string; spec: number[] }): obj is FitV => obj.type === 'FitV' && obj.spec.length === 1
const isFitR = (obj: { type: string; spec: number[] }): obj is FitR => obj.type === 'FitR' && obj.spec.length === 4
const isFitB = (obj: { type: string; spec: number[] }): obj is FitB => obj.type === 'FitB' && obj.spec.length === 0
const isFitBH = (obj: { type: string; spec: number[] }): obj is FitBH => obj.type === 'FitBH' && obj.spec.length === 1
const isFitBV = (obj: { type: string; spec: number[] }): obj is FitBV => obj.type === 'FitBV' && obj.spec.length === 1

function getLocation(type: string, spec: number[]): PDFLocation | null {
  const obj = { type, spec }
  if (isXYZ(obj))
    return obj
  if (isFit(obj))
    return obj
  if (isFitH(obj))
    return obj
  if (isFitV(obj))
    return obj
  if (isFitR(obj))
    return obj
  if (isFitB(obj))
    return obj
  if (isFitBH(obj))
    return obj
  if (isFitBV(obj))
    return obj
  console.warn('no location type found for ', type, spec)

  return null
}

const isSpecLike = (list: any[]): list is number[] => list && list.every(v => !isNaN(v))

export {
  getDestinationArray,
  getDestinationRef,
  getLocation,
  isSpecLike
}

