const postcss = require('postcss');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const allFeatureTable = require('./allFeatureTable');
const beforeIE6Table = require('./beforeIE6Table');
const { getFeatureFromProp } = require('./lib');
const pretreatment = require('./pretreatment');
const { isPropLegal } = require('./lib');

class Validater {
  constructor(filename, { env, rules }) {
    this.filename = filename;
    this.env = env || '';
    this.rules = rules || [];
    this.propList = [];
    this.linesOfFile = [];
    if (typeof this.filename !== 'string') {
      throw new Error('filename must be a string');
    }
    if (env === '' && this.propList.length === 0) {
      throw new Error("env and rules should't be both empty");
    }
  }
  getAst(fileContent) {
    try {
      let ast = postcss.parse(fileContent);
      return ast;
    } catch (err) {
      return null;
    }
  }
  setPropList(rootAst) {
    let nodeList = rootAst.nodes.filter(
      node => ['rule', 'decl'].indexOf(node.type) !== -1,
    );
    pretreatment(this.filename, nodeList).forEach(node => {
      if (node.type !== 'decl') {
        this.setPropList(node);
      } else {
        let PropInfoObj = {
          prop: node.prop,
          start: node.source.start,
          end: node.source.end,
          feature: getFeatureFromProp(node.prop),
        };
        this.propList.push(PropInfoObj);
      }
    });
  }

  getWarnLog(prop) {
    return `
    ------------------
    ${chalk.red(
      `${this.filename}:${prop.start.line}`
    )}
    ${chalk.red(
      `prop: '${prop.prop}' is not valid`,
    )}
    ${chalk.green(
      this.linesOfFile[prop.start.line - 1].slice(
        prop.start.column - 1,
        prop.end.column,
      ),
    )}
    ------------------
    `;
  }
  validate() {
    // try {
      let fileContent = fs.readFileSync(this.filename, { encoding: 'utf8' });
      this.linesOfFile = fileContent.split('\n');
      let ast = this.getAst(fileContent);
      this.setPropList(ast);
      this.propList.forEach(prop => {
        if (!isPropLegal(prop.feature, this.env)) {
          console.log(this.getWarnLog(prop));
        }
      });
      
  }
}

module.exports = Validater;

let va = new Validater(path.resolve(__dirname, './style/style.less'), {
  env: 'ie10',
});
va.validate();
