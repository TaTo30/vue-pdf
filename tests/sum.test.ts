import { expect, test, vi } from "vitest";

import { mount } from "@vue/test-utils";

import { usePDF, VuePDF } from "../src";

test("mount component", async () => {
  const { pdf, pages } = usePDF(
    "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"
  );

  await vi.waitUntil(() => pdf.value, {timeout: 5000})
  
  expect(pages.value).toBe(14)

  const wrapper = mount(VuePDF, {
    props: {
      pdf: pdf.value
    }
  })

  expect(wrapper).toBeTruthy()


  await vi.waitUntil(() => wrapper.vm.internalProps.viewport, {
    timeout: 5000,
  });
  await vi.waitUntil(() => wrapper.vm.loading === false)

  console.log(wrapper.emitted());
  


  // console.log(wrapper.vm.internalProps.viewport);

  // await wrapper.setProps({
  //   scale: 2
  // })
  
  // //  await vi.waitUntil(() => wrapper.vm.internalProps.viewport, {
  // //    timeout: 5000,
  // //  });

  // console.log(wrapper.vm.internalProps.viewport);
  
  // await wrapper.setProps({
  //   height: 500,
  // });
  // console.log(wrapper.vm.internalProps.viewport);
  // await wrapper.setProps({
  //   width: 500,
  // });
  // console.log(wrapper.vm.internalProps.viewport);

  console.log(wrapper.get("canvas").element.toDataURL("image/png"));
  
  
  

})