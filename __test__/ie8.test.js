const { isPropLegal } = require('../src/lib');

const BROWSER = 'ie8';

test('ie8 browser support property test', () => {
  expect(isPropLegal('border-radius', BROWSER)).toBe(false);
});

// test('ie8 browser not support property test', () => {
//   expect(isPropLegal('border-radius', BROWSER)).toBe(false);
// });
