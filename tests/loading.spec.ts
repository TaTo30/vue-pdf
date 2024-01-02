import { beforeAll, expect, test, vi } from 'vitest'

import { mount } from '@vue/test-utils'

import { VuePDF, usePDF } from '../src'

const { pdf, pages } = usePDF(
  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
)

beforeAll(async () => {
  await vi.waitUntil(() => pdf.value, { timeout: 5000 })
})

test('Load/Mount component', async () => {
  expect(pdf.value).toBeTruthy()
  expect(pages.value).toBe(14)

  const wrapper = mount(VuePDF, {
    props: {
      pdf: pdf.value,
    },
  })

  expect(wrapper).toBeTruthy()

  await vi.waitUntil(() => wrapper.emitted('loaded'), {
    timeout: 5000,
  })

  expect(wrapper.emitted('loaded')).toHaveLength(1)
  expect(wrapper.emitted('loaded')![0]).toEqual([
    {
      viewBox: [0, 0, 612, 792],
      scale: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      transform: [1, 0, 0, -1, 0, 792],
      width: 612,
      height: 792,
    },
  ])

  // console.log(wrapper.get('canvas').element.toDataURL('image/png'))
})
