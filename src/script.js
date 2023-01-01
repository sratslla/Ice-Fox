import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Texture Loaders
const textureLoader = new THREE.TextureLoader()

const grassColorTexture = textureLoader.load('/textures/grass/color.jpg')
const grassAmbientOcclusionTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg')
const grassRoughnessTexture = textureLoader.load('/textures/grass/roughness.jpg')
const grassHeightTexture = textureLoader.load('/textures/grass/height.jpg')

grassColorTexture.repeat.set(3, 3)
grassAmbientOcclusionTexture.repeat.set(3, 3)
grassNormalTexture.repeat.set(3, 3)
grassRoughnessTexture.repeat.set(3, 3)

grassColorTexture.wrapS = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping

grassColorTexture.wrapT = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping

// Models
const gltfLoader = new GLTFLoader()
var settings = {
    number: 2,
}
let mixer = null
gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        mixer = new THREE.AnimationMixer(gltf.scene)
        // const action = mixer.clipAction(gltf.animations[0])
        // const action1 = mixer.clipAction(gltf.animations[1])
        const action2 = mixer.clipAction(gltf.animations[settings.number])

        // action.play()
        // action1.play()
        action2.play()
        gltf.scene.position.y = 2
        gltf.scene.scale.set(0.007, 0.007, 0.007)
        scene.add(gltf.scene)
    },
)

gui.add(settings, 'number', { Stay: 0, Walk: 1, Run: 2 } )
/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.SphereGeometry(2),
    new THREE.MeshStandardMaterial({
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        displacementMap: grassHeightTexture,
        displacementScale: 10,
        roughnessMap: grassRoughnessTexture,
        aoMapIntensity: 3,
        roughness: 0
    })
)
floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2))
floor.receiveShadow = true
floor.rotation.z = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 2.9, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    floor.rotation.x = - elapsedTime * Math.PI * 0.25 * (settings.number)

    // update mixer
    if(mixer !== null){
        mixer.update(deltaTime)    
    }
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()