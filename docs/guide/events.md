# Events

## loaded

```vue
<VuePDF :pdf="pdf" @loaded="onLoaded" />
```

Emitted when page has finished rendering task in view, the value contains page information.

Value example:
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

Emitted when user has interaction with any annotation.

Annotation event data depends on what type of annotation has triggered the event, in general, the events value follows this structure:
| Property | Value                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `type`   | Possible values: `internal-link`, `link`, `file-attachment`, `form-text`, `form-select`, `form-checkbox`, `form-radio`, `form-button`   |
| `data`   | Annotation associated data                                                                                                             |

### internal-link

`internal-link` emitted when user clicks a link that redirects to another content within the document.

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

`link` emitted when user clicks an external content link.

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

`file-attachment` emitted when user double-click an attachment annotation.

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

`form-text` emitted when user inputs a value in an text-field element.

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

`form-select` emitted when user inputs a value in an one-select or multi-select element.

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

`form-checkbox` emitted when user changes a checkbox field element.

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

`form-radio` emitted when user changes a radio field.

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

`form-button` emitted when user click on push button element.

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
