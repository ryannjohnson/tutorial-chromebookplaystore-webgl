import anime from 'animejs';
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

    // Meteorite assets will be used later during frame rendering.
    const radius = this.chromeoriteRadius = .5;
    this.chromeoriteTail = 28;
    this.chromeoriteSpeedX = (
      Math.sin(Math.PI / 4) * this.chromeoriteRadius * this.chromeoriteTail / 4
    );
    this.chromeoriteSpeedY = (
      Math.cos(Math.PI / 4) * this.chromeoriteRadius * this.chromeoriteTail / 4
    );
    this.meteoriteShape = new THREE.Shape();
    this.meteoriteShape.moveTo(0, 0);
    this.meteoriteShape.absarc(0, 0, radius * 2, 0, Math.PI, false);
    this.meteoriteShape.lineTo(0, -this.chromeoriteTail * radius);
    this.meteoriteShape.lineTo(radius * 2, 0);
    this.meteoriteGeometry = new THREE.ShapeBufferGeometry(
      this.meteoriteShape
    );
    const defaultMaterial = {
      color: new THREE.Color(0x000000),
      shininess: 0,
      emissiveIntensity: 1,
    };
    this.meteoriteMaterials = [
      new THREE.MeshPhongMaterial(Object.assign({}, defaultMaterial, {
        emissive: new THREE.Color(0x0d6fb5),
      })),
      new THREE.MeshPhongMaterial(Object.assign({}, defaultMaterial, {
        emissive: new THREE.Color(0xe52d2a),
      })),
      new THREE.MeshPhongMaterial(Object.assign({}, defaultMaterial, {
        emissive: new THREE.Color(0xfad900),
      })),
    ];

  }

  /**
   * Called once when all the assets are finished loading.
   */
  onLoad() {

    // Establish a new subset of properties.
    this.android.custom = {
      rotationSpeed: .002,
    }

    // Keep track of all alive Chromeorites here.
    this.chromeorites = new Array();

    /**
     * Called on every frame refresh (up to 60 fps on most screens).
     *
     * @param {number} timestamp - Milliseconds since page has loaded.
     * @return {void}
     */
    const renderFrame = function(timestamp) {

      // Like setTimeout, but waits for the next available browser
      // repaint.
      requestAnimationFrame(renderFrame);

      // Change the Android's local rotation by some fixed increment
      // every frame. Be aware that frames aren't always rendered for
      // various reasons (window is minimized), so it'll pick up
      // wherever it left off on the next render.
      this.android.rotation.y += parseFloat(this.android.custom.rotationSpeed);

      // Advance all the meteorites.
      for (let i = this.chromeorites.length - 1; i >= 0; i--) {
        const chromeorite = this.chromeorites[i];

        // The ones far out should be removed.
        const outY = chromeorite.position.y < -1000;
        const outX = chromeorite.position.x < -1000;
        if (outX || outY) {
          this.scene.remove(chromeorite);
          this.chromeorites.splice(i, 1);
          continue;
        }

        // A fixed amount works fine in 3d space.
        chromeorite.position.x -= this.chromeoriteSpeedX;
        chromeorite.position.y -= this.chromeoriteSpeedY;

      }

      // Should we spawn a chromeorite?
      if (Math.random() <= 0.2) {
        const material = chooseRandom(this.meteoriteMaterials);
        const chromeorite = new THREE.Mesh(this.meteoriteGeometry, material);
        const depth = Math.random();
        const angle = Math.random() * Math.PI / 2;
        const x = Math.sin(angle) * depth * 1000 + 300;
        const y = Math.cos(angle) * depth * 1000 + 300;
        chromeorite.position.set(x, y, depth * -2000 + 10);
        chromeorite.rotation.set(0, 0, Math.PI * .75);
        this.scene.add(chromeorite);
        this.chromeorites.push(chromeorite);
      }

      // Render the new frame.
      this.renderer.render(this.scene, this.camera);

    }.bind(this);

    // Set an animejs timeline for the body of the android. Animejs
    // changes values in relation to real-time, so even if some frames
    // aren't rendered in time, animejs will act as if they were and
    // skip ahead.
    anime({
      targets: this.androidGroup.position,
      z: 0,
      easing: 'easeInOutQuart',
      loop: true,
      direction: 'alternate',
      duration: 10000,
    });

    // It's important to render the first frame inside a
    // requestAnimationFrame call in order to avoid some startup lag.
    requestAnimationFrame(renderFrame);

  }

  /**
   * Fires when the user says so.
   */
  setTurbo(isEnabled) {
    anime.remove(this.android.custom);
    anime({
      targets: this.android.custom,
      rotationSpeed: isEnabled ? 0.1 : 0.002,
      easing: 'linear',
      duration: 1000,
    });
  }

}


/**
 * Helper to choose a random element of an array.
 */
function chooseRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}


/**
 * Helper to convert degrees to radians.
 */
function deg(degrees) {
  return Math.PI * degrees / 180;
}
