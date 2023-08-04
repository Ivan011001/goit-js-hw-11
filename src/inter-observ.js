const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
};

export function createIntersectionObserver(target, loadMoreImages) {
  const observer = new IntersectionObserver(async entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadMoreImages();
      }
    });
  }, observerOptions);

  observer.observe(target);
}
