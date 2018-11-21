const beforeIE6Table = require('../beforeIE6Table');
const allFeatureTable = require('../allFeatureTable');
const transformEnv = require('./transformEnv');

function isPropLegal(prop, env) {
  //这里直接使用ie6之前的表测试是否能命中，不能命中则直接去所有的featureMap中去找，未来会修改
  // TODO: 使用规则匹配featuremap确定所使用的属性是否符合规则
  let beforeIE6flag = !!beforeIE6Table[prop];
  if (beforeIE6flag) {
    return beforeIE6flag;
  } else {
    let rulesDescriptor = transformEnv(env);
    switch (rulesDescriptor.type) {
      case 'browser': {
        let browser = rulesDescriptor.browser;
        let version = rulesDescriptor.version;

        if (!allFeatureTable[prop]) {
          return false;
        } else {
          let browserMap = allFeatureTable[prop]['stats'][browser];
          if (browserMap) {
            if (browserMap['all']) {
              if (browserMap['all'] === 'y') {
                return true;
              }
            } else {
              if (browserMap[version]) {
                if (browserMap[version] !== 'n') {
                  return true;
                }
              }
            }
          }
        }
        return false;
      }
      case 'latest':
      case 'unknow':
    }
  }
}

module.exports = isPropLegal;
