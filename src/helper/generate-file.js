const fs = require('fs');
const commonProperty = require('./common-property');

let resData = commonProperty.reduce((acc, cur) => {
  let regexp = /([\w-]+)(\s\(([\s\S]+)\))?/;
  let matches = cur.match(regexp);
  let prop = matches[1];
  let values = [];
  if (matches[3]) {
    values = matches[3].split('|').map(val => val.trim());
  }
  acc[prop] = {
    prop,
    values,
  };
  return acc;
}, {});

fs.writeFile('./full-support-table.js', JSON.stringify(resData), err => {
  if (err) return;
});
