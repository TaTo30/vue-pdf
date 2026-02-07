import { describe, expect, test, vi } from "vitest";
import { ref } from "vue";

import { usePDF } from "@tato30/vue-pdf";
import { waitUntil, waitUntilNetwork } from "./test-utils";

import a14PDF from "@samples/14.pdf";
import a16PDF from "@samples/16.pdf";

describe("usePDF Composable", () => {
  describe("Loading Sources", () => {
    test("Load from URL string", async () => {
      const { pdf, pages, info } = usePDF(
        "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
      );

      await waitUntilNetwork(() => pdf.value);

      expect(pdf.value).toBeTruthy();
      expect(pages.value).toBe(14);
      expect(info.value).toBeTruthy();
    });

    test("Load from local file path", async () => {
      const { pdf, pages } = usePDF(a14PDF);

      await waitUntil(() => pdf.value);

      expect(pdf.value).toBeTruthy();
      expect(pages.value).toBeGreaterThan(0);
    });

    test("Load from DocumentInitParameters object", async () => {
      const { pdf, pages } = usePDF({
        url: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
      });

      await waitUntilNetwork(() => pdf.value);

      expect(pdf.value).toBeTruthy();
      expect(pages.value).toBe(14);
    });
  });

  describe("Reactive Source", () => {
    test("Load from reactive ref and update", async () => {
      const source = ref<string | null>(null);
      const { pdf, pages } = usePDF(source);

      // Initially null, should not load
      expect(pdf.value).toBeUndefined();

      // Update source to trigger loading
      source.value = a14PDF;
      await waitUntil(() => pdf.value);

      expect(pdf.value).toBeTruthy();
      expect(pages.value).toBeGreaterThan(0);
    });

    test("Switch PDF source reactively", async () => {
      const source = ref(a14PDF);
      const { pdf, pages } = usePDF(source);

      await waitUntil(() => pdf.value);
      const initialPages = pages.value;

      // Switch to a different PDF
      source.value =
        "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";
      await waitUntilNetwork(() => pages.value !== initialPages);

      expect(pdf.value).toBeTruthy();
      expect(pages.value).toBe(14);
    });
  });

  describe("PDF Info", () => {
    test("Info contains metadata", async () => {
      const { pdf, info } = usePDF(
        "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
      );

      await waitUntilNetwork(() => pdf.value);
      await waitUntil(() => Object.keys(info.value).length > 0);

      expect(info.value).toHaveProperty("metadata");
      expect(info.value).toHaveProperty("attachments");
      expect(info.value).toHaveProperty("javascript");
      expect(info.value).toHaveProperty("outline");
    });
  });

  describe("Callbacks", () => {
    test("onProgress callback is called", async () => {
      const progressMock = vi.fn();

      const { pdf } = usePDF(
        "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
        {
          onProgress: progressMock,
        },
      );

      await waitUntilNetwork(() => pdf.value);

      expect(progressMock).toHaveBeenCalled();
      expect(progressMock.mock.calls[0][0]).toHaveProperty("loaded");
    });

    test("onError callback is called for invalid PDF", async () => {
      const errorMock = vi.fn();

      usePDF("https://example.com/nonexistent.pdf", {
        onError: errorMock,
      });

      await waitUntilNetwork(() => errorMock.mock.calls.length > 0);

      expect(errorMock).toHaveBeenCalled();
    });

    test("onPassword callback is called for protected PDF", async () => {
      const passwordMock = vi.fn((updatePassword, _reason) => {
        updatePassword("123456");
      });

      const { pdf } = usePDF(a16PDF, {
        onPassword: passwordMock,
      });

      await waitUntil(() => passwordMock.mock.calls.length > 0);

      expect(passwordMock).toHaveBeenCalled();
    });

    test("Password option unlocks protected PDF", async () => {
      const { pdf, pages } = usePDF(a16PDF, {
        password: "123456",
      });

      await waitUntil(() => pdf.value);

      expect(pdf.value).toBeTruthy();
      expect(pages.value).toBeGreaterThan(0);
    });
  });

  describe("PDF Destination", () => {
    test("getPDFDestination returns null for invalid destination", async () => {
      const { pdf, getPDFDestination } = usePDF(a14PDF);

      await waitUntil(() => pdf.value);

      const destination = await getPDFDestination(null);
      expect(destination).toBeNull();
    });

    test("getPDFDestination returns null when PDF not loaded", async () => {
      const { getPDFDestination } = usePDF(null as any);

      const destination = await getPDFDestination("test");
      expect(destination).toBeNull();
    });
  });

  describe("Download and Print", () => {
    test("download function does not throw", async () => {
      const { pdf, download } = usePDF(a14PDF);

      await waitUntil(() => pdf.value);

      // We can't fully test download in headless browser, but we can ensure it doesn't throw
      await expect(download("test.pdf")).resolves.not.toThrow();
    });
  });
});

describe("Error Handling", () => {
  describe("Invalid Sources", () => {
    test("onError called for non-existent URL", async () => {
      const errorMock = vi.fn();

      const { pdf } = usePDF("https://example.com/does-not-exist.pdf", {
        onError: errorMock,
      });

      await waitUntilNetwork(() => errorMock.mock.calls.length > 0);

      expect(errorMock).toHaveBeenCalled();
      expect(pdf.value).toBeUndefined();
    });

    test("onError called for invalid PDF data", async () => {
      const errorMock = vi.fn();

      // Try to load an HTML page as PDF
      usePDF("https://example.com", {
        onError: errorMock,
      });

      await waitUntilNetwork(() => errorMock.mock.calls.length > 0);

      expect(errorMock).toHaveBeenCalled();
    });

    test("null source does not crash", () => {
      const { pdf, pages } = usePDF(null);

      expect(pdf.value).toBeUndefined();
      expect(pages.value).toBe(0);
    });

    test("undefined source does not crash", () => {
      const { pdf, pages } = usePDF(undefined);

      expect(pdf.value).toBeUndefined();
      expect(pages.value).toBe(0);
    });
  });

  describe("Password Protected PDFs", () => {
    test("onPassword receives reason for wrong password", async () => {
      let receivedReason: number | undefined;
      const passwordMock = vi.fn((updatePassword, reason) => {
        receivedReason = reason;
        // Don't provide password to trigger callback again
      });

      usePDF(a16PDF, {
        onPassword: passwordMock,
      });

      await waitUntil(() => passwordMock.mock.calls.length > 0);

      expect(passwordMock).toHaveBeenCalled();
      // Reason 1 = NEED_PASSWORD, Reason 2 = INCORRECT_PASSWORD
      expect(receivedReason).toBeDefined();
    });

    test("wrong password triggers onError or retry", async () => {
      const errorMock = vi.fn();
      const passwordMock = vi.fn((updatePassword, _reason) => {
        updatePassword("wrong-password");
      });

      usePDF(a16PDF, {
        onPassword: passwordMock,
        onError: errorMock,
      });

      // Either onPassword is called again with INCORRECT_PASSWORD reason
      // or onError is called
      await waitUntil(
        () =>
          passwordMock.mock.calls.length > 1 || errorMock.mock.calls.length > 0,
      );

      expect(
        passwordMock.mock.calls.length > 1 || errorMock.mock.calls.length > 0,
      ).toBe(true);
    });
  });

  describe("Graceful Degradation", () => {
    test("pages is 0 when PDF fails to load", async () => {
      const errorMock = vi.fn();

      const { pages } = usePDF("https://example.com/nonexistent.pdf", {
        onError: errorMock,
      });

      await waitUntilNetwork(() => errorMock.mock.calls.length > 0);

      expect(pages.value).toBe(0);
    });

    test("info is empty object when PDF fails to load", async () => {
      const errorMock = vi.fn();

      const { info } = usePDF("https://example.com/nonexistent.pdf", {
        onError: errorMock,
      });

      await waitUntilNetwork(() => errorMock.mock.calls.length > 0);

      expect(info.value).toEqual({});
    });

    test("download throws when PDF not loaded", async () => {
      const errorMock = vi.fn();

      const { download } = usePDF("https://example.com/nonexistent.pdf", {
        onError: errorMock,
      });

      await waitUntilNetwork(() => errorMock.mock.calls.length > 0);

      await expect(download()).rejects.toThrow();
    });

    test("print throws when PDF not loaded", async () => {
      const errorMock = vi.fn();

      const { print } = usePDF("https://example.com/nonexistent.pdf", {
        onError: errorMock,
      });

      await waitUntilNetwork(() => errorMock.mock.calls.length > 0);

      await expect(print()).rejects.toThrow();
    });
  });
});
