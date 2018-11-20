const postcss = require('postcss');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const allFeatureTable = require('./allFeatureTable');
const beforeIE6Table = require('./beforeIE6Table');
const { setFeatureOfProp } = require('./lib');
const pretreatment = require('./pretreatment');
function getAst(fileContent) {
  try {
    let ast = postcss.parse(fileContent);
    return ast;
  } catch (err) {
    return null;
  }
}

function setPropList(filename, rootAst, propList) {
  let nodeList = rootAst.nodes.filter(
    node => ['rule', 'decl'].indexOf(node.type) !== -1,
  );
  pretreatment(filename, nodeList).forEach(node => {
    if (node.type !== 'decl') {
      setPropList(filename, node, propList);
    } else {
      let initPropInfoObj = {
        prop: node.prop,
        start: node.source.start,
        end: node.source.end,
      };
      setFeatureOfProp(initPropInfoObj);
      propList.push(initPropInfoObj);
    }
  });
}

function isPropLegal(prop) {
  //这里直接使用ie6之前的表测试是否能命中，不能命中则直接去所有的featureMap中去找，未来会修改
  // TODO: 使用规则匹配featuremap确定所使用的属性是否符合规则
  return !!beforeIE6Table[prop] || !!allFeatureTable[prop];
}

function walk(filename) {
  try {
    let fileContent = fs.readFileSync(filename, { encoding: 'utf8' });
    let linesOfFile = fileContent.split('\n');
    let ast = getAst(fileContent);
    let propList = [];
    setPropList(filename, ast, propList);
    propList.forEach(prop => {
      if (!isPropLegal(prop.feature)) {
        console.log(
          `
------------------
${chalk.red(
            `prop: '${prop.prop}', feature: ${prop.feature} at line: ${
              prop.start.line
            }, column: ${prop.start.column} is not valid`,
          )}
${chalk.green(
            linesOfFile[prop.start.line - 1].slice(
              prop.start.column - 1,
              prop.end.column,
            ),
          )}
------------------
`,
        );
      }
    });
  } catch (err) {
    throw err;
  }
}

walk(path.resolve(__dirname, './style/style.less'));
