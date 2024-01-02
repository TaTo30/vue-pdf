/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { beforeAll, expect, test, vi } from 'vitest'

import { mount } from '@vue/test-utils'

import { VuePDF, usePDF } from '../src'

import xfaPDF from '../playground/pdf/example_xfa.pdf'

const { pdf } = usePDF(
  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
)

beforeAll(async () => {
  await vi.waitUntil(() => pdf.value, { timeout: 5000 })
})

test('Text Layer', async () => {
  const wrapper = mount(VuePDF, {
    props: {
      pdf: pdf.value,
    },
  })

  expect(wrapper).toBeTruthy()
  await vi.waitUntil(() => wrapper.vm.internalProps.viewport, {
    timeout: 5000,
  })

  expect(() => wrapper.get('div.textLayer')).toThrowError()

  await wrapper.setProps({ textLayer: true })

  expect(wrapper.get('div.textLayer')).toBeTruthy()
})

test('Annotation Layer', async () => {
  const wrapper = mount(VuePDF, {
    props: {
      pdf: pdf.value,
    },
  })

  expect(wrapper).toBeTruthy()
  await vi.waitUntil(() => wrapper.vm.internalProps.viewport, {
    timeout: 5000,
  })

  expect(() => wrapper.get('div.annotationLayer')).toThrowError()

  await wrapper.setProps({ annotationLayer: true })

  expect(wrapper.get('div.annotationLayer')).toBeTruthy()
})

test('XFA Layer', async () => {
  const { pdf } = usePDF({
    url: xfaPDF,
    enableXfa: true,
  })

  await vi.waitUntil(() => pdf.value, { timeout: 5000 })

  const wrapper = mount(VuePDF, {
    props: {
      pdf: pdf.value,
    },
  })

  expect(wrapper).toBeTruthy()
  await vi.waitUntil(() => wrapper.vm.internalProps.viewport, {
    timeout: 5000,
  })

  expect(wrapper.get('div.xfaLayer')).toBeTruthy()
})
