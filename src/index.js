import SimpleLightbox from 'simplelightbox';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages, currentPage } from './search-api';
import { createIntersectionObserver } from './inter-observ';

const imagesPerPage = 40;
let currentSearchQuery = '';

const target = document.querySelector('.load-more');
const galleryRef = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const inputRef = document.querySelector('input');
const formRef = document.querySelector('.search-form');
formRef.addEventListener('submit', formSubmitHandles);

async function formSubmitHandles(e) {
  e.preventDefault();

  if (!inputRef.value) {
    return Notiflix.Notify.failure('Your input is invalid');
  }

  currentSearchQuery = inputRef.value;
  Notiflix.Block.standard('.main-wrapper', {
    position: 'center',
  });

  inputRef.value = '';
  currentPage = 1;
  galleryRef.innerHTML = '';

  try {
    const imagesData = await fetchImages(
      currentSearchQuery,
      currentPage,
      imagesPerPage
    );
    if (imagesData.length === 0) {
      Notiflix.Block.remove('.main-wrapper');
      return Notiflix.Notify.failure('Sorry, there are no such images...');
    }

    Notiflix.Notify.success(
      'We have found some images for you! Scroll down to see all of them'
    );
    renderGalleryMarkup(imagesData);
    Notiflix.Block.remove('.main-wrapper');
    lightbox.refresh();
    createIntersectionObserver(target, loadMoreImages);
  } catch (error) {
    console.warn(error.message);
  }
}

function renderGalleryMarkup(data) {
  const markup = data
    .map(img => {
      return `
        <div class="photo-card">
          <a href="${img.largeImageURL}">
            <img class="photo-image" src="${img.webformatURL}" alt="${img.tags}" loading="lazy" />
          </a>
          <div class="info">
            <p class="info-item"><span>Likes:</span> <b>${img.likes}</b></p>
            <p class="info-item"><span>Views:</span> <b>${img.views}</b></p>
            <p class="info-item"><span>Comments:</span> <b>${img.comments}</b></p>
            <p class="info-item"><span>Downloads:</span> <b>${img.downloads}</b></p>
          </div>
        </div>
      `;
    })
    .join('');

  galleryRef.insertAdjacentHTML('beforeend', markup);
}

async function loadMoreImages() {
  try {
    const imagesData = await fetchImages(
      currentSearchQuery,
      currentPage,
      imagesPerPage
    );

    if (imagesData.length === 0) {
      Notiflix.Notify.failure('No more images to load.');
      return;
    }

    renderGalleryMarkup(imagesData);
    lightbox.refresh();
  } catch (error) {
    console.warn(error.message);
  }
}
