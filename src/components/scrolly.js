// Lightweight scrollytelling helper: no scroll library, just an
// IntersectionObserver that toggles `.is-active` on whichever `.step`
// element is nearest the vertical center of the viewport. The sticky
// graphic itself is pure CSS (`position: sticky` on `.scrolly__sticky`),
// so this only drives the text-emphasis layer — charts render fine even
// before this runs.
export function initScrolly(root) {
  const steps = [...root.querySelectorAll(".step")];
  if (!steps.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      }
    },
    {threshold: 0, rootMargin: "-45% 0px -45% 0px"}
  );

  for (const step of steps) observer.observe(step);
  return observer;
}
