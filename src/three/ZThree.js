import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import TWEEN from "three/examples/jsm/libs/tween.module.js";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
export default class ZThree {
  constructor(id) {
    this.id = id;
    this.el = document.getElementById(id);
  }
  // 初始化场景
  initThree() {
    let width = this.el.offsetWidth;
    let height = this.el.offsetHeight;
    // 创建场景
    this.scene = new THREE.Scene();
    // 使用 PMREMGenerator 生成预过滤环境贴图（替代直接 RGBELoader → scene.environment）
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('textures/hausdorf_clear_sky_2k.hdr', (texture) => {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileEquirectangularShader();
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      this.scene.environment = envMap;
      // this.scene.background = envMap;
      texture.dispose();
    });
    
    // 初始化加载器
    this.textureLoader = new THREE.TextureLoader();
    // 创建相机
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    this.camera1 = new THREE.OrthographicCamera(width/-2, width/2, height/2, height/-2, 0.1, 1000);
    this.camera.position.set(50, 100, 100);
    this.camera.lookAt(0, 0, 0);
    
    //初始化渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.el.append(this.renderer.domElement);

    // this.gui = new GUI();

    window.addEventListener("resize", () => {
      this.camera.aspect = this.el.offsetWidth / this.el.offsetHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.el.offsetWidth, this.el.offsetHeight);

      if (this.cssRenderer) {
        this.cssRenderer.setSize(this.el.offsetWidth, this.el.offsetHeight);
      }
      // 后处理管线尺寸同步，避免 resize 后画面错位/模糊
      if (this.finalComposer) {
        this.finalComposer.setSize(this.el.offsetWidth, this.el.offsetHeight);
      }
    });
  }
  //辅助
  initHelper() {
    this.scene.add(new THREE.AxesHelper(100));
  }
  //控制器
  initOrbitControls() {
    //初始化控制器实例
    let controls = new OrbitControls(this.camera, this.renderer.domElement);
    // 开启阻尼效果，让相机在旋转后有一定的惯性
    controls.enableDamping = true;
    // 开启缩放功能
    controls.enableZoom = true;
    // 禁用自动旋转
    controls.autoRotate = false;
    // 设置自动旋转的速度
    controls.autoRotateSpeed = 0.5;
    // 开启平移功能
    controls.enablePan = true;

    // 限制缩放范围
    controls.minDistance = 0.01;
    controls.maxDistance = 100;
    // 调整缩放灵敏度
    controls.zoomSpeed = 1.5;
    // 限制垂直旋转范围
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2;
    
    // 将创建的控制对象赋值给this.controls，以便其他方法能够访问和使用这个控制对象
    this.controls = controls;
  }
  // 程序化天空（替代天空盒）
  initSky() {
    this.sky = new Sky();
    this.sky.scale.setScalar(450000);
    this.sky.position.y = 0; // 地平面高度，与场景地面 Y=0 对齐
    this.sky.renderOrder = -1; // 确保先渲染天空
    this.sky.material.depthWrite = false; // 不写入深度，避免遮挡模型
    this.scene.add(this.sky);

    const uniforms = this.sky.material.uniforms;
    uniforms['turbidity'].value = 3;       // 浑浊度（1~20，越小越晴朗）
    uniforms['rayleigh'].value = 0.5;      // 瑞利散射（天空蓝色强度）
    uniforms['mieCoefficient'].value = 0.005;
    uniforms['mieDirectionalG'].value = 0.8;

    const sun = new THREE.Vector3();
    const phi = THREE.MathUtils.degToRad(90 - 25); // 太阳仰角 25°
    const theta = THREE.MathUtils.degToRad(160);   // 太阳方位
    sun.setFromSphericalCoords(1, phi, theta);
    uniforms['sunPosition'].value.copy(sun);
  }
  // 更新天空太阳位置
  setSunPosition(elevation, azimuth) {
    if (!this.sky) return;
    const sun = new THREE.Vector3();
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    this.sky.material.uniforms['sunPosition'].value.copy(sun);
  }
  //灯光
  initLight() {
    // 半球光：天空色 + 地面色，均匀照亮整个场景
    const hemisphereLight = new THREE.HemisphereLight(
      0xddeeff, // 天空颜色（淡蓝白）
      0x8899aa, // 地面颜色（灰蓝）
      0.6       // 强度
    );
    this.scene.add(hemisphereLight);
  }

  loaderModel(option) {
    // console.log(option);
    
    switch (option.type) {
      case "gltf":
      case "glb":
        if (!this.gltfLoader) {
          this.gltfLoader = new GLTFLoader();
          let dracoLoader = new DRACOLoader();
          dracoLoader.setDecoderPath("draco/");
          this.gltfLoader.setDRACOLoader(dracoLoader);
        }
        this.gltfLoader.load(
          option.url,
          option.onLoad,
          option.onProgress,
          option.onError
        );
        break;

      default:
        break;
    }
  }

  //加载模型
  iterateLoad(objFileList, onProgress, onAllLoad) {
    let fileIndex = 0;
    let that = this;

    function iterateLoadForIt() {
      that.loaderModel({
        type: objFileList[fileIndex].type,
        url: objFileList[fileIndex].url,
        onLoad: function (object) {
          if (objFileList[fileIndex].onLoad) {
            objFileList[fileIndex].onLoad(object);
          }
          fileIndex++;
          if (fileIndex < objFileList.length) {
            iterateLoadForIt();
          } else {
            if (onAllLoad) {
              onAllLoad();
            }
          }
        },
        onProgress: function (xhr) {
          if (objFileList[fileIndex].onProgress) {
            objFileList[fileIndex].onProgress(xhr, fileIndex);
          }
          if (onProgress) {
            onProgress(xhr, fileIndex);
          }
        },
      });
    }
    iterateLoadForIt();
  }

  // 鼠标射线
  // 初始化射线
  initRaycaster(callback, models = this.scene.children, eventName = "click") {
    this._rayFns = this._rayFns || {};
    // 先销毁同类型旧监听，防止重复绑定
    if (this._rayFns[eventName]) {
      this.el.removeEventListener(eventName, this._rayFns[eventName]);
    }
    this.raycaster = new THREE.Raycaster();
    const rayFn = this.rayEventFn.bind(this, models, callback);
    this._rayFns[eventName] = rayFn;
    this.el.addEventListener(eventName, rayFn);
  }

  rayEventFn(models, callback) {
    let evt = window.event;
    let mouse = {
      x: (evt.clientX / window.innerWidth) * 2 - 1,
      y: -(evt.clientY / window.innerHeight) * 2 + 1,
    };

    let activeObj = this.fireRaycaster(mouse, models);
    if (callback) {
      callback(activeObj, this, evt, mouse);
    }
  }
  //删除文本标签
  destroyRaycaster(eventName) {
    this._rayFns = this._rayFns || {};
    if (this._rayFns[eventName]) {
      this.el.removeEventListener(eventName, this._rayFns[eventName]);
      delete this._rayFns[eventName];
    }
    this.raycaster = null;
  }

  // 返回选中物体
  fireRaycaster(pointer, models) {
    if (!this.raycaster) return false;
    // 使用一个新的原点和方向来更新射线
    this.raycaster.setFromCamera(pointer, this.camera);
    let intersects = this.raycaster.intersectObjects(models, true);
    //
    if (intersects.length > 0) {
      let selectedObject = intersects[0];
      return selectedObject;
    } else {
      return false;
    }
  }

  // 获取传入模型模型的世界坐标
  getModelWorldPosition(model) {
    this.scene.updateMatrixWorld(true);
    const worldPosition = new THREE.Vector3();
    model.getWorldPosition(worldPosition);
    return worldPosition;
  }

  //相机跳转
  flyTo(option) {
    option.position = option.position || [];
    option.controls = option.controls || [];
    option.duration = option.duration || 1000;
    option.easing = option.easing || TWEEN.Easing.Linear.None;
    if (this._flyTween) {
      this._flyTween.stop();
      this._flyTween = null;
    }
    const curPosition = this.camera.position;
    const curControls = this.controls.target;

    const tween = new TWEEN.Tween({
      x1: curPosition.x,
      y1: curPosition.y,
      z1: curPosition.z,
      x2: curControls.x,
      y2: curControls.y,
      z2: curControls.z,
    })
      .to(
        {
          x1: option.position[0],
          y1: option.position[1],
          z1: option.position[2],
          x2: option.controls[0],
          y2: option.controls[1],
          z2: option.controls[2],
        },
        option.duration
      )
      .easing(option.easing);

    tween.onStart(() => {
      this.controls.enabled = false;
      if (option.start instanceof Function) {
        option.start();
      }
    });
    tween.onUpdate((object) => {
      this.controls.enabled = false;
      this.camera.position.set(object.x1, object.y1, object.z1);
      this.controls.target.set(object.x2, object.y2, object.z2);
      if (option.update instanceof Function) {
        option.update();
      }
    });
    tween.onComplete(() => {
      this._flyTween = null;
      this.controls.enabled = true;
      if (option.done instanceof Function) {
        option.done();
      }
    });
    tween.onStop(() => {
      this._flyTween = null;
      this.controls.enabled = true;
      if (option.stop instanceof Function) {
        option.stop();
      }
    });
    this._flyTween = tween;
    tween.start();
    return tween;
  }

  // 移动楼层
  modelMove(option, obj) {
    option.fromPosition = option.fromPosition || [];
    option.toPosition = option.toPosition || [];
    option.duration = option.duration || 1000;
    option.easing = option.easing || TWEEN.Easing.Linear.None;

    const curPosition = this.camera.position;
    const curControls = this.controls.target;

    const tween = new TWEEN.Tween({
      x1: option.fromPosition[0],
      y1: option.fromPosition[1],
      z1: option.fromPosition[2],
    })
      .to(
        {
          x1: option.toPosition[0],
          y1: option.toPosition[1],
          z1: option.toPosition[2],
        },
        option.duration
      )
      .easing(option.easing);

    tween.onStart(() => {
      this.controls.enabled = false;
      if (option.start instanceof Function) {
        option.start();
      }
    });
    tween.onUpdate((object) => {
      this.controls.enabled = false;
      obj.position.set(object.x1, object.y1, object.z1);
      if (option.update instanceof Function) {
        option.update();
      }
    });
    tween.onComplete(() => {
      this.controls.enabled = true;
      if (option.done instanceof Function) {
        option.done();
      }
    });
    tween.onStop(() => {
      this.controls.enabled = true;
      if (option.stop instanceof Function) {
        option.stop();
      }
    });
    tween.start();
    return tween;
  }

  render(callback) {
    callback();
    this.frameId = requestAnimationFrame(() => this.render(callback));
  }
}
