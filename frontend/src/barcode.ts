let buffer = "";
let lastTime = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let lastScan = "";
let callback: ((code: string) => void) | null = null;

const MAP: Record<string, string> = {
  Digit0:"0",Digit1:"1",Digit2:"2",Digit3:"3",Digit4:"4",Digit5:"5",Digit6:"6",Digit7:"7",Digit8:"8",Digit9:"9",
  KeyA:"a",KeyB:"b",KeyC:"c",KeyD:"d",KeyE:"e",KeyF:"f",KeyG:"g",KeyH:"h",KeyI:"i",KeyJ:"j",KeyK:"k",KeyL:"l",
  KeyM:"m",KeyN:"n",KeyO:"o",KeyP:"p",KeyQ:"q",KeyR:"r",KeyS:"s",KeyT:"t",KeyU:"u",KeyV:"v",KeyW:"w",KeyX:"x",
  KeyY:"y",KeyZ:"z",Minus:"-",Equal:"=",BracketLeft:"[",BracketRight:"]",Backslash:"\\",Semicolon:";",Quote:"'",
  Comma:",",Period:".",Slash:"/",Space:" ",Backquote:"`",Numpad0:"0",Numpad1:"1",Numpad2:"2",Numpad3:"3",
  Numpad4:"4",Numpad5:"5",Numpad6:"6",Numpad7:"7",Numpad8:"8",Numpad9:"9",NumpadDecimal:".",NumpadDivide:"/",
  NumpadMultiply:"*",NumpadSubtract:"-",NumpadAdd:"+",
};

const SHIFT: Record<string, string> = {
  Digit0:")",Digit1:"!",Digit2:"@",Digit3:"#",Digit4:"$",Digit5:"%",Digit6:"^",Digit7:"&",Digit8:"*",Digit9:"(",
  Minus:"_",Equal:"+",BracketLeft:"{",BracketRight:"}",Backslash:"|",Semicolon:":",Quote:'"',Comma:"<",Period:">",
  Slash:"?",Backquote:"~",
};

function reset(): void {
  buffer = "";
  lastTime = 0;
  if (timer) { clearTimeout(timer); timer = null; }
}

function flush(): void {
  const code = buffer.trim();
  if (code.length >= 4 && code !== lastScan) {
    lastScan = code;
    callback?.(code);
    setTimeout(() => { if (lastScan === code) lastScan = ""; }, 2000);
  }
  reset();
}

function handler(e: KeyboardEvent): void {
  const el = e.target as HTMLElement;
  if (el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable) return;
  if (e.code === "Enter" || e.code === "NumpadEnter") { flush(); return; }

  const mapped = MAP[e.code];
  if (!mapped) return;

  const now = Date.now();
  if (lastTime && now - lastTime > 100) reset();

  buffer += e.shiftKey ? (SHIFT[e.code] || mapped.toUpperCase()) : mapped;
  lastTime = now;

  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 150);
}

export function startBarcodeScanner(onScan: (code: string) => void): () => void {
  callback = onScan;
  window.addEventListener("keydown", handler, true);
  return () => {
    window.removeEventListener("keydown", handler, true);
    reset();
    callback = null;
  };
}