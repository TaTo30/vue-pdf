import { beforeAll, expect, test, vi } from 'vitest'

import { mount } from '@vue/test-utils'

import { VuePDF, usePDF } from '../src'

const { pdf, pages } = usePDF(
  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
)

beforeAll(async () => {
  await vi.waitUntil(() => pdf.value, { timeout: 5000 })
})

test('mount component', () => {
  expect(pdf.value).toBeTruthy()
  expect(pages.value).toBe(14)

  const wrapper = mount(VuePDF, {
    props: {
      pdf: pdf.value,
    },
  })

  expect(wrapper).toBeTruthy()

  // console.log(wrapper.get('canvas').element.toDataURL('image/png'))
})
