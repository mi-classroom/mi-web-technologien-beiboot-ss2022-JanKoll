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
        "size":             parseInfoInNumbers(img.dimensions, img.images.overall.images[0].sizes.medium.dimensions),
        "kind":             img.medium,
        "owner":            img.repository,
        "artist":           img.involvedPersons[0].name,
        "date":             img.metadata.date,
        "sortingNumber":    img.sortingNumber,
        "references":       img.references,
        "inventoryNumber":  img.inventoryNumber
    }    
}

function parseInfoInNumbers(info : string, pxSize : any) {
    const regex = /[+-]?\d+(\,\d+)?/g;

    if (info.includes("Durchmesser")) {
        const cmDiameter = String(info).match(regex)!.map(function(v : string) { return Math.abs(parseFloat(v.replace(',', '.'))); }).slice(0, 1);
        const pxDiameter = Math.sqrt((Math.pow(pxSize.height, 2) + Math.pow(pxSize.width, 2)));
        const alpha = Math.asin(pxSize.height / pxDiameter);
        const cmHeight = cmDiameter[0] * Math.sin(alpha);
        const cmWidth = Math.sqrt((- Math.pow(cmHeight, 2) + Math.pow(cmDiameter[0], 2)));

        return returnInfo(`${String(cmHeight).replace('.', ',')} ${String(cmWidth).replace('.', ',')} cm`, pxSize);
    } else if (info.includes("Maße mit Rahmen:")) {
        return returnInfo(info.split('Maße mit Rahmen:')[1], pxSize);
    } else {
        return returnInfo(info, pxSize);
    }
}
    
function returnInfo(infoClean : any, pxSize: any) {
    const regex = /[+-]?\d+(\,\d+)?/g;
    let cmSize = String(infoClean).match(regex)!.map(function(v : string) { return Math.abs(parseFloat(v.replace(',', '.'))); }).slice(0, 2);

    return {
        "cm":  {"height": cmSize[0],
                "width": cmSize[1]},
        "px":  {"height": pxSize.height,
                "width": pxSize.width},
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
  .get("/bestof", async (context: any) => {
    context.response.body = sortedBestData;
  })
  .get("/find/:id", async (context: any) => {
    let found : any = [];

    JSON.parse(data).items.find((img: any) => {

        let ids = context?.params?.id.split('&');

        ids.forEach((id: any) => {
            if (img.metadata.id.includes(id)) {
                found.push(mapImgData(img));
            }
        });
    });

    if (found.length > 0) {
        context.response.body = found;
    } else {
        context.response.body = "Not found";
    }
  })

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port " + parseInt(config().PORT));
await app.listen({ port: parseInt(config().PORT) });