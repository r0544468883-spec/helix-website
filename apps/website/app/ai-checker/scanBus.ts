// Tiny client-side event bus so inline "free check" bands anywhere on the page
// route their URL to the single primary <GeoChecker/>, which then scans + scrolls.

type Handler = (url: string) => void;

let handler: Handler | null = null;

export function registerScanner(fn: Handler): () => void {
  handler = fn;
  return () => {
    if (handler === fn) handler = null;
  };
}

export function requestScan(url: string): void {
  handler?.(url);
}
