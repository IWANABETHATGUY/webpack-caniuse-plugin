const postcss = require('postcss');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const rules = require('./rule');
const fullSupportTable = require('./full-support-table');

function getAst(fileContent) {
  try {
    let ast = postcss.parse(fileContent);
    return ast;
  } catch (err) {
    return null;
  }
}

function setPropList(rootAst, propList) {
  rootAst.nodes
    .filter(node => ['rule', 'decl'].indexOf(node.type) !== -1)
    .forEach(node => {
      if (node.type !== 'decl') {
        setPropList(node, propList);
      } else {
        propList.push({
          prop: node.prop,
          start: node.source.start,
          end: node.source.end
        });
      }
    });
}

function isPropLegal(prop) {
  return !!fullSupportTable[prop];
}

function walk(filename) {
  try {
    let fileContent = fs.readFileSync(filename, {encoding: 'utf8'});
    let linesOfFile = fileContent.split('\n');
    let ast = getAst(fileContent);
    let propList = [];
    setPropList(ast, propList);
    propList.forEach(prop => {
      if (!isPropLegal(prop.prop)) {
        console.log(
`
------------------
${chalk.red(`prop: ${prop.prop} at line: ${prop.start.line}, column: ${prop.start.column} is not valid`)}
${chalk.green(linesOfFile[prop.start.line - 1].slice(prop.start.column - 1, prop.end.column))}
------------------
`);
      }
    });
  } catch (err) {
    throw err;
  }
}

walk(path.resolve(__dirname, '../src/style.less'));
