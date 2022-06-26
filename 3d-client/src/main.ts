import './style.css'

import CONFIG from './config.json'

// Call Util Functions
import { calcSize }     from './utils/calcSize';
import { fetchImages }  from './utils/fetchImages';

import * as THREE from 'three';

const images = await fetchImages().then(data => {return data});

/* =======================================
basic three.js setup
======================================= */
const app = document.querySelector<HTMLDivElement>('#app')!

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
function generate(data: any) {

  let positionX = -10;
  let positionZ = 10;
  let year = 0;

  data.forEach((elm: any) => {

    // set year

    const regex = /[+-]?\d+(\,\d+)?/g;
    const imgDate = String(elm.date).match(regex)!.map(function(v : string) { return Math.abs(parseInt(v)); }).slice(0, 1);

    if (imgDate[0] > year) {
      year = imgDate[0];
      // console.log(year);
    }

    // console.log(elm.date, elm.sortingNumber)

    // Sanatize Proxy Img String
    let imgProxy = elm.preview.replace('imageserver-2022', 'data-proxy/image.php?subpath=');
    let cubeColor = 0xFFFFFF;


    // Set Texture
    var paintingMaterial = [
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

    let boxSize = calcSize(elm.size);


    // Generate Painting
    // BoxGeometry expects width, height, depht
    const paintingGeometry = new THREE.BoxGeometry(boxSize.width, boxSize.height, boxSize.canvasDepth);
    const painting = new THREE.Mesh(paintingGeometry, paintingMaterial);

    // Generate Background

    const backgroundMaterial = new THREE.MeshBasicMaterial({ map: loader.load('../assets/stone-bg.jpg') });
    const backgroundGeometry = new THREE.BoxGeometry(CONFIG.maxHightWidthCube, CONFIG.maxHightWidthCube * 1.25, CONFIG.canvasDepth * 4);
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);

    // Map Data to Element
    painting.userData = elm;

    // Set Paitning
    painting.rotation.y += 0.25;
    painting.position.y = 10;

    painting.position.x = positionX + CONFIG.maxHightWidthCube;

    painting.position.z = positionZ - CONFIG.maxHightWidthCube;


    // Set Backgournd
    background.rotation.y += 0.25;
    background.position.y = 10;

    background.position.x = (positionX + CONFIG.maxHightWidthCube);

    background.position.z = (positionZ - CONFIG.maxHightWidthCube) - CONFIG.canvasDepth * 2;

    // Calc Positon for next entrey
    positionX += CONFIG.maxHightWidthCube;
    positionZ -= CONFIG.maxHightWidthCube;

    const imgGroup = new THREE.Group();
    imgGroup.add( painting );
    imgGroup.add( background );

    scene.add(imgGroup);
  });

}

generate(images)

console.log(scene.children);


/* =======================================
scroll animation
======================================= */
document.body.onwheel = moveCamera;

function moveCamera(event: any) {
  let scrollX = event.deltaY * -0.1;
  let scrollZ = event.deltaY * 0.1;

  camera.position.x += scrollX;
  camera.position.z += scrollZ;
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

var INTERSECTED: any, LASTINTERSECTED: any;

var raycaster = new THREE.Raycaster(); // create once
var mouse = new THREE.Vector2(); // create once

// when the mouse moves, call the given function
document.addEventListener( 'mousemove', onDocumentMouseMove, false );

function onDocumentMouseMove(event: any) {
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();
	
	// update the mouse variable
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  imgHover();
}

function imgHover() {
	// find intersections
  var intersects = raycaster.intersectObjects(scene.children);

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
		}
	} 
	else {
		// reset rotation on leaf
		if (INTERSECTED) {
      INTERSECTED.children[0].rotation.y = .25;
      INTERSECTED.children[1].rotation.y = .25;
    }
	
		INTERSECTED = null;
	}
}