<script setup lang="ts">
import Card from '@/components/Card.vue'
</script>

<template>
  <main>
    <Card 
      v-for="(img, index) in data"
      :key="index"
      :img="img"></Card>
  </main>
</template>


<script lang="ts">
import { env } from '../env.js'

export default {
  name: 'Home',
  props: {
  },
  data () {
    return {
      data: Object,
    }
  },
  beforeMount () {
    this.getData();
  },
  methods: {
    async getData () {
      const headers = {
        'Access-Control-Allow-Origin': '*',
      }
      fetch(env.serverUrl, {
        mode: 'cors',
        headers,
        // method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          this.data = data
          // Set Img on startup
          // this.getImage(data[0].name)
        })
     }
  }
}
// import { env } from '../env'
// export default {
//   name: 'Home',
//   props: {
//   },
//   data () {
//     return {
//       data: Object,
//       currentImg: undefined,
//       currentImgData: undefined,
//       metaActive: false,
//       baseUrl: env.baseUrl,
//       search: ''
//     }
//   },
//   beforeMount () {
//     this.getData()
//   },
//   methods: {
//     async getData () {
//       const headers = {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*'
//       }
//       fetch(env.baseUrl, {
//         headers,
//         mode: 'cors'
//       })
//         .then(response => response.json())
//         .then(data => {
//           this.data = data
//           // Set Img on startup
//           // this.getImage(data[0].name)
//         })
//     },
//     async getSearch (parameter) {
//       if (parameter === undefined || parameter === '') {
//         this.getData()
//       } else {
//         const headers = {
//           'Content-Type': 'application/json',
//           'Access-Control-Allow-Origin': '*'
//         }
//         fetch(env.baseUrl + '/search/' + parameter, {
//           headers,
//           mode: 'cors'
//         })
//           .then(response => response.json())
//           .then(data => (this.data = data))
//       }
//     },
//     async getImage (image) {
//       const item = this.data.filter(function (elem) { if (elem.name === image) return elem })[0]
//       this.currentImgData = item
//       this.currentImg = item.children[0].children[0]
//     },
//     setImage (image) {
//       this.currentImg = image
//     }
//   }
// }
</script>
