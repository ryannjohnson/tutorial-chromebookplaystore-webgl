import { SpaceDroidScene } from './scene';


const element = document.getElementById('space-droid');
if (element) {
  window.spaceDroidScene = new SpaceDroidScene(element);

  // Make our button for the turbo mode.
  const button = document.createElement('button');
  button.style.position = 'relative';
  button.style.zIndex = 10;
  button.textContent = 'Turbo';
  button.addEventListener('mousedown', e => {
    window.spaceDroidScene.setTurbo(1);
  });
  button.addEventListener('mouseup', e => {
    window.spaceDroidScene.setTurbo(0);
  });
  document.body.appendChild(button);

}
