export const FRUIT_RADIUS: {
  [propName: string]: { radius: number; next: string; grade: number };
} = {
  yingtao: {
    radius: 30,
    next: 'ningmeng',
    grade: 10,
  },
  ningmeng: {
    radius: 56,
    next: 'yezi',
    grade: 20,
  },
  mihoutao: {
    radius: 56,
    next: 'hamigua',
    grade: 20,
  },
  fanqie: {
    radius: 56,
    next: 'hamigua',
    grade: 20,
  },
  // danqie: {
  //   radius: 25,
  //   grade: 10,
  //   next: 'chengzi',
  // },
  chengzi: {
    radius: 56,
    grade: 20,
    next: 'hamigua',
  },
  yezi: {
    radius: 108,
    grade: 60,
    next: 'xigua',
  },
  hamigua: {
    radius: 100,
    grade: 60,
    next: 'xigua',
  },
  xigua: {
    radius: 146,
    grade: 100,
    next: 'daxigua',
  },
  daxigua: {
    radius: 180,
    grade: 200,
    next: '',
  },
};
export const CAN_USE_TYPE = [
  'yingtao',
  'ningmeng',
  'mihoutao',
  'fanqie',
  'chengzi',
  'yezi',
  'hamigua',
  'xigua',
];
export const GAME_HEIGHT = window.innerWidth > window.innerHeight ? window.innerHeight : 750 * (window.innerHeight / window.innerWidth);
export const BODY_OPTIONS = {
  isStatic: false,
  restitution: 0.4,
  density: 0.002,
};
export const COLOR = {
  wall: 'red'
}