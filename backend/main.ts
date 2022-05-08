// HTTP and CORS
import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

// Sorting
import { SortService, ISortOptions, Direction } from "https://deno.land/x/sort@v1.1.1/mod.ts"


const data = await Deno.readTextFile("data/cda-paintings-2022-04-22.de.json");
const bestData = JSON.stringify(getBestOf(data));
const sortedBestData = sortByNumber(JSON.parse(bestData));

function getBestOf(images: any) {
    let best = [];

    for (let img of JSON.parse(images).items) {
        if (img.isBestOf) {
            best.push(mapImgData(img))
        }
    }

    return best;
}

function mapImgData(img: any) {
    return {
        "title":            img.metadata.title,
        "preview":          img.images.overall.images[0].sizes.medium.src,
        "kind":             img.medium,
        "owner":            img.repository,
        "date":             img.metadata.date,
        "sortingNumber":    img.sortingNumber
    }    
}

function sortByNumber(images: any) {
    const sortOptions: ISortOptions[] = [
        { fieldName: 'sortingNumber', direction: Direction.ASCENDING }, 
    ]

    return SortService.sort(images, sortOptions)
}

const router = new Router();
router
  .get("/", async (context: any) => {
    context.response.body = sortedBestData;
  })

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 3000");
await app.listen({ port: 3000 });


// import { serve } from "https://deno.land/std@0.138.0/http/server.ts";

// function handler(req: Request): Response {
//     return new Response(bestData, {headers: {
//           'Access-Control-Allow-Origin': '*'
//         }});
//     // return new Response(document)
//   }

// // To listen on port 4242.
// serve(handler, { port: 3000 });