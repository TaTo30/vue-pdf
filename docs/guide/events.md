# Events

## **loaded**

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
  "height": 595.276,
  "annotations": []
}
```

> NOTE: "annotations" property will be appended if [annotation-layer](props.md#annotation-layer) prop is `true`

## annotation

```vue
<VuePDF :pdf="pdf" @annotation="onAnnotation" />
```

Emitted when user has interaction with any annotation.

Annotation event data depends on type of annotation that trigger the event, in general the event value follows this structure:
| Property | Value                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `type`   | Posible values: `internal-link`, `link`, `file-attachment`, `form-text`, `form-select`, `form-checkbox`, `form-radio`, `form-button`   |
| `data`   | Annotation associated data                                                                                                             |

### **internal-link**

`internal-link` fires when user clicks a link that redirects to other content within the document.

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

### **link**

`link` fires when user clicks an external link.

```json
{
  "type": "link",
  "data": {
    "url": "mailto:aor@testmail.com",
    "unsafeUrl": "mailto:aor@testmail.com"
  }
}
```

### **file-attachment**

`file-attachment` fires when user double-click an attachment link.

```json
{
  "type": "file-attachment",
  "data": {
    "filename": "utf8test.txt",
    "content": [83, 101, 110] // Uint8Array
  }
}
```

### **form-text**

`form-text` fires when user inputs a value in an text-field element.

```json
{
  "type": "form-text",
  "data": {
    "fieldName": "firstname",
    "value": "Aldo Hernandez"
  }
}
```

### **form-select**

`form-select` fires when user inputs a value in an one-select or multi-select element.

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

### **form-checkbox**

`form-checkbox` fires when user changes a checkbox field.

```json
{
  "type": "form-checkbox",
  "data": {
    "fieldName": "newsletter",
    "checked": true
  }
}
```

### **form-radio**

`form-radio` fires when user changes a radio field.

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

### **form-button**

`form-button` fires when user click on push button.

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
