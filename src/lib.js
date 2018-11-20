const featureFnMap = require('./featureType');

function setFeatureOfProp(propInfoObj) {
  let prop = propInfoObj.prop;
  propInfoObj['feature'] = getFeatureFromProp(prop);
}

function getFeatureFromProp(prop) {
  for (let fnKey in featureFnMap) {
    if (featureFnMap[fnKey](prop)) {
      return fnKey;
    }
  }
  return prop;
}
module.exports = {
  setFeatureOfProp,
};
