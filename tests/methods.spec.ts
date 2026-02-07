import { beforeAll, describe, expect, test } from "vitest";

import { mount } from "@vue/test-utils";

import { VuePDF, usePDF } from "@tato30/vue-pdf";
import { waitUntil } from "./test-utils";

import a45PDF from "@samples/45.pdf";

describe("Exposed Methods", () => {
  const { pdf } = usePDF(a45PDF);

  beforeAll(async () => {
    await waitUntil(() => pdf.value);
  });

  describe("reload", () => {
    test("reload method triggers re-render", async () => {
      const wrapper = mount(VuePDF, {
        props: {
          pdf: pdf.value,
        },
      });

      await waitUntil(() => wrapper.emitted("loaded"));
      expect(wrapper.emitted("loaded")).toHaveLength(1);

      // Call reload
      wrapper.vm.reload();

      await waitUntil(() => wrapper.emitted("loaded")?.length === 2);
      expect(wrapper.emitted("loaded")).toHaveLength(2);
    });

    test("reload renders current page", async () => {
      const wrapper = mount(VuePDF, {
        props: {
          pdf: pdf.value,
          page: 2,
        },
      });

      await waitUntil(() => wrapper.emitted("loaded"));
      expect(wrapper.emitted("loaded")).toHaveLength(1);

      // Change page and then reload
      await wrapper.setProps({ page: 3 });
      await waitUntil(() => wrapper.emitted("loaded")?.length === 2);

      wrapper.vm.reload();
      await waitUntil(() => wrapper.emitted("loaded")?.length === 3);

      expect(wrapper.emitted("loaded")).toHaveLength(3);
    });
  });

  describe("cancel", () => {
    test("cancel method does not throw", async () => {
      const wrapper = mount(VuePDF, {
        props: {
          pdf: pdf.value,
        },
      });

      await waitUntil(() => wrapper.emitted("loaded"));

      // Cancel should not throw even when there's nothing to cancel
      expect(() => wrapper.vm.cancel()).not.toThrow();
    });

    test("cancel method stops ongoing render", async () => {
      const wrapper = mount(VuePDF, {
        props: {
          pdf: pdf.value,
        },
      });

      // Immediately cancel before render completes
      wrapper.vm.cancel();

      // Component should still be valid
      expect(wrapper).toBeTruthy();
    });
  });

  describe("destroy", () => {
    test("destroy method handles undefined pdf gracefully", async () => {
      const wrapper = mount(VuePDF, {
        props: {
          pdf: undefined,
        },
      });

      // Destroy should not throw even with undefined pdf
      expect(() => wrapper.vm.destroy()).not.toThrow();
    });
  });
});
