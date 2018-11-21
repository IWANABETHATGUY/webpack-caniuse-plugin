const postcss = require('postcss');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const allFeatureTable = require('./allFeatureTable');
const beforeIE6Table = require('./beforeIE6Table');
const { getFeatureFromProp, transformEnv } = require('./lib');
const pretreatment = require('./pretreatment');

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

  isPropLegal(prop) {
    //这里直接使用ie6之前的表测试是否能命中，不能命中则直接去所有的featureMap中去找，未来会修改
    // TODO: 使用规则匹配featuremap确定所使用的属性是否符合规则
    let beforeIE6flag = !!beforeIE6Table[prop];
    if (beforeIE6flag) {
      return beforeIE6flag;
    } else {
      let rulesDescriptor = transformEnv(this.env);
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
                if (browserMap[version] === 'y') {
                  return true;
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

  getWarnLog(prop) {
    return `
    ------------------
    ${chalk.red(
      `prop: '${prop.prop}', feature: ${prop.feature} at line: ${
        prop.start.line
      }, column: ${prop.start.column} is not valid`,
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
    try {
      let fileContent = fs.readFileSync(this.filename, { encoding: 'utf8' });
      this.linesOfFile = fileContent.split('\n');
      let ast = this.getAst(fileContent);
      this.setPropList(ast);
      this.propList.forEach(prop => {
        if (!this.isPropLegal(prop.feature)) {
          console.log(this.getWarnLog(prop));
        }
      });
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = Validater;

let va = new Validater(path.resolve(__dirname, './style/style.less'), {
  env: 'ie11',
});

va.validate();
