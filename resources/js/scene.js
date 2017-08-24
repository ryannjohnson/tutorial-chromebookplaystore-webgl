const THREE = window.THREE = require('three');
require('../../node_modules/three/examples/js/modifiers/SubdivisionModifier');


export class SpaceDroidScene {

  /**
   * @param {DOM Element} element
   */
  constructor(element) {

    // We will use this reference to manipulate the DOM.
    this.rootElement = element;

    // Setup the WebGL scene.
    this.scene = new THREE.Scene();

    // Our camera points towards the origin straight-on.
    const aspectRatio = element.offsetWidth / element.offsetHeight;
    this.camera = new THREE.PerspectiveCamera(35, aspectRatio, 0.1, 1000);
    this.camera.position.set(0, 0, 35);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);

    // Our key light is at a 3/4 angle from our subject.
    this.directionalLight = new THREE.DirectionalLight(0xffffff, .75);
    this.directionalLight.position.set(-1, 1, 0);
    this.scene.add(this.directionalLight);

    // Our fill light normalizes the colors, making white 100% white.
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(this.ambientLight);

    // Inject to the DOM.
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(element.offsetWidth, element.offsetHeight);
    this.renderer.domElement.className = 'space-droid__canvas';
    this.renderer.domElement.style.opacity = 1;
    element.appendChild(this.renderer.domElement);

    // When loading external assets, this will help us know when
    // everything is loaded.
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onLoad = this.onLoad.bind(this);

    // Load the Android model by fetching it from the server.
    const loader = new THREE.ObjectLoader(this.loadingManager);
    loader.load("assets/android.json", object => {

      // Save a reference to the loaded android model.
      this.android = object;

      // Make materials here in three.js.
      const bodyMaterial = new THREE.MeshToonMaterial({
        color: new THREE.Color(0xa4ca39),
        shading: THREE.SmoothShading,
        shininess: 15,
      });
      const eyeMaterial = new THREE.MeshToonMaterial({
        color: new THREE.Color(0xffffff),
        emissive: new THREE.Color(0x333333),
        shading: THREE.SmoothShading,
      });

      // Will make our blocky model smooth by creating more verticies.
      // This is exactly how Blender would do it, except that it would
      // make `android.json` exponentially larger to download.
      const subdivider = new THREE.SubdivisionModifier(2);

      // Apply materials and subdivision to every piece of geometry
      // within the loaded model.
      for (let mesh of this.android.children) {
        subdivider.modify(mesh.geometry);
        switch(mesh.material.name) {

          // These names are what they were called in Blender prior to
          // export. We'll use them now to identify what their materials
          // should be.
          case 'lambert2SG':
            mesh.material = bodyMaterial;
            break;
          case 'lambert3SG':
            mesh.material = eyeMaterial;
            break;

        }
      }

      // Nest our android inside a new object so we can manipulate an
      // extra set of axes while the android spins on its own axes.
      this.androidGroup = new THREE.Object3D();
      this.androidGroup.position.set(0, -1, -200);
      this.androidGroup.rotation.set(deg(5), 0, deg(-45));
      this.androidGroup.add(this.android);
      this.android.position.set(0, -10, 0);
      this.android.rotation.set(Math.PI, 0, 0);
      this.scene.add(this.androidGroup);

    });

  }

  /**
   * Called once when all the assets are finished loading.
   */
  onLoad() {

    // Render a single frame.
    this.renderer.render(this.scene, this.camera);

  }

}


/**
 * Helper to convert degrees to radians.
 */
function deg(degrees) {
  return Math.PI * degrees / 180;
}
