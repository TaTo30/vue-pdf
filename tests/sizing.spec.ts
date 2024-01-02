/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { beforeAll, expect, test, vi } from 'vitest'

import { mount } from '@vue/test-utils'

import { VuePDF, usePDF } from '../src'

const { pdf } = usePDF(
  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
)

beforeAll(async () => {
  await vi.waitUntil(() => pdf.value, { timeout: 5000 })
})

test('Scaling', async () => {
  const wrapper = mount(VuePDF, {
    props: {
      pdf: pdf.value,
    },
  })

  expect(wrapper).toBeTruthy()
  await vi.waitUntil(() => wrapper.vm.internalProps.viewport, {
    timeout: 5000,
  })

  let viewport = wrapper.vm.internalProps.viewport
  expect(viewport.width).toBe(612)

  await wrapper.setProps({ scale: 2 })
  viewport = wrapper.vm.internalProps.viewport
  expect(viewport.width).toBe(612 * 2)
})

test('Width and Height', async () => {
  const wrapper = mount(VuePDF, {
    props: {
      pdf: pdf.value,
      height: 500,
    },
  })

  expect(wrapper).toBeTruthy()
  await vi.waitUntil(() => wrapper.vm.internalProps.viewport, {
    timeout: 5000,
  })

  let viewport = wrapper.vm.internalProps.viewport
  expect(Math.round(viewport.height as number)).toBe(500)

  await wrapper.setProps({ width: 500 })
  viewport = wrapper.vm.internalProps.viewport
  expect(Math.round(viewport.width as number)).toBe(500)
})

test('Fit Parent', async () => {
  const wrapper = mount(VuePDF, {
    props: {
      pdf: pdf.value,
      scale: 2,
      fitParent: true,
    },
  })

  expect(wrapper).toBeTruthy()
  await vi.waitUntil(() => wrapper.vm.internalProps.viewport, {
    timeout: 5000,
  })

  const viewport = wrapper.vm.internalProps.viewport
  expect(viewport.width).toBe(0) // 0 because there is not a parent node
})

test('Rotation', async () => {
  const wrapper = mount(VuePDF, {
    props: {
      pdf: pdf.value,
      rotation: 90,
    },
  })

  expect(wrapper).toBeTruthy()
  await vi.waitUntil(() => wrapper.vm.internalProps.viewport, {
    timeout: 5000,
  })

  const viewport = wrapper.vm.internalProps.viewport
  expect(viewport.rotation).toBe(90)
})
