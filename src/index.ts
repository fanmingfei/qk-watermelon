import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { PhysicsSystem, Physics, PhysicsType } from '@eva/plugin-matterjs';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
import { ImgSystem } from '@eva/plugin-renderer-img';
import { Event, EventSystem } from '@eva/plugin-renderer-event';

import originRes from './resources';
import { FRUIT_RADIUS, GAME_HEIGHT, BODY_OPTIONS, CAN_USE_TYPE } from './CONST';
import createBackground from './gameObjects/createBackground';
import createGradePanel from './gameObjects/createGradePanel';
import createBackPanel from './gameObjects/createBackPanel';
import createWall from './gameObjects/createWall';
import { createFruit, randomFruit } from './gameObjects/createFruit';
import store from './store';
import { MaskSystem } from '@eva/plugin-renderer-mask';


const dom = document.querySelector('watermelon')
const names = dom.getAttributeNames()
const lvs = names.filter(name => name.indexOf('lv') === 0).map((name) => {
  return {
    lv: parseInt(name[2]),
    name: name,
    url: dom.getAttribute(name)
  }
}).sort((p, n) => {
  return p.lv > n.lv ? 1 : -1
})
const res = lvs.map((lv) => {
  return {
    name: lv.name,
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url: lv.url,
      },
    },
  }
})

resource.addResource(originRes);
resource.addResource(res);

if (lvs.length === 1) {
  alert('请设置1个以上等级')
}
if (lvs.length > 0) {
  CAN_USE_TYPE.length = 0
}

lvs.forEach((lv, i) => {
  FRUIT_RADIUS[lv.name] = {
    radius: 30 + (180 - 30) / (lvs.length - 1) * i,
    grade: 10 + (200 - 10) / (lvs.length - 1) * i,
    next: lvs[i + 1]?.name
  }
  if (i < lvs.length - 1) {
    CAN_USE_TYPE.push(lv.name)
  }
})
console.log(res, FRUIT_RADIUS)



document.body.style.margin = '0';
document.body.style.background = '#000';

const canvas = document.createElement('canvas')
document.body.append(canvas)
canvas.classList.add('qk-canvas')


if (window.innerWidth > window.innerHeight) {
  canvas.style.display = 'block'
  canvas.style.margin = '0 auto'
} else {
  canvas.style.width = '100%'
  canvas.style.height = 'auto'
}



document.body.addEventListener('touchmove', (e) => {
  e.preventDefault()
}, { passive: false })





const game = new Game({
  autoStart: true,
  frameRate: 70, // 兼容Eva自身bug, 帧率必须大于60
  systems: [
    new RendererSystem({
      transparent: true,
      canvas,
      backgroundColor: 0xfee79d,
      width: 750,
      height: GAME_HEIGHT,
      resolution: window.devicePixelRatio / 2,
    }),
    new GraphicsSystem(),
    new PhysicsSystem({
      resolution: window.devicePixelRatio / 2, // 保持RendererSystem的resolution一致
      isTest: true, // 是否开启调试模式
      element: document.getElementById('container'), // 调试模式下canvas节点的挂载点
      world: {
        gravity: {
          y: 5, // 重力
        },
      },
    }),
    new TextSystem(),
    new ImgSystem(),
    new EventSystem(),
    new MaskSystem()
  ],
});
// @ts-ignore
// window.game = game;
const wall = createWall();
game.scene.addChild(wall);

const background = createBackground();
store.gradePanel = createGradePanel();
const backPanel = createBackPanel();
game.scene.addChild(background);
game.scene.addChild(store.gradePanel);
game.scene.addChild(backPanel);

// 创建水果
store.currentFruit = randomFruit(CAN_USE_TYPE[0]);
store.currentType = CAN_USE_TYPE[0];

game.scene.addChild(store.currentFruit);

const evt = background.addComponent(new Event());
let touched = false;

const touchmoveFn = (e: any) => {
  let x: any = e.data.position.x
  if (!touched
    && store.currentFruit
    && store.currentFruit.transform
    && x < 750 - FRUIT_RADIUS[store.currentFruit._name].radius
    && x > FRUIT_RADIUS[store.currentFruit._name].radius) {
    store.currentFruit.transform.position.x = e.data.position.x;
  }
};

const touchend = () => {
  if (store.currentFruit && store.currentFruit.transform) {
    console.log(store.currentFruit);
    const physics = store.currentFruit.addComponent(
      new Physics({
        type: PhysicsType.CIRCLE,
        bodyOptions: BODY_OPTIONS,
        radius: FRUIT_RADIUS[store.currentType].radius,
      })
    );
    physics.on('collisionStart', collisionStartFn);
  }
};

evt.on('touchstart', (e) => {
  // 更新水果的x坐标
  touchmoveFn(e);
  e.stopPropagation();
});

evt.on('touchmove', (e) => {
  // 更新水果的x坐标
  touchmoveFn(e);
  e.stopPropagation();
});

evt.on('touchend', (e) => {

  if (!touched) {
    touched = true;
    touchend();
    setTimeout(() => {
      touched = false;
      game.scene.addChild(createFruit());
    }, 1000);
  }
  e.stopPropagation();
});

function collisionStartFn(gameObjectA: GameObject, gameObjectB: GameObject) {
  if (gameObjectA && gameObjectB && gameObjectA.name === gameObjectB.name) {
    store.score += FRUIT_RADIUS[gameObjectA.name].grade * 2;

    const nextType = FRUIT_RADIUS[gameObjectA.name].next;
    if (!nextType) {
      return;
    }

    const newFruit = randomFruit(nextType);
    newFruit.transform.position.x =
      gameObjectA.transform.position.x + gameObjectA.transform.size.width * 0.5;
    newFruit.transform.position.y =
      gameObjectA.transform.position.y +
      gameObjectA.transform.size.height * 0.5;

    const physics = newFruit.addComponent(
      new Physics({
        type: PhysicsType.CIRCLE,
        bodyOptions: BODY_OPTIONS,
        radius: FRUIT_RADIUS[nextType].radius,
      })
    );

    physics.on('collisionStart', collisionStartFn);

    game.scene.addChild(newFruit);

    gameObjectA.destroy();
    gameObjectB.destroy();

    freshScore();
  }
}

function freshScore() {
  const TextCom = store.gradePanel.getComponent(Text);
  TextCom.text = store.score.toString();
}
