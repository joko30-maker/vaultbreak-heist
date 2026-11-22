// Keyboard and mouse: WASD or the arrow keys walk, Shift burns a dash charge, and a
// click tosses a decoy coin toward the pointer. Enter starts and restarts. The state
// is polled by the main loop each frame; a click is queued once and consumed by the
// world so a toss is never doubled or lost between frames.

export class Input {
  constructor(canvas, onFirstGesture) {
    this.keys = new Set();
    this.clicks = [];
    this.started = false;
    const wake = () => {
      if (!this.started) {
        this.started = true;
        onFirstGesture();
      }
    };
    window.addEventListener('keydown', (e) => {
      wake();
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    canvas.addEventListener('pointerdown', (e) => {
      wake();
      const rect = canvas.getBoundingClientRect();
      this.clicks.push({
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      });
    });
  }

  /** The current movement wish: mx, my in -1..1, dash held, start pressed. */
  poll() {
    const k = this.keys;
    return {
      mx: (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0),
      my: (k.has('s') || k.has('arrowdown') ? 1 : 0) - (k.has('w') || k.has('arrowup') ? 1 : 0),
      dash: k.has('shift'),
      start: k.has('enter'),
    };
  }

  takeClicks() {
    const out = this.clicks;
    this.clicks = [];
    return out;
  }
}
