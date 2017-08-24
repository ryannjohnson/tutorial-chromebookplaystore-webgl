import { SpaceDroidScene } from './scene';


const element = document.getElementById('space-droid');
if (element) {
  window.spaceDroidScene = new SpaceDroidScene(element);
}
