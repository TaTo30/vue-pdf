# Props

## pdf

Type: `PDFDocumentLoadingTask` <br/>
Required: `true`

The PDFDocumentLoadingTask obtained from usePDF

```vue
<VuePDF :pdf="pdf" />
```

## page

Type: `int` <br/>
Required: `false` <br />
Default: `1`

Page to render, this prop must be a page number starting at 1

```vue
<VuePDF :pdf="pdf" :page="1" />
```

## scale

Type: `int` <br />
Required: `false` <br />
Default: `1`

Page scale

```vue
<VuePDF :pdf="pdf" :scale="0.5" />
```

## fit-parent

Type: `boolean` <br /> 
Required: `false` <br />
Default: `false`

Fit page with parent width, this prop replace `scale` in width calculation

```vue
<VuePDF :pdf="pdf" fit-parent />
```

## rotation

Type: `int` <br />
Required: `false` <br />
Default: `Document Default`

Rotate the page in 90° multiples eg. (`90`, `180`, `270`)

```vue
<VuePDF :pdf="pdf" :rotation="90" />
```

## text-layer

Type: `boolean` <br />
Required: `false` <br />
Default: `false`

Enable text selection in page

```vue
<VuePDF :pdf="pdf" text-layer />
```

## annotation-layer

Type: `boolean` <br />
Required: `false` <br />
Default: `false`

Enable document annotations like links, popups, widgets, etc.

```vue
<VuePDF :pdf="pdf" annotation-layer />
```

## image-resources-path

Type: `string` <br />
Required: `false` <br />
Default: `null` <br />

Path to image resources needed to render some graphics when required.

```vue
<VuePDF :pdf="pdf" image-resources-path="https://unpkg.com/pdfjs-dist@latest/web/images/" />
```

## hide-forms

Type: `boolean` <br />
Required: `false` <br />
Default: `false` <br />

Hide AcroForms from annotation-layer.

```vue
<VuePDF :pdf="pdf" annotation-layer hide-forms />
```

## annotations-filter

Type: `array` <br />
Required: `false` <br />
Default: `null`

Allows to choose which annotations display on page, the following options are available:

*  `Link`
*  `Text`
*  `Stamp`
*  `Popup`
*  `FreeText`
*  `Line`
*  `Square`
*  `Circle`
*  `PolyLine`
*  `Caret`
*  `Ink`
*  `Polygon`
*  `Highlight`
*  `Underline`
*  `Squiggly`
*  `StrikeOut`
*  `FileAttachment`
*  `Widget`
    *  `Widget.Tx`
    *  `Widget.Btn`
    *  `Widget.Ch`
    *  `Widget.Sig`

> NOTE: `Widget` shows all `Widget` subtypes like `Widget.Tx`, `Widget.Btn`, etc.


```vue
<script setup>
const filter = ref(['Link', 'Text', 'Widget'])
</script>

<VuePDF :pdf="pdf" annotation-layer :annotations-filter="filter" />
```

## annotations-map

Type: `function` <br />
Required: `false` <br />
Default: `null` <br />

Allows to map annotations, useful for edit annotations data before rendering, also can be used as a filter by returning null in map function.

```vue
<script setup>
function annotationMap(annotation) {
  if (annotation.id === 'ID1') {
    annotation.fieldValue = 'Modified value'
    return annotation // return a modified annotation
  }
  else if (annotations.id === 'ID2') {
    return null // return null to discard the annotation
  }
  else {
    return annotation // return annotation as is
  }
}
</script>

<VuePDF :pdf="pdf" annotation-layer :annotations-map="annotationMap" />
```

> NOTE: `annotations-filter` has more precedence than `annotations-map`, so if both used, annotations will be first filter and then mapped.