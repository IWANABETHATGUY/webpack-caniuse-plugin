function LessFilter(nodeList) {
  return nodeList.filter(node => node.prop !== '//');
}

module.exports = LessFilter;