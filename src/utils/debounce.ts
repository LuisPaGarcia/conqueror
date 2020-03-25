/**
 *
 * @param fn function to debounce
 * @param delay time in ms to wait for the debounce
 */
function debounce<F extends (...params: any[]) => void>(fn: F, delay: number) {
  let timeoutID: number | any = null
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutID)
    timeoutID = window.setTimeout(() => fn.apply(this, args), delay)
  } as F
}

export default debounce
