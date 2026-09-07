import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

export function createReprocessing(app) {
  THREE.ColorManagement.enabled = false;99

  app.bloomLayer = new THREE.Layers();
  app.bloomLayer.set(1);

  const renderScene = new RenderPass(app.scene, app.camera);

  // 辉光
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(app.el.offsetWidth, app.el.offsetHeight),
    1.5,
    0.4,
    0.85
  );
  const bloomParams = {
    exposure: 0.195, // 整个渲染结果的亮度
    bloomThreshold: 0.164, //用于确定哪些像素将被认为是辉光的一部分
    bloomStrength: 0.852, // 这是辉光的强度参数，可以控制辉光的明亮程度。较高的值会使辉光更加明亮。
    bloomRadius: 0.5 //这是辉光效果的半径参数
  };
  bloomPass.threshold = bloomParams.bloomThreshold;
  bloomPass.strength = bloomParams.bloomStrength;
  bloomPass.radius = bloomParams.bloomRadius;

  const bloomComposer = new EffectComposer(app.renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture }
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {

          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

        }
      `,
      fragmentShader: `
        uniform sampler2D baseTexture;
        uniform sampler2D bloomTexture;

        varying vec2 vUv;

        void main() {

          gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

        }
      `,
      defines: {}
    }),
    'baseTexture'
  );
  finalPass.needsSwap = true;

  const finalComposer = new EffectComposer(app.renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(finalPass);

  // 抗锯齿：后处理渲染到 render target 会丢失默认帧缓冲的 MSAA，需手动开启多重采样
  [bloomComposer, finalComposer].forEach(c => {
    c.renderTarget1.samples = 4;
    c.renderTarget2.samples = 4;
  });

  // FXAA 边缘抗锯齿（放在最后一环）
  const fxaaPass = new ShaderPass(FXAAShader);
  const pixelRatio = app.renderer.getPixelRatio();
  fxaaPass.material.uniforms['resolution'].value.x = 1 / (app.el.offsetWidth * pixelRatio);
  fxaaPass.material.uniforms['resolution'].value.y = 1 / (app.el.offsetHeight * pixelRatio);
  finalComposer.addPass(fxaaPass);
  app.finalComposer = finalComposer;

  // 边缘高亮
  const outlinePass = new OutlinePass(
    new THREE.Vector2(app.el.offsetWidth, app.el.offsetHeight),
    app.scene,
    app.camera
  );
  // 让 OutlinePass 分辨率与 canvas 一致（含像素比）
  outlinePass.setSize(app.el.offsetWidth, app.el.offsetHeight);

  const outlineParams = {
    edgeStrength: 10,
    edgeGlow: 1.0,
    edgeThickness: 4,
    pulsePeriod: 1
  };

  outlinePass.edgeStrength = outlineParams.edgeStrength; //粗
  outlinePass.edgeGlow = outlineParams.edgeGlow; //发光
  outlinePass.edgeThickness = outlineParams.edgeThickness; //光晕粗
  outlinePass.pulsePeriod = outlineParams.pulsePeriod; //闪烁
  outlinePass.usePatternTexture = false; //true
  app.selectedObjects = [];
  outlinePass.selectedObjects = app.selectedObjects;
  outlinePass.visibleEdgeColor.set('#ff0000');
  outlinePass.hiddenEdgeColor.set('#ff0000');
  app.outlinePass = outlinePass;
  bloomComposer.addPass(outlinePass);


  return bloomComposer;
}
