const path = require('path');
const LessFilter = require('./less');

function pretrementPropList (filename, nodeList) {
  let extension = path.extname(filename).slice(1);
  switch(extension) {
    case 'less':
      return LessFilter(nodeList);
    default:
    return nodeList;
  }
}

module.exports = pretrementPropList;