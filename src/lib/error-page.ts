export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Something went wrong — SHYN RIDE</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      * { box-sizing: border-box; }
      body { font-family: 'Outfit', system-ui, sans-serif; background: oklch(0.11 0.006 260); color: oklch(0.95 0.012 85); display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 3rem; }
      .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 1.5rem; font-weight: 500; letter-spacing: -0.02em; }
      .gold { background: linear-gradient(135deg, oklch(0.78 0.1 75), oklch(0.85 0.12 65)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 2rem; font-weight: 500; margin: 2.5rem 0 0.75rem; letter-spacing: -0.02em; }
      p { color: oklch(0.6 0.008 260); margin: 0 0 2.5rem; font-size: 0.875rem; line-height: 1.6; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.75rem 1.5rem; border-radius: 0.75rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; transition: all 0.3s; }
      .primary { background: oklch(0.78 0.1 75); color: oklch(0.11 0.006 260); }
      .primary:hover { box-shadow: 0 8px 24px oklch(0.78 0.1 75 / 0.25); }
      .secondary { background: transparent; color: oklch(0.95 0.012 85); border-color: oklch(0.22 0.006 260); }
      .secondary:hover { border-color: oklch(0.78 0.1 75 / 0.4); color: oklch(0.78 0.1 75); }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="logo">SHYN <span class="gold">RIDE</span></div>
      <h1>Something went wrong.</h1>
      <p>We hit an unexpected issue. Try refreshing, or head back to the showroom.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Back to showroom</a>
      </div>
    </div>
  </body>
</html>`;
}
