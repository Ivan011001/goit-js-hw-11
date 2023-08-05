import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '38601614-53dd37c61e051eba7000d3146';

let currentPage = 1;
const imagesPerPage = 40;
let currentSearchQuery = '';

async function fetchImages(query) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=38601614-53dd37c61e051eba7000d3146&q=cat&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=1`
    );
    currentPage += 1;

    return response.data.hits;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
};

function createIntersectionObserver() {
  const observer = new IntersectionObserver(async entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadMoreImages();
      }
    });
  }, observerOptions);

  observer.observe(target);
}

const target = document.querySelector('.load-more');
const galleryRef = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const inputRef = document.querySelector('input');
const formRef = document.querySelector('.search-form');
formRef.addEventListener('submit', async e => {
  e.preventDefault();

  if (!inputRef.value) {
    return Notiflix.Notify.failure('Your input is invalid');
  }

  currentSearchQuery = inputRef.value; // Store the current search query
  Notiflix.Block.standard('.main-wrapper', {
    position: 'center',
  });

  target.classList.remove('is-hidden');
  currentPage = 1;
  galleryRef.innerHTML = '';

  try {
    const imagesData = await fetchImages(currentSearchQuery);
    inputRef.value = '';
    if (imagesData.length === 0) {
      Notiflix.Block.remove('.main-wrapper');
      return Notiflix.Notify.failure('Sorry, there are no such images...');
    }

    Notiflix.Notify.success(
      'We have found some images for you! Scroll down to see all of them'
    );
    inputRef.value = '';
    renderGalleryMarkup(imagesData);
    Notiflix.Block.remove('.main-wrapper');
    lightbox.refresh();
    createIntersectionObserver();
  } catch (error) {
    console.warn(error.message);
  }
});

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
