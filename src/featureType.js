const LEFT = 'left';
const RIGHT = 'right';
const TOP = 'top';
const BOTTOM = 'bottom';

let featureMap = {
  padding: [
    'padding',
    `padding-${LEFT}`,
    `padding-${RIGHT}`,
    `padding-${TOP}`,
    `padding-${BOTTOM}`,
  ],
  margin: ['margin', 'margin-left', 'margin-right', 'margin-top', 'margin-top'],
  flexbox: [
    'flex-direction',
    'flex-wrap',
    'flex-flow',
    'justify-content',
    'align-items',
    'align-content',
    'flex-wrap',
    'flex-flow',
    'order',
    'flex-grow',
    'flex-basis',
    'flex-shrink',
  ],
  'css3-boxsizing': ['box-sizing'],
  'css-gencontent': ['content'],
  'css-transitions': ['transition'],
  'css-letter-spacing': ['letter-spacing'],
  'border-radius': [/border.*-radius/],
};
// 将一类的属性映射到某个feature上，
const featureFnMap = Object.keys(featureMap).reduce((acc, cur) => {
  acc[cur] = function(prop) {
    let propListOfFeature = featureMap[cur];
    return propListOfFeature.some(item => {
      let type = Object.prototype.toString.call(item).slice(-7, -1);
      switch (type) {
        case 'String':
          return item === prop;
        case 'RegExp':
          return item.test(prop);
        default:
          return false;
      }
    });
  };
  return acc;
}, {});

module.exports = featureFnMap;

('[Object object]');
