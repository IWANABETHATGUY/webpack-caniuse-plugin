const featureFnMap = require('../featureType');


function getFeatureFromProp(prop) {
  for (let fnKey in featureFnMap) {
    if (featureFnMap[fnKey](prop)) {
      return fnKey;
    }
  }
  return prop;
}

module.exports = getFeatureFromProp;