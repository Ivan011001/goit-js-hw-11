import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '38601614-53dd37c61e051eba7000d3146';

export function searchImgByQuery(imgQuery) {
  return axios.get(
    `${BASE_URL}?key=${API_KEY}&q=${imgQuery}&image_type=photo&orientation=horizontal&safesearch=true`
  );
}
