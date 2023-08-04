import axios from 'axios';

let currentPage = 1;
const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '38601614-53dd37c61e051eba7000d3146';

export async function fetchImages(query, page, imagesPerPage) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: page,
        page: currentPage,
      },
    });
    currentPage += 1;

    return response.data.hits;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}
