import './style.css'

import CONFIG from './config.json'

// Call Util Functions
import { calcSize }     from './utils/calcSize';
import { fetchImages }  from './utils/fetchImages';
import { createYearLabel } from './utils/createYearLabel';

import * as THREE from 'three';

const images = await fetchImages().then(data => {return data});

// Possiont of last Group Background
let LASTPOSX : number;
let YEAR : any = [];

const bottomSpace = 64;
let innerHeight = window.innerHeight - bottomSpace;


console.log(images);


/* =======================================
basic three.js setup
======================================= */
const app = document.querySelector<HTMLDivElement>('#app')!
const appInfo = document.querySelector<HTMLDivElement>('#info')!
const HTMLcurrentYear = document.querySelector<HTMLDivElement>('#current-year')!

app.innerHTML = `
  <canvas id="tour"></canvas>
`

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / innerHeight, 0.1, 1000);

const loader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#tour'),
});

scene.background = new THREE.Color( 0x111111 );

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, innerHeight);
camera.position.setX(5);
camera.position.setY(10);
camera.position.setZ(20);

renderer.render(scene, camera);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

/* =======================================
window resize
======================================= */
window.addEventListener('resize', windowResize, false);

function windowResize() {
  camera.aspect = window.innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize(window.innerWidth, innerHeight);
}

/* =======================================
generate canvas
======================================= */

generateGallery(images);


function generateGallery(data: any) {
  let positionX = -10;
  let positionY = 10;
  let positionZ = 10;
  
  data.forEach((elm: any) => {
    generatePlane(elm, positionX, positionY, positionZ);
    
    // Calc Positon for next entrey
    positionX += CONFIG.maxHightWidthCube;
    positionZ -= CONFIG.maxHightWidthCube;
  });
}

async function generateReference(ids: any, position: any) {
  const data = await fetchImages(ids).then(data => {return data});

  let positionX = position.x - CONFIG.maxHightWidthCube;
  let positionY = 40;
  let positionZ = position.z + CONFIG.maxHightWidthCube;
  
  data.forEach((elm: any) => {
    generatePlane(elm, positionX, positionY, positionZ, false, true);
    
    // Calc Positon for next entrey
    positionX += CONFIG.maxHightWidthCube;
    positionZ -= CONFIG.maxHightWidthCube;
  });
}

function destroyReferences() {
  let references = scene.children.filter(elm => {
    if (elm.constructor.name === 'Group' && elm.children[0].userData.destroyable) 
      return elm
  });

  references.forEach((ref: any) => {
    scene.remove(ref);
  });
}

function generatePlane(image : any, positionX : any, positionY : any, positionZ : any, timeBeam : boolean = true, destroyable : boolean = false) {
    // set year
    const regex = /[+-]?\d+(\,\d+)?/g;
    const imgDate = String(image.date).match(regex)!.map(function(v : string) { return Math.abs(parseInt(v)); }).slice(0, 1);    

    // Sanatize Proxy Img String
    let imgProxy = image.preview.replace('imageserver-2022', 'data-proxy/image.php?subpath=');
    let cubeColor = 0xFFFFFF;

    // Set Texture
    let paintingMaterial = [
      new THREE.MeshBasicMaterial({
        color: cubeColor //left
      }),
      new THREE.MeshBasicMaterial({
        color: cubeColor // right
      }),
      new THREE.MeshBasicMaterial({
        color: cubeColor // top
      }),
      new THREE.MeshBasicMaterial({
        color: cubeColor // bottom
      }),
      new THREE.MeshBasicMaterial({
        map: loader.load(imgProxy) //front
      }),
      new THREE.MeshBasicMaterial({
        color: cubeColor //back
      })
    ];

    let boxSize = calcSize(image.size);

    // Generate Painting
    // BoxGeometry expects width, height, depht
    const paintingGeometry = new THREE.BoxGeometry(boxSize.width, boxSize.height, boxSize.canvasDepth);
    const painting = new THREE.Mesh(paintingGeometry, paintingMaterial);

    // Generate Background
    let backgroundMaterial = new THREE.MeshBasicMaterial({ map: loader.load('../assets/stone-bg.jpg'), color: 0x666666 });
    if (destroyable)
      backgroundMaterial = new THREE.MeshBasicMaterial({ map: loader.load('../assets/stone-bg.jpg'), color: 0x806600 })
    let testMaterial = new THREE.MeshBasicMaterial({ map: loader.load('../assets/stone-bg.jpg'), color: 0xffcc00 })
    const backgroundGeometry = new THREE.BoxGeometry(CONFIG.maxHightWidthCube, CONFIG.maxHightWidthCube * 1.25, CONFIG.canvasDepth * 4);
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    
    const referenceGeometry = new THREE.SphereGeometry(1, 32, 16);
    const reference = new THREE.Mesh(referenceGeometry, testMaterial);

    reference.userData.allowReference = true;


    // Map Data to Element
    painting.userData = image;
    painting.userData.destroyable = destroyable;

    // if (timeBeam && image.references.length > 0)
    //   painting.userData.allowReference = true;
    // else
    //   painting.userData.allowReference = false;

    // Set Paitning
    painting.position.x = positionX + CONFIG.maxHightWidthCube;
    painting.rotation.y += 0.25;
    painting.position.y = positionY;
    painting.position.z = positionZ - CONFIG.maxHightWidthCube;

    // Set Backgournd
    background.position.x = (positionX + CONFIG.maxHightWidthCube);
    background.rotation.y += 0.25;
    background.position.y = positionY;
    background.position.z = (positionZ - CONFIG.maxHightWidthCube) - CONFIG.canvasDepth * 2;

    // Set Reference
    reference.position.y = positionY + 10;
    // reference.rotation.y += 0.25;
    reference.position.x = (positionX + CONFIG.maxHightWidthCube + 7.5);
    reference.position.z = (positionZ - CONFIG.maxHightWidthCube) - CONFIG.canvasDepth * 2;

    // console.log(reference.position);

    if (timeBeam) {
      // set posion for last background
      LASTPOSX = background.position.x;
    }
    
    const imgGroup = new THREE.Group();
    imgGroup.add( painting );
    imgGroup.add( background );

    if (timeBeam && image.references.length > 0)
      imgGroup.add( reference );

    // console.log(YEAR[YEAR.length-1].year);

    
    // Add Year if counter goes up
    if (YEAR.length == 0 || imgDate[0] > YEAR[YEAR.length-1].year) {
      YEAR.push({year: imgDate[0], position: {x: background.position.x, y: background.position.y, z: background.position.z}});

      // Add Year Label
      let label = createYearLabel(`${imgDate[0]-1}`, { fontsize: 25 });
      label.position.set(positionX + 12, -5, positionZ + 2);
      scene.add(label);
    }

    scene.add(imgGroup);
}

/* =======================================
scroll animation
======================================= */
document.body.onwheel = moveCamera;

let cameraXStart = 13;
let cameraZStart = 12;

camera.position.x = cameraXStart;
camera.position.z = cameraZStart;

function moveCamera(event: any) {
  let scrollX = event.deltaY * -0.1;
  let scrollZ = event.deltaY * 0.1;

  if (camera.position.x + scrollX > 0 && camera.position.x + scrollX < LASTPOSX+10) {
    updateCameraScrollPosition(camera.position.x + scrollX, camera.position.z + scrollZ);
    updateSliderMarker(camera.position.x);
  }
}

// // Update the current slider value (each time you drag the slider handle)
let yearSlider = document.getElementById("yearslider");
yearSlider?.addEventListener("input", moveSlider);

function moveSlider(this : any) {
  if (yearSlider != undefined) {
    yearSlider.max = LASTPOSX*10 - 100;
  }
  
  camera.position.x = cameraXStart + this.value * 0.1;
  camera.position.z = cameraZStart + (this.value * -0.1);
  
  setCurrentYear();
}

function updateSliderMarker(value : number) {
  if (yearSlider != undefined) {
    yearSlider.max = LASTPOSX * 10 - 100;
    yearSlider.value = value * 10;
  }
  setCurrentYear();
}

function updateCameraScrollPosition(X : number, Z : number) {
  camera.position.x = X;
  camera.position.z = Z;
}

let lastXPositon = 0;
let currentYear = YEAR[0];
HTMLcurrentYear.innerHTML = `${currentYear.year}`;

function setCurrentYear() {
  if (camera.position.x > lastXPositon) {
    lastXPositon = camera.position.x;

    if (currentYear.position.x < camera.position.x && currentYear.year < YEAR[YEAR.length-1].year) {
      currentYear = YEAR[YEAR.indexOf(currentYear) + 1];
    }
  } else {
    lastXPositon = camera.position.x;

    if (currentYear.position.x > camera.position.x && YEAR.indexOf(currentYear) > 0) {
      currentYear = YEAR[YEAR.indexOf(currentYear) - 1];
    }
  }

  // drwar year
  HTMLcurrentYear.innerHTML = `${currentYear.year}`;
}

/* =======================================
zoom animation
======================================= */
let zoomSlider = document.getElementById("zoomslider");
zoomSlider?.addEventListener("input", zoom);
let lastZoomPosition = 10;

function zoom(this : any) {
  if (zoomSlider != undefined) {
    if (zoomSlider.value > lastZoomPosition) {
      camera.zoom = zoomSlider.value * .1;
    } else {
      camera.zoom = zoomSlider.value * .1;
    }
    lastZoomPosition = zoomSlider.value;
  }
  
  camera.updateProjectionMatrix();
}



/* =======================================
animation loop
======================================= */
animate();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

/* =======================================
mouse over
======================================= */
let raycaster = new THREE.Raycaster(); 
let mouse = new THREE.Vector2();

// when the mouse moves, call the given function
document.addEventListener( 'mousemove', onDocumentMouseMove, false );

function onDocumentMouseMove(event: any) {
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();
	
	// update the mouse letiable
  if (event.clientY < window.innerHeight - bottomSpace) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    imgHover();
  } else {
    imgHover(false)
  }
}

/* =======================================
image rotation
======================================= */
let INTERSECTED: any, LASTINTERSECTED: any;

function imgHover(inRange : boolean = true) {
	// find intersections
  let img = scene.children.filter(elm => {
    if (elm.constructor.name === 'Group') 
      return elm
  });
  
  let intersects = raycaster.intersectObjects(img);
  
  // intersects = intersects.map(elm => elm.splice(-1, 1))

	// create a Ray with origin at the mouse position
  raycaster.setFromCamera(mouse, camera);

	// if there is one (or more) intersections
	if (intersects.length > 0 && inRange) {

		// if the closest object intersected is not the currently stored intersection object
		if (intersects[0].object != INTERSECTED) {
			// store parent (Object Group) as INTERSECTED
			INTERSECTED = intersects[ 0 ].object.parent;

      // overwrite rotation form last INTERSECTED
      if (LASTINTERSECTED && INTERSECTED != LASTINTERSECTED) {
        LASTINTERSECTED.children[0].rotation.y = .25;
        LASTINTERSECTED.children[1].rotation.y = .25;
      }

			LASTINTERSECTED = INTERSECTED

			// set rotation
			INTERSECTED.children[0].rotation.y = 0;
			INTERSECTED.children[1].rotation.y = 0;

      let imgData = INTERSECTED.children[0].userData;
      
      // drwar info
      appInfo.innerHTML = `
        <div>
          <h2>${imgData.title} (${imgData.date})</h2>
          <p><b>Artist: </b>${imgData.artist}</p>
          <p><b>Owner: </b>${imgData.owner}</p>
          <p><b>Kind: </b>${imgData.kind.replace(/\s\[.*?\]/g, '').replace(/\s\(.*?\)/g, '')}</p>
          <hr/>
          <p><i><b>Right click</b> on an image reveals it in the digital archive</i></p>
        </div>
      `
		}
	} 
	else {
		// reset rotation on leaf
		if (INTERSECTED) {
      INTERSECTED.children[0].rotation.y = .25;
      INTERSECTED.children[1].rotation.y = .25;
    }

    // delete info
    appInfo.innerHTML = ""
	
		INTERSECTED = null;
	}
}

/* =======================================
on left click references
======================================= */
document.addEventListener( 'click', onDocumentLeftClick, false );

function onDocumentLeftClick(event: any) {
  let cameraPos = {
    "x": camera.position.x,
    "y": camera.position.y,
    "z": camera.position.z
  }
  
  // camera.position;
  if (event.clientY > window.innerHeight - bottomSpace)
    return;

	// find intersections
  let img = scene.children.filter(elm => {
    if (elm.constructor.name === 'Group') 
      return elm
  });
  
  let intersects = raycaster.intersectObjects(img);
  let hasReference = false;

  if (!(Object.keys(intersects).length === 0) && intersects.length > 0) {
    intersects.forEach((elm: any) => {
      if (elm.object.userData.allowReference) {
        hasReference = true;
      }
    });
  }
  
  if (intersects.length == 0 && !hasReference) {
    destroyReferences();

    cameraPos.y = 10;
    smoothCameraMovement(cameraPos);
  } else if ( !(Object.keys(intersects).length === 0) && intersects[0].object.parent?.children[0].userData.references.length > 0 && hasReference) {
    destroyReferences();
    
    let references = intersects[0].object.parent?.children[0].userData.references;
    let referencesIds = '';

    references.forEach((ref: any, i : number) => {
      referencesIds += ref.inventoryNumber;

      if (i < references.length - 1)
        referencesIds += '&';
    });

    cameraPos.y = 40;
    smoothCameraMovement(cameraPos);

    generateReference(referencesIds, intersects[0].object.parent?.children[0].position);    
  } else {
    if (intersects[0].object.isObject3D) {
      let cameraTarget = {
        "x": intersects[0].object.position.x + 3,
        "y": intersects[0].object.position.y,
        "z": intersects[0].object.position.z + 22.5
      }
      smoothCameraMovement(cameraTarget);
    } 
  }
}

/* =======================================
on right click references
======================================= */
document.addEventListener( 'contextmenu', onDocumentRightClick, false );

function onDocumentRightClick(event: any) {

  if (event.clientY > window.innerHeight - bottomSpace)
    return;

  // Prevent the browser's context menu from appearing
  if(event.preventDefault != undefined)
    event.preventDefault();
  if(event.stopPropagation != undefined)
    event.stopPropagation();

	// find intersections
  let img = scene.children.filter(elm => {
    if (elm.constructor.name === 'Group') 
      return elm
  });
  
  let intersects = raycaster.intersectObjects(img);

  if (!(Object.keys(intersects).length === 0) && intersects.length > 0)
    window.open(`${CONFIG.cranachURL}${intersects[0].object.parent?.children[0].userData.inventoryNumber}`, '_blank')?.focus();
}

/* =======================================
smooth camera movement
======================================= */

function smoothCameraMovement(target: any, duration: number = 100) {
  let difX = calcPositionDiverence(camera.position.x, target.x);
  let difY = calcPositionDiverence(camera.position.y, target.y);
  let difZ = calcPositionDiverence(camera.position.z, target.z);

  let stepsX = difX.val / duration;
  let stepsY = difY.val / duration;
  let stepsZ = difZ.val / duration;

  for(let i = 0; i <= duration; i++) {
    setTimeout(() => {
      if (i != duration) {
      if (difX.bigger)
        camera.position.x += stepsX;
      else
        camera.position.x -= stepsX;

      if (difY.bigger)
        camera.position.y += stepsY;
      else
        camera.position.y -= stepsY;

      if (difZ.bigger)
        camera.position.z += stepsZ;
      else
        camera.position.z -= stepsZ;
      } else {
        camera.position.x = target.x;
        camera.position.y = target.y;
        camera.position.z = target.z;
      }
      updateSliderMarker(camera.position.x);
    }, i);
  }
}

function calcPositionDiverence(a: any, b: any) {
  if (a > b) {
    return {"val": a - b, "bigger": false};
  } else {
    return {"val": b - a, "bigger": true};
  }
}