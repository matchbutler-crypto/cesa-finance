// CESA Financial OS — Theme-Definitionen
// Vier Themes: Linear (default dark), Bloomberg (terminal), Mercury (light), Pipe (warm)

window.CESA_THEMES = {
  linear: {
    name: 'Linear',
    mode: 'dark',
    bg:        '#0B0D10',
    surface:   '#13161B',
    surface2:  '#191D24',
    surface3:  '#1F2530',
    border:    '#232A35',
    borderStrong: '#2E3744',
    text:      '#E6E8EB',
    textStrong:'#F5F6F7',
    muted:     '#8089A0',
    subtle:    '#5C6675',
    accent:    '#7BA7D9',   // info / forecast
    positive:  '#5FB477',
    warning:   '#D4A24C',
    danger:    '#C26B6B',
    overlay:   'rgba(255,255,255,0.04)',
    grid:      'rgba(255,255,255,0.04)',
  },
  bloomberg: {
    name: 'Bloomberg',
    mode: 'dark',
    bg:        '#000000',
    surface:   '#0A0A0A',
    surface2:  '#121212',
    surface3:  '#1A1A1A',
    border:    '#222222',
    borderStrong: '#333333',
    text:      '#FFB800',   // legendäres Bloomberg-Amber
    textStrong:'#FFCB47',
    muted:     '#8A6A1F',
    subtle:    '#5A4615',
    accent:    '#4AA8FF',
    positive:  '#00C853',
    warning:   '#FFB800',
    danger:    '#FF3838',
    overlay:   'rgba(255,184,0,0.06)',
    grid:      'rgba(255,184,0,0.08)',
  },
  mercury: {
    name: 'Mercury',
    mode: 'light',
    bg:        '#FAFAF8',
    surface:   '#FFFFFF',
    surface2:  '#F4F4F1',
    surface3:  '#EBEBE6',
    border:    '#E3E3DD',
    borderStrong: '#CFCFC7',
    text:      '#1F2024',
    textStrong:'#0A0B0E',
    muted:     '#6E7280',
    subtle:    '#9A9DA5',
    accent:    '#3B5BDB',
    positive:  '#1F8A5B',
    warning:   '#B07A1E',
    danger:    '#B83A3A',
    overlay:   'rgba(0,0,0,0.025)',
    grid:      'rgba(0,0,0,0.06)',
  },
  pipe: {
    name: 'Pipe',
    mode: 'light',
    bg:        '#F4F1EA',
    surface:   '#FBF9F4',
    surface2:  '#EEEAE0',
    surface3:  '#E4DFD2',
    border:    '#DCD5C6',
    borderStrong: '#C6BDA8',
    text:      '#1F1B14',
    textStrong:'#0C0A06',
    muted:     '#7A7060',
    subtle:    '#A39782',
    accent:    '#3F5C40',
    positive:  '#3F5C40',
    warning:   '#A87A1F',
    danger:    '#9B3B2A',
    overlay:   'rgba(0,0,0,0.025)',
    grid:      'rgba(0,0,0,0.05)',
  },
};

window.applyCESATheme = function (key) {
  const t = window.CESA_THEMES[key] || window.CESA_THEMES.linear;
  const root = document.documentElement;
  Object.entries(t).forEach(([k, v]) => {
    if (typeof v === 'string') root.style.setProperty('--c-' + k, v);
  });
  root.setAttribute('data-theme', key);
  root.setAttribute('data-mode', t.mode);
};
