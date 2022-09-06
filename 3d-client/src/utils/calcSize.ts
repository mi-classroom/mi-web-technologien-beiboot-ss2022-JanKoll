import CONFIG from '../config.json'

export function calcSize(dim : any) {
    let width = dim.cm.width / CONFIG.maxHightWidthCm * CONFIG.maxHightWidthCube;
    let height = dim.cm.height / CONFIG.maxHightWidthCm * CONFIG.maxHightWidthCube;
    let canvasDepth = CONFIG.canvasDepth;
  
    return {width, height, canvasDepth}
  }