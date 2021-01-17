// testing custom hooks
// http://localhost:3000/counter-hook

import {renderHook, act} from '@testing-library/react-hooks';
import useCounter from '../../components/use-counter'

// function setup({initialProps} = {}) {
//   const result = {};
//   function TestComponent(props) {
//     result.current = useCounter(initialProps);
//     return null;
//   }

//   render(<TestComponent />);
//   return result;
// }

// function Counter() {
//   const {count, increment, decrement} = useCounter();

//   return (
//     <div>
//       <div>Count:{count}</div>
//       <div style={{display: 'flex', flexFlow: 'row nowrap'}}>
//         <button onClick={increment}>increment</button>
//         <button onClick={decrement}>decrement</button>
//       </div>
//     </div>
//   );
// }

test('exposes the count and increment/decrement functions', () => {
  const {result} = renderHook(useCounter);
  expect(result.current.count).toBe(0);
  act(() => result.current.increment());
  act(() => result.current.increment());
  expect(result.current.count).toBe(2);
  act(() => result.current.decrement());
  expect(result.current.count).toBe(1);
});
test('allow customization of initial count', () => {
  const {result} = renderHook(useCounter, {initialProps: {initialCount: 5}});
  expect(result.current.count).toBe(5);
  act(() => result.current.increment());
  expect(result.current.count).toBe(6);
  act(() => result.current.decrement());
  act(() => result.current.decrement());
  expect(result.current.count).toBe(4);
});
test('allow customization of step count', () => {
  const {result, rerender} = renderHook(useCounter, {initialProps: {step: 3}});
  expect(result.current.count).toBe(0);
  act(() => result.current.increment());
  expect(result.current.count).toBe(3);
  act(() => result.current.decrement());
  rerender({step: 1});
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});

/* eslint no-unused-vars:0 */
