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
let YEAR = 0;


console.log(images);


/* =======================================
basic three.js setup
======================================= */
const app = document.querySelector<HTMLDivElement>('#app')!
const appInfo = document.querySelector<HTMLDivElement>('#info')!

app.innerHTML = `
  <canvas id="tour"></canvas>
`

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const loader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#tour'),
});

scene.background = new THREE.Color( 0x111111 );

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
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

  console.log(position);
  

  let positionX = position.x - CONFIG.maxHightWidthCube;
  let positionY = 40;
  let positionZ = position.z + CONFIG.maxHightWidthCube;
  
  data.forEach((elm: any) => {
    
    // console.log(elm);
    

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
    let backgroundMaterial = new THREE.MeshBasicMaterial({ map: loader.load('../assets/stone-bg.jpg')});
    if (image.references.length > 0 && timeBeam)
      backgroundMaterial = new THREE.MeshBasicMaterial({ map: loader.load('../assets/stone-bg.jpg'), color: 0x95a5a6 })
    const backgroundGeometry = new THREE.BoxGeometry(CONFIG.maxHightWidthCube, CONFIG.maxHightWidthCube * 1.25, CONFIG.canvasDepth * 4);
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);

    // Map Data to Element
    painting.userData = image;
    painting.userData.destroyable = destroyable;

    if (timeBeam && image.references.length > 0)
      painting.userData.allowReference = true;
    else
      painting.userData.allowReference = false;

    // Set Paitning
    painting.rotation.y += 0.25;
    painting.position.y = positionY;

    painting.position.x = positionX + CONFIG.maxHightWidthCube;
    painting.position.z = positionZ - CONFIG.maxHightWidthCube;

    // Set Backgournd
    background.rotation.y += 0.25;
    background.position.y = positionY;

    background.position.x = (positionX + CONFIG.maxHightWidthCube);
    background.position.z = (positionZ - CONFIG.maxHightWidthCube) - CONFIG.canvasDepth * 2;

    if (timeBeam) {
      // set posion for last background
      LASTPOSX = background.position.x;
    }
    
    const imgGroup = new THREE.Group();
    imgGroup.add( painting );
    imgGroup.add( background );
    
    // Add Year if counter goes up
    if (imgDate[0] > YEAR) {
      YEAR = imgDate[0];

      // Add Year Label
      let label = createYearLabel(`${YEAR}`, { fontsize: 25 });
      label.position.set(positionX + 12, -5, positionZ + 2);
      scene.add(label);
    }

    scene.add(imgGroup);
}

/* =======================================
scroll animation
======================================= */
document.body.onwheel = moveCamera;

camera.position.x = 13;
camera.position.z = 12;

function moveCamera(event: any) {
  let scrollX = event.deltaY * -0.1;
  let scrollZ = event.deltaY * 0.1;

  if (camera.position.x + scrollX > 0 && camera.position.x + scrollX < LASTPOSX+10) {
    camera.position.x += scrollX;
    camera.position.z += scrollZ;
  }
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
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  imgHover();
}

/* =======================================
image rotation
======================================= */
let INTERSECTED: any, LASTINTERSECTED: any;

function imgHover() {
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
	if (intersects.length > 0) {

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
on click references
======================================= */
document.addEventListener( 'click', onDocumentClick, false );

function onDocumentClick(event: any) {
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();
	
	// update the mouse letiable
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


	// find intersections
  let img = scene.children.filter(elm => {
    if (elm.constructor.name === 'Group') 
      return elm
  });
  
  let intersects = raycaster.intersectObjects(img);
  let hasReference = false;
  let isDestroyable = false;

  if (!(Object.keys(intersects).length === 0) && intersects.length > 0) {
    hasReference = intersects[0].object.parent?.children[0].userData.allowReference;
    isDestroyable = intersects[0].object.parent?.children[0].userData.destroyable;

    if (isDestroyable)
      return;
  }
  
  if (intersects.length == 0 && !hasReference && isDestroyable) {
    destroyReferences();
    camera.position.y = 10;
  } else if ( !(Object.keys(intersects).length === 0) && intersects[0].object.parent?.children[0].userData.references.length > 0 && hasReference && !isDestroyable) {
    destroyReferences();
    
    let references = intersects[0].object.parent?.children[0].userData.references;
    let referencesIds = '';

    references.forEach((ref: any, i : number) => {
      referencesIds += ref.inventoryNumber;

      if (i < references.length - 1)
        referencesIds += '&';
    });

    camera.position.y = 40;
    generateReference(referencesIds, intersects[0].object.parent?.children[0].position);

    console.log(intersects[0].object.parent?.children[0].position);
    
  } else {
    destroyReferences();
    camera.position.y = 10;
  }
}