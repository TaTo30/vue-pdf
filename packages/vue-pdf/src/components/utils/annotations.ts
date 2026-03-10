/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-case-declarations */
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { AnnotationEventPayload } from '../types'

interface PopupArgs {
  [key: string]: string
}

const FILE_ATTACHMENT = 'file-attachment'
const FORM_TEXT = 'form-text'
const FORM_SELECT = 'form-select'
const FORM_CHECKBOX = 'form-checkbox'
const FORM_RADIO = 'form-radio'
const FORM_BUTTON = 'form-button'

const EVENTS_TO_HANDLER = ['click', 'dblclick', 'mouseover', 'input', 'change']

function getAnnotationsByKey(key: string, value: any, annotations: Object[]): any[] {
  const result = []
  if (annotations) {
    for (const annotation of annotations) {
      type Key = keyof typeof annotation
      if (annotation[key as Key] === value)
        result.push(annotation)
    }
  }
  return result
}

function buildAnnotationData(type: string, data: any): AnnotationEventPayload {
  return { type, data }
}

function inputAnnotation(inputEl: any, args?: any) {
  switch (inputEl.type) {
    case 'textarea':
    case 'text':
      return buildAnnotationData(FORM_TEXT, {
        fieldName: inputEl.name,
        value: inputEl.value,
      })
    case 'select-one':
    case 'select-multiple':
      const options = []
      for (const opt of inputEl.options) {
        options.push({
          value: opt.value,
          label: opt.label,
        })
      }
      const selected = []
      for (const opt of inputEl.selectedOptions) {
        selected.push({
          value: opt.value,
          label: opt.label,
        })
      }
      return buildAnnotationData(FORM_SELECT, {
        fieldName: inputEl.name,
        value: selected,
        options,
      })
    case 'checkbox':
      return buildAnnotationData(FORM_CHECKBOX, {
        fieldName: inputEl.name,
        checked: inputEl.checked,
      })
    case 'radio':
      return buildAnnotationData(FORM_RADIO, {
        fieldName: inputEl.name,
        ...args,
      })
    case 'button':
      return buildAnnotationData(FORM_BUTTON, {
        fieldName: inputEl.name,
        ...args,
      })
  }
}

function fileAnnotation(annotation: any) {
  return buildAnnotationData(FILE_ATTACHMENT, annotation.file)
}


function mergePopupArgs(annotation: HTMLElement) {
  for (const spanElement of annotation.getElementsByTagName('span')) {
    let content = spanElement.textContent
    const args = JSON.parse(spanElement.dataset.l10nArgs ?? '{}') as PopupArgs
    if (content) {
      for (const key in args)
        content = content.replace(`{{${key}}}`, args[key])
    }
    spanElement.textContent = content
  }
}

// Use this function to handle annotation events
function annotationEventsHandler(evt: Event, PDFDoc: PDFDocumentProxy, Annotations: Object[]) {  
  let annotation = evt.target as HTMLElement

  // annotations are <section> elements if target element are not <section> the parentNode should be
  if (annotation.tagName !== 'SECTION')
    annotation = annotation.parentNode! as HTMLElement


  if (annotation.className.includes('popupAnnotation') || annotation.className.includes('textAnnotation')) {
    mergePopupArgs(annotation)
  }
  else if (annotation.className.includes('fileAttachmentAnnotation')) {
    mergePopupArgs(annotation)
    const id = annotation.dataset.annotationId
    if (id && evt.type === 'dblclick')
      return fileAnnotation(getAnnotationsByKey('id', id, Annotations)[0])
  }
  else if (annotation.className.includes('textWidgetAnnotation') && evt.type === 'input') {
    let inputElement: HTMLInputElement | HTMLTextAreaElement = annotation.getElementsByTagName('input')[0]
    if (!inputElement)
      inputElement = annotation.getElementsByTagName('textarea')[0]
    return inputAnnotation(inputElement)
  }
  else if (annotation.className.includes('choiceWidgetAnnotation') && evt.type === 'input') {
    return inputAnnotation(annotation.getElementsByTagName('select')[0])
  }
  else if (annotation.className.includes('buttonWidgetAnnotation checkBox') && evt.type === 'change') {
    return inputAnnotation(annotation.getElementsByTagName('input')[0])
  }
  else if (annotation.className.includes('buttonWidgetAnnotation radioButton') && evt.type === 'change') {
    const id = annotation.dataset.annotationId
    if (id) {
      const anno = getAnnotationsByKey('id', id, Annotations)[0]
      const radioOptions = []
      for (const radioAnnotations of getAnnotationsByKey('fieldName', anno.fieldName, Annotations)) {
        if (radioAnnotations.buttonValue)
          radioOptions.push(radioAnnotations.buttonValue)
      }
      return inputAnnotation(annotation.getElementsByTagName('input')[0], {
        value: anno.buttonValue,
        defaultValue: anno.fieldValue,
        options: radioOptions,
      })
    }
  }
  else if (annotation.className.includes('buttonWidgetAnnotation pushButton') && evt.type === 'click') {
    const id = annotation.dataset.annotationId
    if (id) {
      const anno = getAnnotationsByKey('id', id, Annotations)[0]
      if (!anno.resetForm) {
        return inputAnnotation(
          { name: anno.fieldName, type: 'button' },
          { actions: anno.actions, reset: false },
        )
      }
      else {
        return inputAnnotation(
          { name: anno.fieldName, type: 'button' },
          { actions: anno.actions, reset: true },
        )
      }
    }
  }
}

export {
  annotationEventsHandler, EVENTS_TO_HANDLER
}
