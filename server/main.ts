// HTTP and CORS
import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

// Sorting
import { SortService, ISortOptions, Direction } from "https://deno.land/x/sort@v1.1.1/mod.ts"

// .env
import { config } from "https://deno.land/x/dotenv/mod.ts";

const data = await Deno.readTextFile(config().DATA_JSON);
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
        "size":             parseInfoInNumbers(img.dimensions, img.images.overall.images[0].sizes.medium.dimensions, img.metadata.title),
        "kind":             img.medium,
        "owner":            img.repository,
        "artist":           img.involvedPersons[0].name,
        "date":             img.metadata.date,
        "sortingNumber":    img.sortingNumber,
        "references":       img.references

    }    
}

function parseInfoInNumbers(info : string, pxSize : any, title : any) {
    const regex = /[+-]?\d+(\,\d+)?/g;
    // let infoClean = info.replace('00e4', 'TEST').replace('00c4', '').replace('00fc', '').replace('00dc', '').replace('00f6', '').replace('00d6', '').replace('00df', '')
    // let infoClean : any;

    if (info.includes("Rahmen:")) {
        return returnInfo(info.match(/Rahmen:.*/gi)![0]);
        // infoClean.split('Rahmen:')[1]
    } else {
        return returnInfo(info);
    }
    // console.log(infoClean);
    
    function returnInfo(infoClean : any) {

        let cmSize = String(infoClean).match(regex)!.map(function(v : string) { return Math.abs(parseFloat(v.replace(',', '.'))); }).slice(0, 2);

        console.log({"title": title, "info": info, "infoClear": infoClean, "cm": cmSize});
        
        return {
            "cm":  {"height": cmSize[0],
                    "width": cmSize[1]},
            "px":  {"height": pxSize.height,
                    "width": pxSize.width},
        }
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

console.info("CORS-enabled web server listening on port " + parseInt(config().PORT));
await app.listen({ port: parseInt(config().PORT) });


// import { serve } from "https://deno.land/std@0.138.0/http/server.ts";

// function handler(req: Request): Response {
//     return new Response(bestData, {headers: {
//           'Access-Control-Allow-Origin': '*'
//         }});
//     // return new Response(document)
//   }

// // To listen on port 4242.
// serve(handler, { port: 3000 });