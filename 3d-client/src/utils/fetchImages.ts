import CONFIG from '../config.json'

export async function fetchImages(search: string = '') {
    const headers = {
      'Access-Control-Allow-Origin': '*',
    }

    if (search === '') {
      const response = await fetch(CONFIG.fetchURL, {
        mode: 'cors',
        headers,
        method: 'GET'
      })
  
      const data = await response.json()
    
      return data;
    } else {
      const response = await fetch(CONFIG.searchURL + search, {
        mode: 'cors',
        headers,
        method: 'GET'
      })
  
      const data = await response.json()
    
      return data;
    }
   }