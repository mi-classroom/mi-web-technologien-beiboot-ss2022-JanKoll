import CONFIG from '../config.json'

export async function fetchImages(search: string = '') {
  let url = CONFIG.fetchURL;

  if (search !== '')
    url = CONFIG.searchURL + search;

  const response = await fetch(url, {mode: 'cors', method: 'GET'})
    .catch((error) => {console.error(error)});

  return await response.json();
}