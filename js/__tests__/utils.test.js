import { greet } from '../utils.js';

test('greet returns a correct greeting', () => {
  expect(greet('World')).toBe('Hello, World!');
});
