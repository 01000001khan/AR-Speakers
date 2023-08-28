import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js';

let scene = new THREE.Scene();
let core = new THREE.Mesh();
scene.add(core);

const loader = new GLTFLoader();


let camera = new THREE.PerspectiveCamera(60, window.innerWidth/(window.innerHeight*0.5), 0.1, 1000 );
camera.position.z = 5;
camera.rotation.x = -Math.PI / 8;
camera.position.y = 2.5;

let renderer = new THREE.WebGLRenderer({antialias:true});

renderer.setClearColor("#000");

renderer.setSize( window.innerWidth, window.innerHeight * 0.5 );
renderer.setPixelRatio( window.devicePixelRatio );

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
// renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;


document.body.appendChild( renderer.domElement );



// LIGHT ////////////////

new RGBELoader().load( './assets/textures/leadenhall.hdr', function ( texture ) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;    
});

let speaker;
loader.load( './assets/models/decor/decorC1 render quality.glb', function ( gltf ) {
    let i = 0;
    speaker = gltf.scene;
	scene.add( speaker );
    speaker.position.set(i*separation, 0, -1);
    // speaker.traverse(function (child) {
    //     if (child.isMesh) {
    //         child.castShadow = true
    //     }
    // });

},undefined,function(error){console.error(error);});


const slider = document.getElementById("slider");

// Render Loop
function render() {

    let newframe = true;

    speaker.position.z = Math.sin(time)
    

    requestAnimationFrame( render );
    // Render the scene
    if (newframe){
        renderer.render(scene, camera);
    }
};


render();




addEventListener("resize", (e) => {
    camera.aspect = window.innerWidth/(window.innerHeight*0.5);
    renderer.setSize( window.innerWidth, window.innerHeight * 0.5 );
    camera.updateProjectionMatrix();
    console.log("rezised :P");
});


document.querySelector("canvas").appendTo(document.getElementById("stuff"));