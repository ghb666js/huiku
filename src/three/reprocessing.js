import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

// 后处理管线（已移除辉光）：渲染一次场景 → 边缘高亮(可选) → FXAA 抗锯齿
export function createReprocessing(app) {
  THREE.ColorManagement.enabled = false;

  const renderScene = new RenderPass(app.scene, app.camera);

  const finalComposer = new EffectComposer(app.renderer);
  finalComposer.addPass(renderScene);

  // 抗锯齿：后处理渲染到 render target 会丢失默认帧缓冲的 MSAA，需手动开启多重采样
  finalComposer.renderTarget1.samples = 2;
  finalComposer.renderTarget2.samples = 2;

  // 边缘高亮（默认关闭，有选中物体时在渲染循环中启用）
  const outlinePass = new OutlinePass(
    new THREE.Vector2(app.el.offsetWidth, app.el.offsetHeight),
    app.scene,
    app.camera
  );
  outlinePass.setSize(app.el.offsetWidth, app.el.offsetHeight);
  outlinePass.edgeStrength = 10;   // 粗细
  outlinePass.edgeGlow = 1.0;      // 发光
  outlinePass.edgeThickness = 4;   // 光晕粗
  outlinePass.pulsePeriod = 1;     // 闪烁
  outlinePass.usePatternTexture = false;
  app.selectedObjects = [];
  outlinePass.selectedObjects = app.selectedObjects;
  outlinePass.visibleEdgeColor.set('#ff0000');
  outlinePass.hiddenEdgeColor.set('#ff0000');
  outlinePass.enabled = false;
  app.outlinePass = outlinePass;
  finalComposer.addPass(outlinePass);

  // FXAA 边缘抗锯齿（放在最后一环）
  const fxaaPass = new ShaderPass(FXAAShader);
  const pixelRatio = app.renderer.getPixelRatio();
  fxaaPass.material.uniforms['resolution'].value.x = 1 / (app.el.offsetWidth * pixelRatio);
  fxaaPass.material.uniforms['resolution'].value.y = 1 / (app.el.offsetHeight * pixelRatio);
  finalComposer.addPass(fxaaPass);
  app.fxaaPass = fxaaPass;

  app.finalComposer = finalComposer;
  return finalComposer;
}
