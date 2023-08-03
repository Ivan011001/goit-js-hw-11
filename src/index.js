import axios from 'axios';
import simpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Block } from 'notiflix';
import InfiniteScroll from 'infinite-scroll';

const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '38601614-53dd37c61e051eba7000d3146';

let page = 0;

const galleryRef = document.querySelector('.gallery');
const searchImageFormRef = document.querySelector('#search-form');
searchImageFormRef.addEventListener('submit', e => {
  e.preventDefault();
  const { searchQuery } = e.currentTarget.elements;

  if (!searchQuery.value) {
    return Notify.failure('Your input is invalid');
  }
  page = 0;
  galleryRef.innerHTML = '';

  Block.standard('.main-wrapper', {
    position: 'center',
  });

  searchImgByQuery(searchQuery.value)
    .then(response => {
      if (!response.data.totalHits) {
        Block.remove('.main-wrapper');
        return Notify.failure('Sorry, there are no images');
      }
      renderGalleryMarkup(response);
      Block.remove('.main-wrapper');
      Notify.success('Here are your images');
    })
    .catch(console.error);

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

function searchImgByQuery(imgQuery) {
  return axios.get(
    `${BASE_URL}?key=${API_KEY}&q=${imgQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${(page += 1)}`
  );
}





// let newContainer = document.querySelector('.new-container');

// let newInfScroll = new InfiniteScroll(newContainer, {
//   path: function () {
//     return `https://pixabay.com/api?key=38601614-53dd37c61e051eba7000d3146&q=cat&image_type=photo&orientation=horizontal&safesearch=true&page=${this.pageIndex}`;
//   },
//   // load response as JSON
//   responseBody: 'json',
//   status: '.scroll-status',
//   history: false,
// });

// let newProxyElem = document.createElement('div');

// newInfScroll.on('load', ({ hits }) => {
//   console.log(hits);

//   let newItemsHTML = hits
//     .map(img => {
//       return `
//     <div>
//     <img src="${img.largeImageURL}" alt="slfm" />
//     </div>`;
//     })
//     .join('');
//   console.log(newItemsHTML);

//   newProxyElem.innerHTML = newItemsHTML;
//   console.log(newProxyElem);
//   newContainer.append(...newProxyElem.children);
// });

// newInfScroll.loadNextPage();

// function renderMarkup({ hits }) {
//   console.log(markup);
//   const markup = hits
//     .map(img => {
//       return `
//     <div>
//     <img src="${img.largeImageURL}" />
//     </div>`;
//     })
//     .join('');

//   newProxyElem.innerHTML = markup;
// }