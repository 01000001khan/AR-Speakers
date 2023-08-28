import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js';

let scene = new THREE.Scene();
let core = new THREE.Mesh();
scene.add(core);

const loader = new GLTFLoader();
let dt = 0;
let time = 0;



let camera = null;

let renderer = new THREE.WebGLRenderer({antialias:true});

renderer.setClearColor("#000");

renderer.setSize( window.innerWidth, window.innerHeight * 0.5 );
renderer.setPixelRatio( window.devicePixelRatio );

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
// renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 4;


document.body.appendChild( renderer.domElement );



// LIGHT ////////////////

new RGBELoader().load( './assets/textures/leadenhall.hdr', function ( texture ) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;    
});

let speaker = null;
loader.load( './assets/models/decor/decorC1 render quality.glb', function ( gltf ) {
    speaker = gltf.scene;
	scene.add( speaker );


    console.log(gltf.camera)
    console.log(gltf.cameras)
    camera = gltf.cameras[0];

},undefined,function(error){console.error(error);});


const slider = document.getElementById("slider");
let time = 0;
// Render Loop
function render(t) {

    let newframe = true;
    dt = t-time;
    time = t*.001; // Seconds instead of ms


    if (speaker){ // for some reason we have to check if it exists before referencing it otherwise ✨ everything breaks ✨ :D
        speaker.position.z = Math.sin(time) // test animation
    }

    requestAnimationFrame( render );

    // The actual render call
    if (newframe // stop rendering every frame to save performance when not moving
        && camera){ // doubles as a check to make sure the model's actually loaded

        renderer.render(scene, camera);
    }
}


render(0);




addEventListener("resize", (e) => {
    camera.aspect = window.innerWidth/(window.innerHeight*0.5);
    renderer.setSize( window.innerWidth, window.innerHeight * 0.5 );
    camera.updateProjectionMatrix();
    console.log("rezised :P");
});


document.getElementById("stuff").append(document.querySelector("canvas"));