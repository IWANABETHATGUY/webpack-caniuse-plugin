const { isPropLegal } = require('../src/lib');

const BROWSER = 'ie11';

test('ie8 browser support property test', () => {
  expect(isPropLegal('border-radius', BROWSER)).toBe(true);
});

// test('ie8 browser not support property test', () => {
//   expect.ignore(isPropLegal('border-radius', BROWSER)).toBe(false);
// });
