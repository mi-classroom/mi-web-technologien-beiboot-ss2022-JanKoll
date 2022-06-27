import CONFIG from '../config.json'

export async function fetchImages() {
    const headers = {
      'Access-Control-Allow-Origin': '*',
    }
  
    const response = await fetch(CONFIG.fetchURL, {
      mode: 'cors',
      headers,
      method: 'GET'
    })
  
    const data = await response.json()
  
    return data;
   }