import simpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import InfiniteScroll from 'infinite-scroll';

import { searchImgByQuery } from './search-api';
import { Block } from 'notiflix';

const galleryRef = document.querySelector('.gallery');
const searchImageFormRef = document.querySelector('#search-form');
searchImageFormRef.addEventListener('submit', e => {
  e.preventDefault();

  const { searchQuery } = e.currentTarget.elements;

  if (!searchQuery.value) {
    return Notify.failure('Your input is invalid');
  }

  galleryRef.innerHTML = '';

  Block.standard('.main-wrapper', {
    position: 'center',
  });

  searchImgByQuery(searchQuery.value)
    .then(data => {
      renderGalleryMarkup(data);
      Block.remove('.main-wrapper');
    })
    .catch(console.warn);

  Notify.success('Here are ypur images');

  e.currentTarget.reset();
});

function renderGalleryMarkup({ data }) {
  const markup = data.hits
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

  const lightbox = new simpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
}
