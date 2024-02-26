/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { beforeAll, describe, expect, test, vi } from 'vitest'

import { mount } from '@vue/test-utils'

import type { HighlightEventPayload } from '../src'
import { VuePDF, usePDF } from '../src'

import a14PDF from '../docs/public/example_014.pdf'
import a45PDF from '../docs/public/example_045.pdf'
import xfaPDF from '../docs/public/example_xfa.pdf'

describe('Text Layer', () => {
  const { pdf } = usePDF(
    'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
  )

  beforeAll(async () => {
    await vi.waitUntil(() => pdf.value, { timeout: 5000 })
  })

  test('Visibility', async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
      },
    })
    expect(wrapper).toBeTruthy()

    await vi.waitUntil(() => wrapper.vm.internalProps.viewport)
    expect(() => wrapper.get('div.textLayer')).toThrowError()

    await wrapper.setProps({ textLayer: true })
    expect(wrapper.get('div.textLayer')).toBeTruthy()

    await vi.waitUntil(() => wrapper.emitted('textLoaded'))
    expect(wrapper.emitted('textLoaded')).toHaveLength(1)
  })

  test('Highlight', async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
        textLayer: true,
        highlightText: 'dynamic',
        highlightOptions: {
          completeWords: false,
          ignoreCase: true,
        },
      },
    })

    expect(wrapper).toBeTruthy()
    await vi.waitUntil(() => wrapper.emitted('highlight'))

    expect(wrapper.emitted('highlight')).toHaveLength(1)
    expect((wrapper.emitted('highlight')![0][0]! as HighlightEventPayload).textDivs).toHaveLength(182)
    expect((wrapper.emitted('highlight')![0][0]! as HighlightEventPayload).matches).toHaveLength(11)

    await wrapper.setProps({
      highlightOptions: {
        completeWords: true,
        ignoreCase: true,
      },
    })
    await vi.waitUntil(() => wrapper.emitted('highlight')?.length === 2)
    expect((wrapper.emitted('highlight')![1][0]! as HighlightEventPayload).matches).toHaveLength(8)

    await wrapper.setProps({
      highlightOptions: {
        ignoreCase: false,
        completeWords: true,
      },
    })
    await vi.waitUntil(() => wrapper.emitted('highlight')?.length === 3)
    expect((wrapper.emitted('highlight')![2][0]! as HighlightEventPayload).matches).toHaveLength(5)

    await wrapper.setProps({
      highlightOptions: {
        ignoreCase: false,
        completeWords: false,
      },
    })
    await vi.waitUntil(() => wrapper.emitted('highlight')?.length === 4)
    expect((wrapper.emitted('highlight')![3][0]! as HighlightEventPayload).matches).toHaveLength(8)
  })
})

describe('Annotation Layer', () => {
  const { pdf } = usePDF(a14PDF)
  const { pdf: pdf45 } = usePDF(a45PDF)

  beforeAll(async () => {
    await vi.waitUntil(() => pdf.value, { timeout: 5000 })
    await vi.waitUntil(() => pdf45.value, { timeout: 5000 })
  })

  test('Visibility', async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
      },
    })
    expect(wrapper).toBeTruthy()

    await vi.waitUntil(() => wrapper.vm.internalProps.viewport)
    expect(() => wrapper.get('div.annotationLayer')).toThrowError()

    await wrapper.setProps({ annotationLayer: true })
    expect(wrapper.get('div.annotationLayer')).toBeTruthy()

    await vi.waitUntil(() => wrapper.emitted('annotationLoaded'))
    expect(wrapper.emitted('annotationLoaded')).toHaveLength(1)
  })

  test('Forms Fields', async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
        annotationLayer: true,
      },
    })
    expect(wrapper).toBeTruthy()

    await vi.waitUntil(() => wrapper.get('div.annotationLayer').element.childNodes.length > 0)

    const checkbox = wrapper.get('input[type=\'checkbox\']').element as HTMLInputElement
    checkbox.click()
    await vi.waitUntil(() => wrapper.emitted('annotation'))

    expect(wrapper.emitted('annotation')).toHaveLength(1)
    expect(wrapper.emitted('annotation')![0][0]).toEqual(
      {
        type: 'form-checkbox',
        data: {
          fieldName: 'newsletter',
          checked: true,
        },
      })

    const radiobutton = wrapper.get('input[data-element-id="14R"]').element as HTMLInputElement
    radiobutton.click()
    await vi.waitUntil(() => wrapper.emitted('annotation')?.length === 2)
    expect(wrapper.emitted('annotation')![1][0]).toEqual({
      type: 'form-radio',
      data: {
        fieldName: 'drink',
        value: 'Wine',
        defaultValue: 'Beer',
        options: ['Water', 'Beer', 'Wine', 'Milk'],
      },
    })

    const selectOption = wrapper.get('select[data-element-id="9R"]').element as HTMLSelectElement
    selectOption.value = 'F'
    selectOption.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitUntil(() => wrapper.emitted('annotation')?.length === 3)
    expect(wrapper.emitted('annotation')![2][0]).toEqual({
      type: 'form-select',
      data: {
        fieldName: 'gender',
        value: [
          {
            value: 'F',
            label: 'Female',
          },
        ],
        options: [
          {
            value: '',
            label: '-',
          },
          {
            value: 'M',
            label: 'Male',
          },
          {
            value: 'F',
            label: 'Female',
          },
        ],
      },
    })

    const textInput = wrapper.get('input[name="firstname"]').element as HTMLInputElement
    textInput.value = 'Testing'
    textInput.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitUntil(() => wrapper.emitted('annotation')?.length === 4)
    expect(wrapper.emitted('annotation')![3][0]).toEqual({
      type: 'form-text',
      data: {
        fieldName: 'firstname',
        value: 'Testing',
      },
    })
  })

  test('Links', async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf45.value,
        annotationLayer: true,
      },
    })
    expect(wrapper).toBeTruthy()

    await vi.waitUntil(() => wrapper.get('div.annotationLayer').element.childNodes.length > 0)

    const indexLink = wrapper.get('a[data-element-id="13R"]').element as HTMLAnchorElement
    indexLink.click()
    await vi.waitUntil(() => wrapper.emitted('annotation'))
    expect(wrapper.emitted('annotation')![0][0]).toEqual({
      type: 'internal-link',
      data: {
        referencedPage: 2,
        offset: {
          left: 0,
          bottom: 841.89,
        },
      },
    })
  })
})

describe('XFA Layer', () => {
  const { pdf } = usePDF({
    url: xfaPDF,
    enableXfa: true,
  })

  beforeAll(async () => {
    await vi.waitUntil(() => pdf.value, { timeout: 5000 })
  })

  test('Visibility', async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
      },
    })
    expect(wrapper).toBeTruthy()

    await vi.waitUntil(() => wrapper.vm.internalProps.viewport)
    expect(wrapper.get('div.xfaLayer')).toBeTruthy()

    await vi.waitUntil(() => wrapper.emitted('xfaLoaded'))
    expect(wrapper.emitted('xfaLoaded')).toHaveLength(1)
  })
})
