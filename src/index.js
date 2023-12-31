import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import Notiflix, { Notify } from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38601614-53dd37c61e051eba7000d3146';

let currentPage = 1;
const imagesPerPage = 40;
let currentSearchQuery = '';
let totalImages = 0;
let totalPages = 0;

async function fetchImages(query) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${imagesPerPage}&page=${currentPage}`
    );

    totalImages = response.data.totalHits;
    totalPages = Math.ceil(totalImages / imagesPerPage);
    currentPage += 1;

    return response.data.hits;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

const target = document.querySelector('.load-more');

const observerOptions = {
  root: null,
  rootMargin: '0px 0px 1000px 0px',
  threshold: 0,
};
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && currentPage <= totalPages) {
    loadMoreImages();
  }
}, observerOptions);

const galleryRef = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const inputRef = document.querySelector('input');
const formRef = document.querySelector('.search-form');
formRef.addEventListener('submit', formSubmitHandler);

async function formSubmitHandler(e) {
  e.preventDefault();

  if (!inputRef.value.trim()) {
    return Notiflix.Notify.failure('Your input is invalid', {
      showOnlyTheLastOne: true,
    });
  }

  currentSearchQuery = inputRef.value.trim();
  Notiflix.Block.standard('.main-wrapper', {
    position: 'center',
  });

  totalImages = 0;
  totalPages = 0;
  currentPage = 1;
  galleryRef.innerHTML = '';
  observer.unobserve(target);

  try {
    const imagesData = await fetchImages(currentSearchQuery);
    inputRef.value = '';
    if (imagesData.length === 0) {
      Notiflix.Block.remove('.main-wrapper');
      return Notiflix.Notify.failure('Sorry, there are no such images...', {
        showOnlyTheLastOne: true,
      });
    }

    Notiflix.Notify.success(
      'We have found some images for you! Scroll down to see all of them',
      {
        showOnlyTheLastOne: true,
      }
    );

    // document.addEventListener('scroll', e => {
    //   let documentHeight = document.body.scrollHeight;
    //   let currentScroll = window.scrollY + window.innerHeight;

    //   if (currentScroll + 1 > documentHeight) {
    //     Notify.failure('Sorry, there are no more images to load...', {
    //       showOnlyTheLastOne: true,
    //     });
    //   }
    // });

    renderGalleryMarkup(imagesData);
    Notiflix.Block.remove('.main-wrapper');
    lightbox.refresh();
    observer.observe(target);
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
    const imagesData = await fetchImages(currentSearchQuery);
    renderGalleryMarkup(imagesData);
    lightbox.refresh();

    if (currentPage >= totalPages) {
      Notiflix.Notify.info('You have reached the last page.', {
        showOnlyTheLastOne: true,
      });
    }
  } catch (error) {
    console.warn(error.message);
  }
}
