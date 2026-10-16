import * as THREE from "three";
import TWEEN from 'three/examples/jsm/libs/tween.module.js';
import EventBus from "@/bus";
import robotIcon from '@/assets/image/robot.png';

// 初始化机器人廊道标记
export function initRobotMark(app) {
  // 找到机器人廊道
  let corridor = null;
  app.model.traverse((obj) => {
    if (!corridor && obj.name === '机器人廊道') {
      corridor = obj;
    }
  });
  if (!corridor) {
    console.warn('[robot] 未找到机器人廊道节点');
    return;
  }

  // 找到清灰机器人位置（跳转目标），默认隐藏
  let robotPos = null;
  app.model.traverse((obj) => {
    if (obj.name === '清灰机器人') {
      robotPos = new THREE.Vector3();
      obj.getWorldPosition(robotPos);
      app.robotModel = obj;
      obj.visible = false; // 未进入模块时隐藏
    }
  });

  // 收集名字含"输灰管"的节点，进入模块时隐藏
  app.robotPipes = [];
  app.model.traverse((obj) => {
    if (obj.name && obj.name.indexOf('支撑') > -1) {
      app.robotPipes.push(obj);
    }
  });

  // 找到"进退键"空物体节点（go/back 动画驱动的节点）
  app.robotMoveNode = null;
  app.model.traverse((obj) => {
    if (!app.robotMoveNode && obj.name === '进退键') {
      app.robotMoveNode = obj;
    }
  });

  // 进退键 motion 配置：零点(go起点)↔终点(go末帧) 往复，移动13秒+两端停2秒
  const goClip = (app.animations || []).find(a => a.name === 'go');
  if (app.robotMoveNode && goClip) {
    const se = getClipStartEndPos(goClip);
    if (se) {
      const goStart = new THREE.Vector3(se.start.x, se.start.y, se.start.z);
      const goEnd = new THREE.Vector3(se.end.x, se.end.y, se.end.z);
      app._robotMotionCfg = {
        node: app.robotMoveNode,
        endpoints: [goEnd, goStart],
        zero: goStart.clone(),
        moveDuration: 13000, // 单程零点至终点 13 秒
        holdDuration: 2000,  // 两端停留 2 秒
        stateKey: '_robotState',
        tweenKey: '_robotTween',
        holdKey: '_robotHoldTimer',
        doneEvent: 'robotBackDone',
        states: { moving: 'go', stopping: 'back', idle: 'idle' },
        getCurrent: (n) => n.position.clone(),
        apply: (n, f, t, v) => n.position.lerpVectors(f, t, v),
        distance: (a, b) => a.distanceTo(b),
      };
    }
  }

  // ===== 初始化摆动系统（左右键 / 起伏键） =====
  // 左右键：右端(left第1帧)↔左端(left第270帧) 往复，移动23秒+两端停2秒
  const swingNode = findNode(app.model, '左右键');
  const rightClip = (app.animations || []).find(a => a.name === 'right');
  const leftClip = (app.animations || []).find(a => a.name === 'left');
  if (swingNode && rightClip && leftClip) {
    const zeroQ = getClipRotationAtFrame(rightClip, 0);   // 零位 = right首帧 = left末帧
    const rightQ = getClipRotationAtFrame(leftClip, 0);   // 右端 = left第1帧
    const leftQ = getClipRotationAtFrame(leftClip, 270);  // 左端 = left第270帧
    if (zeroQ && rightQ && leftQ) {
      const zeroQuat = new THREE.Quaternion().fromArray(zeroQ);
      // 加大左右摆幅：左右键绕 X 轴旋转，相对零位将端点角度放大
      const SWING_AMPLIFY = 1.3;
      const zeroX = 2 * Math.atan2(zeroQuat.x, zeroQuat.w);
      const amplify = (q) => {
        const qx = 2 * Math.atan2(q.x, q.w);
        const newX = zeroX + (qx - zeroX) * SWING_AMPLIFY;
        const half = newX / 2;
        return new THREE.Quaternion(Math.sin(half), 0, 0, Math.cos(half));
      };
      const rightQuat = amplify(new THREE.Quaternion().fromArray(rightQ));
      const leftQuat = amplify(new THREE.Quaternion().fromArray(leftQ));
      app._robotSwingCfg = {
        node: swingNode,
        endpoints: [rightQuat, leftQuat],
        zero: zeroQuat,
        moveDuration: 23000, // 左端至右端 23 秒
        holdDuration: 2000,  // 两端停留 2 秒
        stateKey: '_robotSwingState',
        tweenKey: '_robotSwingTween',
        holdKey: '_robotSwingHold',
        doneEvent: 'robotSwingDone',
        states: { moving: 'swinging', stopping: 'returning', idle: 'idle' },
        getCurrent: (n) => n.quaternion.clone(),
        apply: (n, f, t, v) => n.quaternion.slerpQuaternions(f, t, v),
        distance: (a, b) => a.angleTo(b),
        // 从左往右（目标=右端，index偶数）到达零位即停；从右往左（目标=左端）走完周期再回零
        shouldStopNow: (cfg) => cfg.currentIndex % 2 === 0,
      };
    }
  }
  // 起伏键：起最大(up第120帧)↔伏最大(down第230帧) 往复，移动19秒+两端停2秒
  const bounceNode = findNode(app.model, '起伏键');
  const upClip = (app.animations || []).find(a => a.name === 'up');
  const downClip = (app.animations || []).find(a => a.name === 'down');
  if (bounceNode && upClip && downClip) {
    const zeroQ = getClipRotationAtFrame(upClip, 0);      // 零位 = up首帧
    const upQ = getClipRotationAtFrame(upClip, 119);      // 起最大 = up第120帧
    const downQ = getClipRotationAtFrame(downClip, 229);  // 伏最大 = down第230帧
    if (zeroQ && upQ && downQ) {
      const zeroQuat = new THREE.Quaternion().fromArray(zeroQ);
      const upQuat = new THREE.Quaternion().fromArray(upQ);
      const downQuat = new THREE.Quaternion().fromArray(downQ);
      app._robotBounceCfg = {
        node: bounceNode,
        endpoints: [upQuat, downQuat],
        zero: zeroQuat,
        moveDuration: 19000, // 一端至另一端 19 秒
        holdDuration: 2000,  // 两端停留 2 秒
        stateKey: '_robotBounceState',
        tweenKey: '_robotBounceTween',
        holdKey: '_robotBounceHold',
        doneEvent: 'robotBounceDone',
        states: { moving: 'swinging', stopping: 'returning', idle: 'idle' },
        getCurrent: (n) => n.quaternion.clone(),
        apply: (n, f, t, v) => n.quaternion.slerpQuaternions(f, t, v),
        distance: (a, b) => a.angleTo(b),
      };
    }
  }

  // 创建上下微动标记
  const texture = new THREE.TextureLoader().load(robotIcon);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.name = 'robotMark';
  corridor.getWorldPosition(sprite.position);
  sprite.position.y += 6;
  sprite.scale.set(4, 4, 1);
  app.scene.add(sprite);

  // 上下微动动画
  const baseY = sprite.position.y;
  let startTime = performance.now();
  const animate = () => {
    if (!sprite.parent) return;
    const t = (performance.now() - startTime) / 1000;
    sprite.position.y = baseY + Math.sin(t * 2) * 0.8;
    app._robotMarkFrameId = requestAnimationFrame(animate);
  };
  app._robotMarkFrameId = requestAnimationFrame(animate);

  // 点击标记跳转到清灰机器人
  app._robotMarkClick = (evt) => {
    if (!robotPos) return;
    // 标记不可见时（处于其他模块）不响应点击：
    // sprite.visible=false 只影响渲染，Raycaster 仍可能命中该精灵
    if (!sprite.visible) return;
    const mouse = new THREE.Vector2(
      (evt.clientX / window.innerWidth) * 2 - 1,
      -(evt.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, app.camera);
    const intersects = raycaster.intersectObjects([sprite], false);
    if (intersects.length > 0) {
      // 计算机器人包围盒中心作为旋转轴心
      let robotCenter = null;
      if (app.robotModel) {
        const box = new THREE.Box3().setFromObject(app.robotModel);
        robotCenter = box.getCenter(new THREE.Vector3());
      }
      // 调试对齐后的准确视角坐标
      app.flyTo({
        position: [4.97, -0.93, 5.54],
        controls: [5.28, -0.94, 5.05],
        done: () => {
          // 控制器以机器人中心为旋转轴，允许右键平移视角
          if (robotCenter) app.controls.target.copy(robotCenter);
          app.controls.enablePan = true;
        },
      });
      // 进入机器人视角：显示机器人模型，隐藏输灰管，隐藏侧边栏和控制按钮
      if (app.robotModel) app.robotModel.visible = true;
      setPipesVisible(app, false);
      EventBus.$emit('robotView', true);
    }
  };
  app.el.addEventListener('click', app._robotMarkClick);

  // 保存引用供后续显隐控制
  app.robotMarkSprite = sprite;

  // ===== 调试：手动调整左右/起伏最大值 =====
  // 查看当前端点：getRobotSwingEnds()
  window.getRobotSwingEnds = () => {
    const out = {};
    if (app._robotSwingCfg) {
      out.swingRight = Array.from(app._robotSwingCfg.endpoints[0].toArray()); // 右端
      out.swingLeft = Array.from(app._robotSwingCfg.endpoints[1].toArray());  // 左端
    }
    if (app._robotBounceCfg) {
      out.bounceUp = Array.from(app._robotBounceCfg.endpoints[0].toArray());   // 起最大
      out.bounceDown = Array.from(app._robotBounceCfg.endpoints[1].toArray()); // 伏最大
    }
    console.log('[robot] 当前摆动端点:', out);
    return out;
  };
  // 手动设置端点（quaternion 数组 [x,y,z,w]）：setRobotSwingEnds({ swingRight:[...], swingLeft:[...], bounceUp:[...], bounceDown:[...] })
  window.setRobotSwingEnds = (ends) => {
    if (ends.swingRight && app._robotSwingCfg) app._robotSwingCfg.endpoints[0] = new THREE.Quaternion().fromArray(ends.swingRight);
    if (ends.swingLeft && app._robotSwingCfg) app._robotSwingCfg.endpoints[1] = new THREE.Quaternion().fromArray(ends.swingLeft);
    if (ends.bounceUp && app._robotBounceCfg) app._robotBounceCfg.endpoints[0] = new THREE.Quaternion().fromArray(ends.bounceUp);
    if (ends.bounceDown && app._robotBounceCfg) app._robotBounceCfg.endpoints[1] = new THREE.Quaternion().fromArray(ends.bounceDown);
    console.log('[robot] 摆动端点已更新，可输入 getRobotSwingEnds() 确认');
  };

  // ===== 调试：手动对齐机器人视角 =====
  // 控制台输入 startRobotDebug() 飞到机器人附近开始调试
  window.startRobotDebug = () => {
    if (!robotPos) { console.warn('[robot] 未找到清灰机器人'); return; }
    app.flyTo({
      position: [4.81, -0.88, 5.93],
      controls: [5.29, -0.88, 5.05],
    });
    EventBus.$emit('robotView', true);
    console.log('[robot] 调试模式：拖动鼠标旋转/平移对齐视角后，输入 exportRobotView() 获取坐标');
  };
  // 控制台输入 exportRobotView() 输出当前相机视角坐标
  window.exportRobotView = () => {
    const p = app.camera.position;
    const t = app.controls.target;
    const pos = [Number(p.x.toFixed(2)), Number(p.y.toFixed(2)), Number(p.z.toFixed(2))];
    const target = [Number(t.x.toFixed(2)), Number(t.y.toFixed(2)), Number(t.z.toFixed(2))];
    console.log('[robot] camera position:', pos);
    console.log('[robot] controls target:', target);
    console.log(`flyTo({ position: [${pos.join(', ')}], controls: [${target.join(', ')}] })`);
    return { position: pos, controls: target };
  };
}

// 按名称在模型树中查找第一个节点
function findNode(model, name) {
  let found = null;
  model.traverse((obj) => {
    if (!found && obj.name === name) {
      found = obj;
    }
  });
  return found;
}

// 从动画clip读取位置轨道的首末帧坐标
function getClipStartEndPos(clip) {
  if (!clip) return null;
  const track = clip.tracks.find(t => t.name.includes('position'));
  if (!track || track.values.length < 3) return null;
  const n = track.values.length - 3;
  return {
    start: { x: track.values[0], y: track.values[1], z: track.values[2] },
    end: { x: track.values[n], y: track.values[n + 1], z: track.values[n + 2] },
  };
}

// 从动画clip读取旋转(quaternion)轨道指定帧的值
function getClipRotationAtFrame(clip, frameIndex) {
  if (!clip) return null;
  const track = clip.tracks.find(t => t.name.includes('quaternion'));
  if (!track) return null;
  const i = frameIndex * 4;
  if (i + 3 >= track.values.length) return null;
  return [track.values[i], track.values[i + 1], track.values[i + 2], track.values[i + 3]];
}

// ===== 通用往复运动引擎（端点到端点 + 端点停顿 + 停止时完成当前段后回零） =====
// cfg: { node, endpoints:[A,B], zero, moveDuration, holdDuration, stateKey, tweenKey, holdKey, doneEvent, states, getCurrent, apply }

// 开始往复运动
function motionStart(app, cfg) {
  app[cfg.stateKey] = cfg.states.moving;
  motionSegment(app, cfg, 0);
}

// 移动一段：endpoints[index % 2]
function motionSegment(app, cfg, index) {
  const node = cfg.node;
  if (!node) return;
  const from = cfg.getCurrent(node);
  const to = cfg.endpoints[index % 2];
  // 记录当前段起终点和索引，供停止时判断运动方向
  cfg.currentFrom = from;
  cfg.currentTo = to;
  cfg.currentIndex = index;
  const tween = new TWEEN.Tween({ t: 0 })
    .to({ t: 1 }, cfg.moveDuration)
    .easing(TWEEN.Easing.Linear.None)
    .onUpdate((o) => cfg.apply(node, from, to, o.t))
    .onComplete(() => {
      app[cfg.tweenKey] = null;
      // 到达端点，停顿2秒（铁律：无论是否停止中）
      app[cfg.holdKey] = setTimeout(() => {
        app[cfg.holdKey] = null;
        if (app[cfg.stateKey] === cfg.states.stopping) {
          motionReturnToZero(app, cfg);
          return;
        }
        if (app[cfg.stateKey] !== cfg.states.moving) return;
        motionSegment(app, cfg, index + 1);
      }, cfg.holdDuration);
    })
    .start();
  app[cfg.tweenKey] = tween;
}

// 从当前位置回零位
function motionReturnToZero(app, cfg) {
  const node = cfg.node;
  const from = cfg.getCurrent(node);
  const to = cfg.zero;
  const tween = new TWEEN.Tween({ t: 0 })
    .to({ t: 1 }, cfg.moveDuration)
    .easing(TWEEN.Easing.Linear.None)
    .onUpdate((o) => cfg.apply(node, from, to, o.t))
    .onComplete(() => {
      app[cfg.tweenKey] = null;
      app[cfg.stateKey] = cfg.states.idle;
      EventBus.$emit(cfg.doneEvent);
    })
    .start();
  app[cfg.tweenKey] = tween;
}

// 判断当前段是否朝零点方向运动（目标比起点更接近零点）
function isTowardZero(cfg) {
  if (!cfg.currentFrom || !cfg.currentTo || !cfg.distance) return false;
  const dFrom = cfg.distance(cfg.currentFrom, cfg.zero);
  const dTo = cfg.distance(cfg.currentTo, cfg.zero);
  return dTo < dFrom;
}

// 停止：shouldStopNow（或默认往零点方向）则立即回零；否则完成当前段到达端点并停顿2秒后回零
function motionStop(app, cfg) {
  if (app[cfg.stateKey] !== cfg.states.moving) return false;
  app[cfg.stateKey] = cfg.states.stopping;
  const stopNow = cfg.shouldStopNow ? cfg.shouldStopNow(cfg) : isTowardZero(cfg);
  if (stopNow) {
    // 立即回零，不用走完当前段
    if (app[cfg.tweenKey]) { app[cfg.tweenKey].stop(); app[cfg.tweenKey] = null; }
    if (app[cfg.holdKey]) { clearTimeout(app[cfg.holdKey]); app[cfg.holdKey] = null; }
    const cur = cfg.getCurrent(cfg.node);
    // 已在零位附近：直接停止，不再额外回零
    if (cfg.distance(cur, cfg.zero) < 0.001) {
      app[cfg.stateKey] = cfg.states.idle;
      EventBus.$emit(cfg.doneEvent);
      return true;
    }
    motionReturnToZero(app, cfg);
    return true;
  }
  // 否则走完当前段（到达端点）并停顿2秒后回零
  if (!app[cfg.tweenKey] && !app[cfg.holdKey]) {
    motionReturnToZero(app, cfg);
  }
  return true;
}

// 通用 toggle：第一次开始，第二次停止，停止中无效
function genericToggle(app, cfg) {
  if (!cfg || !cfg.node) return (cfg && cfg.states.idle) || 'idle';
  const cur = app[cfg.stateKey] || cfg.states.idle;
  if (cur === cfg.states.stopping) return cfg.states.stopping;
  if (cur === cfg.states.moving) {
    motionStop(app, cfg);
    return cfg.states.stopping;
  }
  motionStart(app, cfg);
  return cfg.states.moving;
}

// 进退键：第一次开始零↔终往复，第二次停止（完成当前段后回零）
export function toggleRobotGoBack(app) {
  return genericToggle(app, app._robotMotionCfg);
}

// 左右键：第一次开始往复摆动，第二次停止回零
export function toggleRobotSwing(app) {
  return genericToggle(app, app._robotSwingCfg);
}

// 起伏键：第一次开始起-伏循环，第二次停止回零
export function toggleRobotBounce(app) {
  return genericToggle(app, app._robotBounceCfg);
}

// 进入模块时重置左右键/起伏键到零点
export function resetRobotNodes(app) {
  if (app._robotSwingCfg && app._robotSwingCfg.node) {
    app._robotSwingCfg.node.quaternion.copy(app._robotSwingCfg.zero);
  }
  if (app._robotBounceCfg && app._robotBounceCfg.node) {
    app._robotBounceCfg.node.quaternion.copy(app._robotBounceCfg.zero);
  }
}

// 归零所有动作：停止动画 + 进退键回到零点 + 左右/起伏回零位
export function resetRobotAll(app) {
  stopRobotAnimations(app);
  const cfg = app._robotMotionCfg;
  if (cfg && cfg.node) cfg.node.position.copy(cfg.zero);
  resetRobotNodes(app);
}

// 停止模块内所有进退键/摆动/起伏动画
export function stopRobotAnimations(app) {
  ['_robotMotionCfg', '_robotSwingCfg', '_robotBounceCfg'].forEach((key) => {
    const cfg = app[key];
    if (cfg) {
      if (app[cfg.tweenKey]) {
        app[cfg.tweenKey].stop();
        app[cfg.tweenKey] = null;
      }
      if (app[cfg.holdKey]) {
        clearTimeout(app[cfg.holdKey]);
        app[cfg.holdKey] = null;
      }
      app[cfg.stateKey] = cfg.states.idle;
    }
  });
}

// 控制输灰管显隐
export function setPipesVisible(app, visible) {
  if (app.robotPipes) {
    app.robotPipes.forEach(p => { p.visible = visible; });
  }
}

// 控制机器人模型显隐
export function setRobotModelVisible(app, visible) {
  if (app.robotModel) {
    app.robotModel.visible = visible;
  }
}

// 控制标记显隐
export function setRobotMarkVisible(app, visible) {
  if (app.robotMarkSprite) {
    app.robotMarkSprite.visible = visible;
  }
}

// 销毁标记
export function destroyRobotMark(app) {
  if (app._robotMarkFrameId) {
    cancelAnimationFrame(app._robotMarkFrameId);
    app._robotMarkFrameId = null;
  }
  if (app._robotMarkClick) {
    app.el.removeEventListener('click', app._robotMarkClick);
    app._robotMarkClick = null;
  }
  if (app.robotMarkSprite) {
    app.scene.remove(app.robotMarkSprite);
    app.robotMarkSprite.material.map.dispose();
    app.robotMarkSprite.material.dispose();
    app.robotMarkSprite = null;
  }
}
