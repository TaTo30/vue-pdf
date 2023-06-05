import type { PageViewport } from 'pdfjs-dist'
import type { OnProgressParameters } from 'pdfjs-dist/types/src/display/api'
import type { Metadata } from 'pdfjs-dist/types/src/display/metadata'

export type LoadedEventPayload = PageViewport

export interface AnnotationEventPayload {
  type: string
  data: any
}

export type OnProgressCallback = (progressData: OnProgressParameters) => void
export type UpdatePasswordFn = (newPassword: string) => void
export type OnPasswordCallback = (updatePassword: UpdatePasswordFn, reason: any) => void
export type OnErrorCallback = (error: any) => void

export interface UsePDFOptions {
  onProgress?: OnProgressCallback
  onPassword?: OnPasswordCallback
  onError?: OnErrorCallback
  password?: string
}

export interface UsePDFInfoMetadata {
  info: Object
  metadata: Metadata
}

export interface UsePDFInfo {
  metadata: UsePDFInfoMetadata
  attachments: Record<string, unknown>
  javascript: string[] | null
}
