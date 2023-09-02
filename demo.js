// Consider reimplementing in Babylon.js, apparently it can look better and has superior AR support.



import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js';
import { EXRLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/EXRLoader.js';


// Three.js stuff
const loader = new GLTFLoader();
const eloader = new EXRLoader();

let scene = new THREE.Scene();
let core = new THREE.Mesh();
let renderer = new THREE.WebGLRenderer({antialias:true});
scene.add(core);



// My non-critical variables
const slider = document.getElementById("slider");
let lastSliderPos = -1;
let dt = 0;
let time = 0;
let inposition = false;
let camera = null;
let mixer = null;
let speaker = null;
let anim = null;
let animAction = null;
let aspectRatio = 16/9;



renderer.setClearColor("#000");

renderer.setSize( window.innerWidth, window.innerHeight * 0.5 );
renderer.setPixelRatio( window.devicePixelRatio );

renderer.shadowMap.enabled = false; // Don't need any realtime shadows. Everything is baked :)
//renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
// renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Optimally I'd like to use a custom tonemapping config, specifically https://github.com/bean-mhm/grace
renderer.toneMappingExposure = 3;



// // LIGHT ////////////////

// const light = new THREE.HemisphereLight( "#fff", 0x080820, 1 );
// scene.add( light );


new RGBELoader().load( './assets/textures/leadenhall.hdr', function ( texture ) {

    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

});

// let uniforms = {
//     colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
//     colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
// }

// let multMat =  new THREE.ShaderMaterial({
//     uniforms: uniforms,
//     fragmentShader: `
//         uniform vec3 colorA; 
//         uniform vec3 colorB; 
//         varying vec3 vUv;

//         void main() {
//             gl_FragColor = vec4(mix(colorA, colorB, vUv.x), 1.0);
//         }
//     `,
//     vertexShader: `
//         varying vec3 vUv; 

//         void main() {
//             vUv = position; 

//             vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
//             gl_Position = projectionMatrix * modelViewPosition; 
//         }
//     `
// })



window.meshes=[]
loader.load( './assets/models/decor/decorC1 render quality.glb', ( gltf ) => {

    
    speaker = gltf.scene;
    mixer = new THREE.AnimationMixer(speaker);

    anim = gltf.animations[0];
    anim.optimize();
    animAction = mixer.clipAction(anim);
    animAction.play();
    
    speaker.traverse( (child) => {
        if (child.isMesh) {
            child.material.envMap = scene.environment;
            meshes.push(child);


            
            if (child.name.includes("Plant")){
                // Sort all the foliage after the background
                child.renderOrder = 100;
            }

            if (child.name == "vase"){
                // And vase on top, though zwrite should work safely anyways given vase is full alpha
                child.renderOrder = 120;
                child.material = new THREE.MeshPhysicalMaterial({
                    roughnessMap: child.material.roughnessMap,
                    transmission: 1,
                    thickness: 1,
                    envMap: child.material.envMap
                });
                console.log("Vase", child)
            }

            if (child.name == "screen"){ // TV Screen

                const video = document.getElementById("video");
                video.onloadeddata = () => { video.play(); };

                const videoTexture = new THREE.VideoTexture(video);
                const videoMaterial = new THREE.MeshStandardMaterial({
                    color: 0x0,
                    emissive: 0xffffff,
                    emissiveMap: videoTexture,
                    emissiveIntensity: 1.2,
                    side: THREE.FrontSide,
                    toneMapped: true,
                    metalness: 0,
                    roughness: 1,
                    envMap: child.material.envMap
                });
                videoMaterial.needsUpdate = true;
                
                child.material = videoMaterial;
                console.log("TV", child);
            }
            
            if (child.name == "Bounce_Light_Area"){
                child.material = new THREE.MeshBasicMaterial({
                    map: eloader.load('./assets/textures/vaseDiffuse.exr'),
                    depthTest: true,
                    depthWrite: true,
                    transparent: true,
                    //blending: THREE.MultiplyBlending,
                });
                
                console.log("Vase Diffuse", child);
            }
            
            if (child.name == "Bounce_Light"){
                child.material = new THREE.MeshBasicMaterial({
                    map: eloader.load('./assets/textures/lampDiffuse.exr'),
                    depthTest: true,
                    depthWrite: true,
                    transparent: true,
                    //blending: THREE.MultiplyBlending,
                });
                
                console.log("Lamp Diffuse", child);
            }
        }
    });
    
    camera = gltf.cameras[0];
    camera.aspect = aspectRatio;
    
    scene.add(speaker);
    setWindow();
    render(0);

},undefined,function(error){console.error(error);});


// Recursive render Loop
function render(t) {
    
    requestAnimationFrame( render );    // Request the next frame before we've actually rendered
                                        // this one because js is weird and everything runs async.

    // dt = t*.001-time;
    // time = t*.001; // Seconds instead of ms
    
    // Consider adding reflection probe (cube camera in THREE) to the lamp, especially if reducing normal intensity or somethin'
    
    // Consider adding temporal antialiasing. Sample code here: 
    // https://git.ucsc.edu/jlao3/CMPM163Labs/-/blob/fc061ee35444d648b200a9a5fc83c32407a7c590/three.js-master/examples/webgl_postprocessing_taa.html
    // If !newframe, accumulate, otherwise render new frame
    

    let newframe = animAction.time != slider.value;
    if (camera){ // serves to make sure camera exists for render call, makes sure model is loaded and stuff initialized for DOM stuff
        if (newframe){
            setAnimTime(slider.value);
            renderer.render(scene, camera); // The actual render call
        }
    
        if (!inposition){
            document.getElementById("stuff").appendChild(renderer.domElement);
            inposition = true;
        }
    }
}

function setWindow(){
    renderer.setSize( window.innerWidth, window.innerWidth / aspectRatio );
    camera.updateProjectionMatrix();
    console.log("rezised :P");
}

addEventListener("resize", setWindow);


function setAnimTime(t){
    if ( mixer ){
        mixer.update( anim.duration + (t - animAction.time));
    }
}