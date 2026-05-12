export function ThemeScript() {
  const script = `
    try {
      var theme = localStorage.getItem('edualerta.theme') || 'system';
      var dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
    } catch {}
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
