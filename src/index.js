import axios from 'axios';
import simpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Block } from 'notiflix';
import InfiniteScroll from 'infinite-scroll';

const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '38601614-53dd37c61e051eba7000d3146';

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

  let infScroll = new InfiniteScroll(galleryRef, {
    path: function () {
      return `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery.value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.pageIndex}`;
    },
    responseBody: 'json',
    status: '.scroll-status',
    history: false,
  });

  infScroll.on('load', data => {
    renderGalleryMarkup(data);
    Block.remove('.main-wrapper');
    const lightbox = new simpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
  });

  infScroll.loadNextPage();

  // searchImgByQuery(searchQuery.value)
  //   .then(response => {
  //     if (!response.data.totalHits) {
  //       Block.remove('.main-wrapper');
  //       return Notify.failure('Sorry, there are no such images');
  //     }
  //     renderGalleryMarkup(response);
  //     Block.remove('.main-wrapper');
      // Notify.success(`We have found ${response.data.total} images`);
  //   })
  //   .catch(console.error);

  e.currentTarget.reset();
});

function renderGalleryMarkup(data) {
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

function searchImgByQuery(imgQuery) {
  return axios.get(
    `${BASE_URL}?key=${API_KEY}&q=${imgQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40`
  );
}
