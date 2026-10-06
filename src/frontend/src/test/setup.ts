import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Generated components expose `data-ocid` rather than `data-testid`.
configure({ testIdAttribute: "data-ocid" });

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

// jsdom does not implement matchMedia, which several UI primitives probe.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// jsdom lacks ResizeObserver, used by Radix primitives (Select, Slider, Tabs).
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
    ResizeObserverStub;
}

// jsdom lacks scrollIntoView, invoked by Radix Select on open.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
