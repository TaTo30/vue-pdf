async function createIframe(): Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe')

    iframe.width = '0px'
    iframe.height = '0px'
    iframe.style.cssText = 'position: absolute; top:0; left:0'
    iframe.style.display = 'none'

    iframe.onload = function () {
      resolve(iframe)
    }
    document.body.appendChild(iframe)
  })
}

function addStylesToIframe(content: Window, sizeX: number, sizeY: number) {
  const style = content.document.createElement('style')
  style.textContent = `
    @page {
      margin: 0;
      size: ${sizeX}pt ${sizeY}pt;
    }
    body {
      margin: 0;
      width: 100%;
    }
    canvas {
      width: 100%;
      page-break-after: always;
      page-break-before: avoid;
      page-break-inside: avoid;
    }
  `
  content.document.head.appendChild(style)
}

export {
  addStylesToIframe, createIframe,
}
