import { beforeAll, describe, expect, test } from "vitest";

import { mount } from "@vue/test-utils";

import { VuePDF, usePDF } from "@tato30/vue-pdf";
import { waitUntil, waitUntilNetwork } from "./test-utils";

const { pdf } = usePDF(
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
);

beforeAll(async () => {
  await waitUntilNetwork(() => pdf.value);
});

describe("Sizing", () => {
  test("Scaling", async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
      },
    });

    expect(wrapper).toBeTruthy();
    await waitUntil(() => wrapper.emitted("loaded"));

    let viewport = wrapper.emitted("loaded")![0][0] as { width: number };
    expect(viewport.width).toBe(612);

    await wrapper.setProps({ scale: 2 });
    await waitUntil(() => wrapper.emitted("loaded")?.length === 2);
    viewport = wrapper.emitted("loaded")![1][0] as { width: number };
    expect(viewport.width).toBe(612 * 2);
  });

  test("Width and Height", async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
        height: 500,
      },
    });

    expect(wrapper).toBeTruthy();
    await waitUntil(() => wrapper.emitted("loaded"));

    let viewport = wrapper.emitted("loaded")![0][0] as {
      width: number;
      height: number;
    };
    expect(Math.round(viewport.height as number)).toBe(500);

    await wrapper.setProps({ width: 500 });
    await waitUntil(() => wrapper.emitted("loaded")?.length === 2);
    viewport = wrapper.emitted("loaded")![1][0] as {
      width: number;
      height: number;
    };
    expect(Math.round(viewport.width as number)).toBe(500);
  });

  test("Fit Parent", async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
        scale: 2,
        fitParent: true,
      },
    });

    expect(wrapper).toBeTruthy();
    await waitUntil(() => wrapper.emitted("loaded"));

    const viewport = wrapper.emitted("loaded")![0][0] as { width: number };
    expect(viewport.width).toBe(0); // 0 because there is not a parent node
  });

  test("Rotation", async () => {
    const wrapper = mount(VuePDF, {
      props: {
        pdf: pdf.value,
        rotation: 90,
      },
    });

    expect(wrapper).toBeTruthy();
    await waitUntil(() => wrapper.emitted("loaded"));

    const viewport = wrapper.emitted("loaded")![0][0] as { rotation: number };
    expect(viewport.rotation).toBe(90);
  });
});
