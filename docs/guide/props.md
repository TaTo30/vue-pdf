# Props

## **pdf**

Type: `PDFDocumentLoadingTask` <br/>
Required: `true`

The PDFDocumentLoadingTask obtained from usePDF

```vue
<VuePDF :pdf="pdf" />
```

## **page**

Type: `int` <br/>
Required: `false` <br />
Default: `1`

Page to render, this prop must be a page number starting at 1

```vue
<VuePDF :pdf="pdf" :page="1" />
```

## **scale**

Type: `int` <br />
Required: `false` <br />
Default: `1`

Page scale

```vue
<VuePDF :pdf="pdf" :scale="0.5" />
```

## **fit-parent**

Type: `boolean` <br /> 
Required: `false` <br />
Default: `false`

Fit page with parent width, this prop replace `scale` in width calculation

```vue
<VuePDF :pdf="pdf" fit-parent />
```

## **rotation**

Type: `int` <br />
Required: `false` <br />
Default: `Document Default`

Rotate the page in 90° multiples eg. (`90`, `180`, `270`)

```vue
<VuePDF :pdf="pdf" :rotation="90" />
```

## **text-layer**

Type: `boolean` <br />
Required: `false` <br />
Default: `false`

Enable text selection in page

```vue
<VuePDF :pdf="pdf" text-layer />
```

## **annotation-layer**

Type: `boolean` <br />
Required: `false` <br />
Default: `false`

Enable document annotations like links, popups, widgets, etc.

```vue
<VuePDF :pdf="pdf" annotation-layer />
```

## **annotations-filter**

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