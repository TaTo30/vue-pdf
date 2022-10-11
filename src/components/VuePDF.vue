<template>
 <span style="position: relative; display: block">
    <canvas ref="CanvasREF" style="display: inline-block"></canvas>
    <div ref="AnnotationlayerRef" class="annotationLayer" style="display: block;" v-show="annotationLayer"></div>
    <div ref="TextlayerREF" class="textLayer" style="display: block;" v-show="textLayer"></div>
 </span>
</template>

<script>
import * as PDFJSLib from "pdfjs-dist/build/pdf"
import * as PDFJSViewer from "pdfjs-dist/web/pdf_viewer"
import { SimpleLinkService } from "pdfjs-dist/web/pdf_viewer"
import "pdfjs-dist/web/pdf_viewer.css"

import { watch, ref, onMounted } from 'vue'

const INTERNAL_LINK = "internal-link"
const LINK = "link"
const FILE_ATTACHMENT = "file-attachment"
const FORM_TEXT = "form-text"
const FORM_SELECT = "form-select"
const FORM_CHECKBOX = "form-checkbox"
const FORM_RADIO = "form-radio"

const EVENTS_TO_HANDLER = ['click', 'dblclick', 'mouseover', 'input', 'change']

export default {
  name: 'VuePDF',
  emits: [ 
    'annotation',
    'loaded'
  ],
  props: {
    pdf: {
      required: true
    },
    page: {
      type: Number,
      default: 1
    },
    scale: {
      type: Number,
      default: 1
    },
    rotation: Number,
    "text-layer": Boolean,
    "annotation-layer": Boolean
  },
  setup(props, context){
    // Template elements
    const CanvasREF = ref({})
    const TextlayerREF = ref({})
    const AnnotationlayerRef = ref({})

    // PDF objects
    var PDFDoc = null
    var TextLayerLoaded = false
    var AnnotationLayerLoaded = false
    var Annotations = []

    // Use this function to handle annotation events
    const annotationEventsHandler = (evt) => {
      var annotation = evt.target.parentNode;

      // annotations are <section> elements if div returned find in child nodes the section element
      // TODO this part recursive in future
      if (annotation.tagName === 'DIV'){
        annotation = annotation.firstChild
      }

      // For linkAnnotation events get only click events
      if (annotation.className === 'linkAnnotation' && evt.type === 'click') {
        const id = annotation.dataset['annotationId']
        if (id) linkAnnotationEvent(getAnnotationsByKey('id', id)[0])
      // For popups annotations 
      } else if (annotation.className === 'popupAnnotation' || annotation.className === 'textAnnotation' || annotation.className === 'fileAttachmentAnnotation'){
        for (const spanElement of annotation.getElementsByTagName("span")) {
          var content = spanElement.textContent
          var args = JSON.parse(spanElement.dataset['l10nArgs'])
          for (const key in args) 
              content = content.replace(`{{${key}}}`, args[key])
          spanElement.textContent = content
        }
        if (annotation.className === 'fileAttachmentAnnotation' && evt.type === 'dblclick'){
          const id = annotation.dataset['annotationId']
          if (id) fileAttachmentAnnotationEvent(getAnnotationsByKey('id', id)[0])
        }
      // TextFields and TextAreas
      } else if (annotation.className === 'textWidgetAnnotation' && evt.type === 'input') {
        let inputElement = annotation.getElementsByTagName("input")[0]
        if (!inputElement) inputElement = annotation.getElementsByTagName("textarea")[0]
        inputAnnotationEvent(inputElement)
      
      } else if (annotation.className === 'choiceWidgetAnnotation' && evt.type === 'input') {
        inputAnnotationEvent(annotation.getElementsByTagName("select")[0])
      } else if (annotation.className === 'buttonWidgetAnnotation checkBox' && evt.type === 'change') {
        inputAnnotationEvent(annotation.getElementsByTagName("input")[0])
      } else if (annotation.className === 'buttonWidgetAnnotation radioButton' && evt.type === 'change') {
        const id = annotation.dataset['annotationId']
        if (id){
          const anno = getAnnotationsByKey('id', id)[0]
          const radioOptions = []
          for (const radioAnnotations of getAnnotationsByKey('fieldName', anno.fieldName)) 
            if (radioAnnotations.buttonValue) radioOptions.push(radioAnnotations.buttonValue)
          inputAnnotationEvent(annotation.getElementsByTagName("input")[0], {
            value: anno.buttonValue,
            defaultValue: anno.fieldValue,
            options: radioOptions
          })
        }
      }
      // Another Annotations manage here
    }

    const inputAnnotationEvent = (inputEl, args) => {
      switch (inputEl.type) {
        case "textarea":
        case "text":
          annotationEvent(FORM_TEXT, {
            fieldName: inputEl.name,
            value: inputEl.value
          })
          break;
        case "select-one":
        case "select-multiple":
          const options = []
          for (const opt of inputEl.options) {
            options.push({
              value: opt.value,
              label: opt.label
            })
          }
          const selected = []
          for (const opt of inputEl.selectedOptions) {
            selected.push({
              value: opt.value,
              label: opt.label
            })
          }
          annotationEvent(FORM_SELECT, {
            fieldName: inputEl.name,
            value: selected,
            options: options
          })
          break;
        case "checkbox":
          annotationEvent(FORM_CHECKBOX, {
            fieldName: inputEl.name,
            checked: inputEl.checked
          })
          break;
        case "radio":
          annotationEvent(FORM_RADIO, {
            fieldName: inputEl.name,
            ...args,
          })
          break;
        default:
          break;
      }
    }

    const fileAttachmentAnnotationEvent = (annotation) => 
      annotationEvent(FILE_ATTACHMENT, annotation.file)
    

    const linkAnnotationEvent = (annotation) => {
      if (annotation.dest){
        // Get referenced page number of internal link
        PDFDoc.getPageIndex(annotation.dest[0]).then(pageIndex => {
          const eventInfo = {
            referencedPage: pageIndex + 1,
            offset: {
              left: annotation.dest[2],
              bottom: annotation.dest[3]
            }
          }
          annotationEvent(INTERNAL_LINK, eventInfo)
        })
      }else if (annotation.url){
        const eventInfo = {
          url: annotation.url,
          unsafeUrl: annotation.unsafeUrl
        }
        annotationEvent(LINK, eventInfo)
      }
    }

    const annotationEvent = (type, data) => {
      context.emit("annotation", {type: type, data: data})
    }

    const getAnnotationsByKey = (key, value) => {
      const result = []
      for (const annotation of Annotations) 
        if (annotation[key] === value) result.push(annotation)
      return result
    }

    const renderPage = (pageNum) => {
      PDFDoc.getPage(pageNum).then(page => {
        const viewportParams = {
          scale: props.scale
        }

        // Send rotation params only if is a valid number
        if (typeof props.rotation === "number" && props.rotation % 90 === 0)
          viewportParams['rotation'] = props.rotation
        
        var viewport = page.getViewport(viewportParams);
        var ctx = CanvasREF.value.getContext('2d')

        CanvasREF.value.width = viewport.width;
        CanvasREF.value.height = viewport.height;
        CanvasREF.value.style.width = viewport.width+ 'px';
        CanvasREF.value.style.height = viewport.height+ 'px';

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        page.render(renderContext).promise.then(() => {
          // Load text layer if prop is true
          if (props.textLayer) {
            page.getTextContent().then(textContent => {
              TextlayerREF.value.style.left = CanvasREF.value.offsetLeft + 'px';
              TextlayerREF.value.style.top = CanvasREF.value.offsetTop + 'px';
              TextlayerREF.value.style.height = CanvasREF.value.offsetHeight + 'px';
              TextlayerREF.value.style.width = CanvasREF.value.offsetWidth + 'px';

              // Render text using TextLayerBuilder from pdfjs viewer
              const TextLayerBuilder = new PDFJSViewer.TextLayerBuilder({
                textLayerDiv: TextlayerREF.value, 
                pageIndex: page._pageIndex,
                eventBus: new PDFJSViewer.EventBus(),
                viewport: viewport,
                enhanceTextSelection: false
              })
              TextLayerBuilder.setTextContent(textContent)
              TextLayerBuilder.render();
              TextLayerLoaded = true
            })
          }

          // Load annotaion layer if prop is true
          if (props.annotationLayer) {
            page.getAnnotations().then(annotations => {
              AnnotationlayerRef.value.style.left = CanvasREF.value.offsetLeft + 'px';
              AnnotationlayerRef.value.style.top = CanvasREF.value.offsetTop + 'px';
              AnnotationlayerRef.value.style.height = CanvasREF.value.offsetHeight + 'px';
              AnnotationlayerRef.value.style.width = CanvasREF.value.offsetWidth + 'px';
              
              PDFJSLib.AnnotationLayer.render({
                annotations: annotations,
                viewport: viewport.clone({ dontFlip: true}),
                page: page,
                linkService: new SimpleLinkService(), // no pdfviewer features needed, send void LinkService
                div: AnnotationlayerRef.value
              })
              Annotations = annotations
              AnnotationLayerLoaded = true

              // Add event listeners to manage some events of annotations layer items
              for (const evtHandler of EVENTS_TO_HANDLER) 
                AnnotationlayerRef.value.addEventListener(evtHandler, annotationEventsHandler)
            })
          }
          context.emit('loaded', viewport)
        })
      })
    }

    const clearLayers = () => {
      // Clear all childnodes of layer elements
      TextlayerREF.value.replaceChildren?.()
      AnnotationlayerRef.value.replaceChildren?.()
      // Clear event listeners of annotation layer 
      for (const evtHandler of EVENTS_TO_HANDLER) 
        AnnotationlayerRef.value.removeEventListener?.(evtHandler, annotationEventsHandler)
    }

    const initDoc = (proxy) => {
      proxy.promise.then(doc => {
        PDFDoc = doc
        renderPage(props.page)
      })
    }

    watch(() => props.pdf, (pdf) => {
      // for any change in pdf proxy, rework all
      if (pdf !== undefined) {
        clearLayers()
        initDoc(pdf)
      }
    })

    watch(() => props.textLayer, (textLayer) => {
      if (textLayer) {
        // If text-layer has no been loaded before, rework the render task
        if (!TextLayerLoaded) {
          renderPage(props.page)
        }
      }
    })

    watch(() => props.annotationLayer, (annotationLayer) => {
      if (annotationLayer){
        // If annotation-layer has no been loaded before, rework the render task
        if(!AnnotationLayerLoaded){
          renderPage(props.page)
        }
      }
    })

    watch(() => props.scale, (_) => {
      // When scale change rework render task
      clearLayers()
      renderPage(props.page)
    })

    watch(() => props.rotation, (_) => {
      // When rotation change rework render task
      clearLayers()
      renderPage(props.page)
    })

    watch(() => props.page, (page) => {
      // When page change rework render task
      clearLayers()
      renderPage(page)
    })

    onMounted(() => {
      if (props.pdf !== undefined) {
        initDoc(props.pdf)
      }
    })

    return {
      CanvasREF,
      TextlayerREF,
      AnnotationlayerRef
    }
  }


};
</script>

<style>
.annotationLayer {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
}

/* Make annotation sections available over text layer */
.annotationLayer section {
  z-index: 1;
}
</style>
