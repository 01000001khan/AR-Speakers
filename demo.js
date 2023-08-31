// Reimplement this in babylon.js later, apparently it can look better and has superior AR support.



import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js';

// Three.js stuff
const loader = new GLTFLoader();
let scene = new THREE.Scene();
let core = new THREE.Mesh();
let renderer = new THREE.WebGLRenderer({antialias:true});
scene.add(core);


// My non-critical variables
let dt = 0;
let time = 0;
let inposition = false;
let camera = null;
let mixer = null;
let speaker = null;
const slider = document.getElementById("slider");


renderer.setClearColor("#000");

renderer.setSize( window.innerWidth, window.innerHeight * 0.5 );
renderer.setPixelRatio( window.devicePixelRatio );

renderer.shadowMap.enabled = false; // Don't need any realtime shadows. Everything is baked :)
//renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
// renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 3;



// LIGHT ////////////////

const light = new THREE.HemisphereLight( "#fff", 0x080820, 1 );
scene.add( light );


new RGBELoader().load( './assets/textures/leadenhall.hdr', function ( texture ) {

    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

});

let uniforms = {
    colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
    colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
}

let multMat =  new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: `
        uniform vec3 colorA; 
        uniform vec3 colorB; 
        varying vec3 vUv;

        void main() {
            gl_FragColor = vec4(mix(colorA, colorB, vUv.x), 1.0);
        }
    `,
    vertexShader: `
        varying vec3 vUv; 

        void main() {
            vUv = position; 

            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition; 
        }
    `
})


loader.load( './assets/models/decor/decorC1 render quality.glb', function ( gltf ) {

    speaker = gltf.scene;
	scene.add( speaker );
    mixer = new THREE.AnimationMixer(speaker);

    window.speaker = speaker

    speaker.traverse(function (child) {
        if (child.isMesh) {
            child.material.envMap = scene.environment;

            if (child.name.includes("Plant")){
                child.renderOrder = 100;
            }

            if (child.name.includes("Bounce Light")){
                child.material = multMat;
            }
        }
    });

    camera = gltf.cameras[0];
    camera.aspect = 16/9;

    setWindow();

},undefined,function(error){console.error(error);});



// Recursive render Loop
function render(t) {
    
    requestAnimationFrame( render );    // Request the next frame before we're actually rendered
                                        // this one because js is weird and everything runs async.
                                        // Keeps the timing accurate
    let newframe = false;
    dt = t-time;
    time = t*.001; // Seconds instead of ms

    if ( mixer ){
        mixer.update( dt );
    }


    // if (camera){ // for some reason we have to check if it exists before referencing it otherwise ✨ everything breaks ✨ :D
    //     camera.position.x = Math.sin(time)*.3 // test animation
    //     newframe = true;
    // }

    

    // Consider adding reflection probe (cube camera in THREE) to the lamp, especially if reducing normal intensity or somethin'

    // Consider adding temporal antialiasing. Sample code here: 
    // https://git.ucsc.edu/jlao3/CMPM163Labs/-/blob/fc061ee35444d648b200a9a5fc83c32407a7c590/three.js-master/examples/webgl_postprocessing_taa.html

    
    if (newframe                        // stop rendering every frame to save performance when not moving
        && camera){                     // doubles as a check to make sure the model's actually loaded

        renderer.render(scene, camera); // The actual render call

        if (!inposition){
            document.getElementById("stuff").appendChild(renderer.domElement);
            inposition = true;
        }
    }
}

render(0);


// camera.aspect = 9/16; // Needs to be set in the function below if it will change
function setWindow(){
    renderer.setSize( window.innerWidth, window.innerWidth * 9/16 );
    camera.updateProjectionMatrix();
    console.log("rezised :P");
}

addEventListener("resize", setWindow);