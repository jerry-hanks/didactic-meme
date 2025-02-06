import { greet } from './utils.js';

// Use the function and insert the result into the page
const greetingMessage = greet('Visitor');
document.body.insertAdjacentHTML('beforeend', `<p>${greetingMessage}</p>`);

// Also log it to the console
console.log(greetingMessage);
