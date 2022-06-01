<template>
 <span style="position: relative; display: block">
    <canvas ref="CanvasREF" style="display: inline-block"></canvas>
    <div ref="AnnotationlayerRef" class="annotationLayer" style="display: inline-block;" v-show="annotationLayer"></div>
    <div ref="TextlayerREF" class="textLayer" style="display: inline-block;" v-show="textLayer"></div>
 </span>
</template>

<script>
import * as PDFJSLib from "pdfjs-dist/build/pdf";
import { SimpleLinkService } from "pdfjs-dist/web/pdf_viewer";
import "pdfjs-dist/web/pdf_viewer.css"

import { watch, ref, onMounted } from 'vue'

const INTERNAL_LINK = "internal-link"
const LINK = "link"

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
      // Do this part recursive in future
      if (annotation.tagName === 'DIV'){
        annotation = annotation.firstChild
      }

      // For linkAnnotation events get only click events
      if (annotation.className === 'linkAnnotation' && evt.type === 'click') {
        var id = annotation.dataset['annotationId']
        if (id) linkAnnotationEvent(getAnnotationByID(id, Annotations))

      // For popupAnnotation events only manage text parsing of popup element
      } else if (annotation.className === 'popupAnnotation'){
        for (const spanElement of annotation.getElementsByTagName("span")) {
          var content = spanElement.textContent
          var args = JSON.parse(spanElement.dataset['l10nArgs'])
          for (const key in args) 
              content = content.replace(`{{${key}}}`, args[key])
          spanElement.textContent = content
        }
      }

      // Another Annotations manage here
    }

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
      context.emit("annotation", {type: type, info: data})
    }

    const getAnnotationByID = (id, annotations) => {
      for (const annotation of annotations) 
        if (annotation.id === id) return annotation
    }

    const renderPage = (pageNum) => {
      PDFDoc.getPage(pageNum).then(page => {
        var viewport = page.getViewport({ scale: props.scale });
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

              PDFJSLib.renderTextLayer({
                textContent: textContent,
                container: TextlayerREF.value,
                viewport: viewport,
                textDivs: [],
                enhanceTextSelection: true
              });
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
              AnnotationlayerRef.value.addEventListener('click', annotationEventsHandler)
              AnnotationlayerRef.value.addEventListener('mouseover', annotationEventsHandler)
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
      AnnotationlayerRef.value.removeEventListener?.('click', annotationEventsHandler)
      AnnotationlayerRef.value.removeEventListener?.('mouseover', annotationEventsHandler)
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
