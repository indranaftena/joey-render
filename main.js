import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CameraHelper } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Stats from 'stats.js';
const stats = new Stats();
stats.showPanel(0);
// document.body.appendChild(stats.dom);

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xd8d8d8);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 30);
const renderer = new THREE.WebGL1Renderer({
  canvas: document.querySelector('#bg')
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

camera.position.set(-7, 2, 10);

// lighting
const pointLight = new THREE.PointLight(0xffffff, 1, 20);
pointLight.position.set(2, 7, 2);
pointLight.castShadow = true;
const ambientLight = new THREE.AmbientLight(0x808080);
scene.add(pointLight, ambientLight);

// plane
const planeGeo = new THREE.PlaneGeometry(80, 16, 2, 2);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.receiveShadow = true;
const plane2 = plane.clone();
plane.rotateX(Math.PI * -0.5);
plane.position.set(-7, 0, 0);
plane2.position.set(-7, 8, -4);
scene.add(plane, plane2);

// object's position constants
const X_AXIS = 8;
const SPACE = -10;

// object material
const material = new THREE.MeshStandardMaterial({ color: 0xe9a580, transparent: true });

// group
const objectsGroup = new THREE.Object3D();

// floor
const floorGeo = new THREE.BoxGeometry(4, 0.2, 4);
const floor = new THREE.Mesh(floorGeo, material);
floor.position.set(0, 0.1, 0);
floor.castShadow = true;
floor.receiveShadow = true;
objectsGroup.add(floor);

// first wall
const wallOneGeo = new THREE.BoxGeometry(0.2, 3, 3);
const wallOne = new THREE.Mesh(wallOneGeo, material.clone());
wallOne.position.set(1.5, 1.6, 0);
wallOne.castShadow = true;
wallOne.receiveShadow = true;
objectsGroup.add(wallOne);

// second wall
const wallTwoGeo = new THREE.BoxGeometry(0.2, 3, 3);
const wallTwo = new THREE.Mesh(wallTwoGeo, material.clone());
wallTwo.position.set(-1.5, 1.6, 0);
wallTwo.castShadow = true;
wallTwo.receiveShadow = true;
objectsGroup.add(wallTwo);

// load gltf
async function loadObject(path) {
  const loader = new GLTFLoader();
  const data = await loader.loadAsync(path);
  const model = data.scene.children[2];
  model.castShadow = true;
  model.receiveShadow = true;
  console.log(model);
  // objectsGroup.add(model);
}
// loadObject('/house.glb');

// add group to scene
scene.add(objectsGroup);
objectsGroup.position.set(0, 0.4, 0);
const omega = Math.PI * 0.5 / 180;

// helper
// const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(100, 10);
// gridHelper.position.set(0, 0, 0);
// const shadowHelper = new CameraHelper( pointLight.shadow.camera );
// scene.add(lightHelper);

// orbit control
// const control = new OrbitControls(camera, renderer.domElement);

// raycasting
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let tempObject;
function onPointerMove(event) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

}
window.addEventListener('pointermove', onPointerMove);

// window resize handler
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

// limit fps
let clock = new THREE.Clock();
let delta = 0;
const interval = 1 / 20;

function animate() {
  requestAnimationFrame(animate);

  stats.begin();

  delta += clock.getDelta();

  if (delta > interval) {

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(objectsGroup.children, false);
    if (intersects.length > 0) {
      if (tempObject) tempObject.object.material.opacity = 1.0;
      tempObject = intersects[0];
      intersects[0].object.material.opacity = 0.7;
    }
    else {
      if (tempObject) {
        tempObject.object.material.opacity = 1.0;
        tempObject = null;
      }
    }

    objectsGroup.rotateY(omega);

    // control.update();

    renderer.render(scene, camera);

    delta = delta % interval;
  }

  stats.end();
}
animate();
// renderer.render(scene, camera);