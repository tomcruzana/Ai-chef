export function smoothScrollTo(element) {
  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function smoothScrollToAfterRender(getElement) {
  window.setTimeout(() => smoothScrollTo(getElement()), 80);
}
