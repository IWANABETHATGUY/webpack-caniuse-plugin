const featureFnMap = require('./featureType');


function getFeatureFromProp(prop) {
  for (let fnKey in featureFnMap) {
    if (featureFnMap[fnKey](prop)) {
      return fnKey;
    }
  }
  return prop;
}

function transformEnv(env) {
  let res = {};
  let versionReg = /(>=)?\s*(ie|firefox|chrome|safari|opera|ios_saf|op_mini)\s*(\d+)/i;
  let latestReg = /latest\s+(\d+)\s+versions?/i;
  let matches = env.match(versionReg);
  if (matches) {
    res.type = 'browser';
    res.version = matches[3];
    res.browser = matches[2];
    return res;
  } else if (latestReg.test(env)) {
    res.type = 'latest';
    res.version = env.match(latestReg)[1];
    return res;
  } else {
    res.type = 'unknow';
    return res;
  }
}
module.exports = {
  getFeatureFromProp,
  transformEnv
};
