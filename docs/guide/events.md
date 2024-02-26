---
outline: deep
---

# Events

## loaded

```vue
<VuePDF :pdf="pdf" @loaded="onLoaded" />
```

Emitted when page has finished to render, the payload value contains the page's data.

Payload example:
```json
{
  "viewBox": [0, 0, 595.276, 841.89],
  "scale": 1,
  "rotation": 90,
  "offsetX": 0,
  "offsetY": 0,
  "transform": [0, 1, 1, 0, 0, 0],
  "width": 841.89,
  "height": 595.276
}
```

## text-loaded

```vue
<VuePDF :pdf="pdf" @text-loaded="onLoaded" />
```

Emitted when text layer has finished to render, the payload value contains the `textDivs` and `textContent` of the page.

Payload example:
```json
{
  "textContent": {
    "items": [{
      "dir": "ltr",
      "fontName": "g_d3_f1",
      "hasEOL": true,
      "height": 17.9328,
      "str": "Trace-based Just-in-Time Type Specialization for Dynamic",
      "transform": [17.9328, 0, 0, 17.9328, 90.5159, 700.6706],
      "width": 449.09111040000033
    }], // ... more text items
    "styles": {
      "g_d3_f1": {
        "fontFamily": "sans-serif",
        "ascent": 0.69,
        "descent": -0.209,
        "vertical": false
      } // ... more objects
    }
  },
  "textDivs": ["<SPANElement>", "<SPANElement>", "..."]
}
```

## annotation-loaded

```vue
<VuePDF :pdf="pdf" @annotation-loaded="onLoaded" />
```

Emitted when annotation layer has finished to render, the payload value contains the `annotations` of the page.

Payload example:
```json
[
  {
    "annotationFlags": 4,
    "annotationType": 20,
    "rotation": 0,
    "fieldType": "Tx",
    "subType": "Widget"
    // more properties...
  }
] // more annotations
```

## xfa-loaded

```vue
<VuePDF :pdf="pdf" @xfa-loaded="onLoaded" />
```

Emitted when XFA page has finished to render.


## highlight

```vue
<VuePDF :pdf="pdf" @highlight="onHighlight" />
```

Emitted when a text has been searched in page using [highlight-text](/guide/props.md#highlight-text) and [highlight-options](/guide/props.md#highlight-options), this event return a list of matches and the page where the text was found with its `textDivs` and `textContent`.

Check the example: [Highlight Event](/examples/text_events/text_highlight.md)



## annotation


```vue
<VuePDF :pdf="pdf" @annotation="onAnnotation" />
```

Emitted when user has an interaction with any annotation.

Annotation event data depends on what type of annotation has triggered the event, in general, the events value follows this structure:
| Property | Value                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `type`   | Possible values: `internal-link`, `link`, `file-attachment`, `form-text`, `form-select`, `form-checkbox`, `form-radio`, `form-button` |
| `data`   | Annotation's associated data                                                                                                            |


### internal-link

`internal-link` emitted when the user clicks on a link that redirects to another content within the document.

```json
{
  "type": "internal-link",
  "data": {
    "referencedPage": 3,
    "offset": {
      "left": 82,
      "bottom": 716
    }
  }
}
```

### link

`link` emitted when the user clicks on an external link.

```json
{
  "type": "link",
  "data": {
    "url": "mailto:aor@testmail.com",
    "unsafeUrl": "mailto:aor@testmail.com"
  }
}
```

### file-attachment

`file-attachment` emitted when the user double-clicks an attachment annotation.

```json
{
  "type": "file-attachment",
  "data": {
    "filename": "utf8test.txt",
    "content": [83, 101, 110] // Uint8Array
  }
}
```

### form-text

`form-text` emitted when the user inputs a value in an text-field element.

```json
{
  "type": "form-text",
  "data": {
    "fieldName": "firstname",
    "value": "Aldo Hernandez"
  }
}
```

### form-select

`form-select` emitted when the user inputs a value in an one-select or multi-select element.

```json
{
  "type": "form-select",
  "data": {
    "fieldName": "gender",
    "value": [
      {
        "value": "M",
        "label": "Male"
      }
    ],
    "options": [
      {
        "value": "",
        "label": "-"
      },
      {
        "value": "M",
        "label": "Male"
      },
      {
        "value": "F",
        "label": "Female"
      }
    ]
  }
}
```

### form-checkbox

`form-checkbox` emitted when the user changes a checkbox field element.

```json
{
  "type": "form-checkbox",
  "data": {
    "fieldName": "newsletter",
    "checked": true
  }
}
```

### form-radio

`form-radio` emitted when the user changes a radio field.

```json
{
  "type": "form-radio",
  "data": {
    "fieldName": "drink",
    "value": "Wine",
    "defaultValue": "Beer",
    "options": ["Water", "Beer", "Wine", "Milk"]
  }
}
```

### form-button

`form-button` emitted when the user clicks on a push button element.

```json
{
  "type": "form-button",
  "data": {
    "fieldName": "Print",
    "actions": {
      "Mouse Down": ["Print()"]
    },
    "reset": false
  }
}
```
