/**
 * brain.js wrapper
 * 
 * Since the native npm package for brain.js relies on `gl` which requires native 
 * C++ build tools that aren't available in this environment, we load brain.js 
 * via a CDN in index.html and expose it here with TypeScript typings.
 */

declare global {
  interface Window {
    brain: any;
  }
}

// Export the global brain object
export const brain = window.brain;

// Example usage:
// const net = new brain.NeuralNetwork();
// net.train([{ input: [0, 0], output: [0] }, { input: [1, 1], output: [1] }]);
// const output = net.run([1, 0]);
