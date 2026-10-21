import { beforeAll, describe, expect, test, vi } from "vitest";

import { mount } from "@vue/test-utils";
import * as PDFJS from "pdfjs-dist";

import { VuePDF, usePDF } from "@tato30/vue-pdf";
import { waitUntil, waitUntilNetwork } from "./test-utils";

const { pdf, pages } = usePDF(
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
);

beforeAll(async () => {
  await waitUntilNetwork(() => pdf.value);
});

describe("Loading", () => {
  test("Load/Mount component", async () => {
    expect(pdf.value).toBeTruthy();
    expect(pages.value).toBe(14);

    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
      },
    });

    expect(wrapper).toBeTruthy();

    await waitUntil(() => wrapper.emitted("loaded"));

    expect(wrapper.emitted("loaded")).toHaveLength(1);
    expect(wrapper.emitted("loaded")![0]).toEqual([
      {
        viewBox: [0, 0, 612, 792],
        scale: 1,
        userUnit: 1,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        transform: [1, 0, 0, -1, 0, 792],
        width: 612,
        height: 792,
      },
    ]);

    // console.log(wrapper.get('canvas').element.toDataURL('image/png'))
  });
});

describe("Page Navigation", () => {
  test("Render specific page", async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
        page: 5,
      },
    });

    expect(wrapper).toBeTruthy();

    await waitUntil(() => wrapper.emitted("loaded"));

    expect(wrapper.emitted("loaded")).toHaveLength(1);
  });

  test("Switch pages via prop change", async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
        page: 1,
      },
    });

    expect(wrapper).toBeTruthy();

    await waitUntil(() => wrapper.emitted("loaded"));

    expect(wrapper.emitted("loaded")).toHaveLength(1);

    // Change to page 3
    await wrapper.setProps({ page: 3 });

    await waitUntil(() => wrapper.emitted("loaded")?.length === 2);

    expect(wrapper.emitted("loaded")).toHaveLength(2);
  });

  test("Navigate through multiple pages sequentially", async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
        page: 1,
      },
    });

    await waitUntil(() => wrapper.emitted("loaded"));

    // Navigate through pages 2, 3, 4
    for (let i = 2; i <= 4; i++) {
      await wrapper.setProps({ page: i });
      await waitUntil(() => wrapper.emitted("loaded")?.length === i);
    }

    expect(wrapper.emitted("loaded")).toHaveLength(4);
  });

  test("First and last page navigation", async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
        page: 1,
      },
    });

    await waitUntil(() => wrapper.emitted("loaded"));

    // Jump to last page
    await wrapper.setProps({ page: pages.value });

    await waitUntil(() => wrapper.emitted("loaded")?.length === 2);

    expect(wrapper.emitted("loaded")).toHaveLength(2);

    // Jump back to first page
    await wrapper.setProps({ page: 1 });

    await waitUntil(() => wrapper.emitted("loaded")?.length === 3);

    expect(wrapper.emitted("loaded")).toHaveLength(3);
  });

  test("Multiple VuePDF components with different pages", async () => {
    const wrapper1 = mount(VuePDF, {
      props: {
        pdf: pdf.value,
        page: 1,
      },
    });

    const wrapper2 = mount(VuePDF, {
      props: {
        pdf: pdf.value,
        page: 5,
      },
    });

    await waitUntil(() => wrapper1.emitted("loaded"));

    await waitUntil(() => wrapper2.emitted("loaded"));

    expect(wrapper1.emitted("loaded")).toHaveLength(1);
    expect(wrapper2.emitted("loaded")).toHaveLength(1);
  });
});

describe("Render Errors", () => {
  // Stubs page.render() for the next call with a task whose promise rejects
  async function failNextRender(reason: unknown) {
    const page = await (await pdf.value!.promise).getPage(1);
    let promise: Promise<void> | undefined;
    const render = vi
      .spyOn(Object.getPrototypeOf(page), "render")
      .mockImplementationOnce(() => {
        promise = Promise.reject(reason);
        return { promise, cancel: () => {} };
      });
    return { render, rejected: () => promise };
  }

  test("Emits error when the page fails to render", async () => {
    const failure = new Error("render failed");
    const { render } = await failNextRender(failure);

    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
      },
    });

    await waitUntil(() => wrapper.emitted("error"));
    expect(wrapper.emitted("error")).toEqual([[failure]]);
    expect(wrapper.emitted("loaded")).toBeUndefined();
    render.mockRestore();
  });

  test("Does not emit error when the render is cancelled", async () => {
    const { render, rejected } = await failNextRender(
      new PDFJS.RenderingCancelledException("Rendering cancelled"),
    );

    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
      },
    });

    await waitUntil(() => rejected() !== undefined);
    // VuePDF's handler was attached first, so it has run by the time this one does
    await rejected()!.catch(() => {});
    expect(wrapper.emitted("error")).toBeUndefined();
    render.mockRestore();
  });
});
