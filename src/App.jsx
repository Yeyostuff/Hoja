import React, { useEffect, useRef, useState, useCallback } from 'react';
import ePub from 'epubjs';
import { BookOpen, Plus, ArrowLeft, ChevronLeft, ChevronRight, SlidersHorizontal, List, Bookmark, BookmarkCheck, Trash2, Upload, Library, Search, X, Check, Sun, Moon, AlignLeft, Columns2, Maximize2, HardDriveDownload, RotateCcw, Menu, Info } from 'lucide-react';
import { getBooks, getBook, putBook, patchBook, removeBook } from './db.js';

const DEFAULT_SETTINGS = { theme: 'paper', fontSize: 19, font: 'literary', lineHeight: 1.7, flow: 'paginated', margin: 48 };
const FONTS = [
  { id: 'literary', label: 'Literaria', value: 'Georgia, "Times New Roman", serif' },
  { id: 'classic', label: 'Clásica', value: '"Palatino Linotype", Palatino, serif' },
  { id: 'modern', label: 'Moderna', value: 'Arial, Helvetica, sans-serif' },
  { id: 'clean', label: 'Legible', value: 'Verdana, Geneva, sans-serif' },
  { id: 'mono', label: 'Monoespaciada', value: '"Courier New", monospace' }
];
const COLORS = ['#3b5144', '#7a5b76', '#375675', '#986d46', '#436965', '#704e4b'];
function readSettings() { try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('hoja-settings') || '{}') }; } catch { return DEFAULT_SETTINGS; } }
function cleanText(v, fallback = '') { return typeof v === 'string' ? v.trim() || fallback : fallback; }
function flattenToc(items, depth = 0) { return (items || []).flatMap(item => [{ ...item, depth }, ...flattenToc(item.subitems, depth + 1)]); }
function getErrorMessage(error) { return error?.message || 'Ocurrió un error inesperado.'; }

export default function App() {
  const [books, setBooks] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [settings, setSettings] = useState(readSettings);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInput = useRef(null);

  const refresh = useCallback(async () => {
    try { setBooks((await getBooks()).sort((a, b) => (b.lastOpened || b.addedAt) - (a.lastOpened || a.addedAt))); }
    catch (error) { setNotice(`No se pudo abrir la biblioteca: ${getErrorMessage(error)}`); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { try { localStorage.setItem('hoja-settings', JSON.stringify(settings)); } catch {} }, [settings]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 6000); return () => clearTimeout(timer); }, [notice]);
  function updateSettings(patch) { setSettings(current => ({ ...current, ...patch })); }

  async function importFiles(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setBusy(true);
    let count = 0, errors = [];
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.epub')) { errors.push(`${file.name}: no es un EPUB`); continue; }
      let book;
      try {
        const data = await file.arrayBuffer();
        book = ePub(data);
        const metadata = await book.loaded.metadata;
        const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        const title = cleanText(metadata?.title, file.name.replace(/\.epub$/i, ''));
        await putBook({ id, title, author: cleanText(metadata?.creator, 'Autor desconocido'), fileName: file.name, data, addedAt: Date.now(), lastOpened: 0, cfi: null, progress: 0, bookmarks: [], color: COLORS[(books.length + count) % COLORS.length] });
        count++;
      } catch (error) { errors.push(`${file.name}: ${getErrorMessage(error)}`); }
      finally { try { book?.destroy(); } catch {} }
    }
    setBusy(false);
    await refresh();
    setNotice(`${count} libro(s) importado(s).${errors.length ? ` Errores: ${errors.slice(0, 2).join('; ')}` : ''}`);
  }
  async function deleteBook(id) {
    if (!window.confirm('¿Eliminar este libro y su progreso de este dispositivo?')) return;
    try { await removeBook(id); await refresh(); setNotice('Libro eliminado.'); } catch (e) { setNotice(getErrorMessage(e)); }
  }
  if (activeId) return <Reader key={activeId} id={activeId} onBack={() => { setActiveId(null); refresh(); }} settings={settings} onSettings={updateSettings} setNotice={setNotice} />;
  const filtered = books.filter(book => `${book.title} ${book.author}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <div className="app library-screen">
    <header className="site-header wrap"><div className="brand"><span className="brand-mark"><BookOpen size={23} strokeWidth={1.7} /></span><span>hoja<span className="brand-period">.</span></span></div><span className="header-subtitle">TU RINCÓN DE LECTURA</span><button className="button button-solid upload-top" onClick={() => fileInput.current?.click()} disabled={busy}><Plus size={17}/> Añadir libro</button></header>
    <main className="wrap library-main">
      <div className="intro"><div className="eyebrow">MI BIBLIOTECA PERSONAL <span className="eyebrow-line" /></div><h1>Entre páginas, <em>mil mundos.</em></h1><p>Un espacio tranquilo para tus historias. Tus libros permanecen en este dispositivo.</p></div>
      <div className="library-toolbar"><div><h2>Mis libros <span className="book-count">{books.length}</span></h2><p>{books.length ? 'Continúa una historia o empieza otra.' : 'Tu próxima historia empieza aquí.'}</p></div><div className="search-box"><Search size={18}/><input aria-label="Buscar libros" placeholder="Buscar por título o autor..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
      {filtered.length ? <div className="book-grid">{filtered.map(book => <article key={book.id} className="library-book"><button className="book-open" onClick={() => setActiveId(book.id)} aria-label={`Leer ${book.title}`}><div className="book-cover" style={{ '--cover': book.color || COLORS[0] }}><span className="cover-ornament">✦</span><span className="cover-name">{book.title}</span><span className="cover-rule"/><span className="cover-author">{book.author}</span><div className="cover-bottom">HOJA · BIBLIOTECA</div></div></button><div className="book-info"><button className="book-title" onClick={() => setActiveId(book.id)}>{book.title}</button><p>{book.author}</p><div className="progress-track"><div style={{ width: `${book.progress || 0}%` }}/></div><div className="book-meta"><span>{Math.round(book.progress || 0)}% leído</span><button className="icon-button small-delete" aria-label={`Eliminar ${book.title}`} title="Eliminar libro" onClick={() => deleteBook(book.id)}><Trash2 size={15}/></button></div></div></article>)}</div> : <div className="empty-state"><div className="empty-art"><BookOpen size={59} strokeWidth={1}/></div><h3>{books.length ? 'No encontramos ese libro' : 'Tu biblioteca espera una historia'}</h3><p>{books.length ? 'Prueba con otro título o nombre de autor.' : 'Importa tus archivos EPUB y empieza a leer en cualquier momento.'}</p><button className="button button-solid" onClick={() => fileInput.current?.click()} disabled={busy}><Upload size={17}/>{busy ? 'Importando...' : 'Importar EPUB'}</button></div>}
    </main><footer className="wrap footer"><span>Hecho para perderse entre páginas.</span><span><HardDriveDownload size={14}/> Guardado en tu dispositivo</span></footer>
    <input ref={fileInput} className="visually-hidden" type="file" accept=".epub,application/epub+zip" multiple onChange={importFiles}/>
    {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar"><X size={15}/></button></div>}
  </div>;
}

function Reader({ id, onBack, settings, onSettings, setNotice }) {
  const viewer = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  const currentCfi = useRef(null);
  const percentRef = useRef(0);
  const saveTimer = useRef(null);
  const mounted = useRef(true);
  const navLock = useRef(false);
  const touchStart = useRef(null);
  const [record, setRecord] = useState(null);
  const [toc, setToc] = useState([]);
  const [panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentTitle, setCurrentTitle] = useState('');
  const [markers, setMarkers] = useState([]);
  const [pageMotion, setPageMotion] = useState('');
  const [readerReady, setReaderReady] = useState(false);
  const positionOnOpen = useRef(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const item = await getBook(id);
        if (!item) throw new Error('No encontramos el libro almacenado.');
        if (!mounted.current) return;
        setRecord({ ...item, data: undefined });
        setMarkers(item.bookmarks || []);
        positionOnOpen.current = item.cfi || undefined;
        currentCfi.current = item.cfi || null;
        percentRef.current = item.progress || 0;
        setProgress(item.progress || 0);
        const epub = ePub(item.data);
        bookRef.current = epub;
        const navigation = await epub.loaded.navigation;
        if (!mounted.current) return;
        setToc(flattenToc(navigation.toc));
        await patchBook(id, { lastOpened: Date.now() });
        setReaderReady(true);
      } catch (e) { if (mounted.current) { setError(getErrorMessage(e)); setLoading(false); } }
    })();
    return () => { mounted.current = false; clearTimeout(saveTimer.current); const e = bookRef.current; bookRef.current = null; try { renditionRef.current?.destroy(); } catch {} try { e?.destroy(); } catch {} };
  }, [id]);

  const persistPosition = useCallback((cfi, pct) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => patchBook(id, { cfi, progress: pct }).catch(() => {}), 350);
  }, [id]);

  // Rebuild on flow changes (font/theme updates are applied live without rebuilding).
  useEffect(() => {
    if (!readerReady || !viewer.current || !bookRef.current) return;
    const book = bookRef.current;
    let cancelled = false;
    let rendition;
    const saved = currentCfi.current || positionOnOpen.current;
    setLoading(true);
    try {
      const opts = settings.flow === 'scrolled'
        ? { width: '100%', height: '100%', flow: 'scrolled-doc', manager: 'default' }
        : { width: '100%', height: '100%', flow: 'paginated', spread: 'none', manager: 'default' };
      rendition = book.renderTo(viewer.current, opts);
      renditionRef.current = rendition;
      rendition.on('relocated', location => {
        if (cancelled || !location?.start) return;
        const cfi = location.start.cfi;
        currentCfi.current = cfi;
        // Locations are generated asynchronously; if unavailable keep last known percentage.
        let pct = percentRef.current;
        try { if (book.locations.length()) pct = Math.max(0, Math.min(100, book.locations.percentageFromCfi(cfi) * 100)); } catch {}
        percentRef.current = pct;
        setProgress(pct);
        persistPosition(cfi, pct);
        const href = location.start.href;
        const match = flattenToc(book.navigation?.toc || []).find(node => node.href?.split('#')[0] === href?.split('#')[0]);
        if (match) setCurrentTitle(match.label);
      });
      rendition.on('displayed', () => { if (!cancelled) setLoading(false); });
      rendition.on('rendered', () => { if (!cancelled) applyStyle(rendition, settingsRef.current); });
      applyStyle(rendition, settingsRef.current);
      rendition.display(saved).then(() => { if (!cancelled) { applyStyle(rendition, settingsRef.current); setLoading(false); } }).catch(err => {
        if (cancelled) return;
        if (saved) rendition.display().then(() => setLoading(false)).catch(e => setError(getErrorMessage(e)));
        else { setError(getErrorMessage(err)); setLoading(false); }
      });
      // Computing CFI percentages can be costly on large books; reading works without it.
      Promise.resolve(book.ready).then(() => book.locations.generate(1600)).then(() => {
        if (!cancelled && currentCfi.current) {
          const pct = book.locations.percentageFromCfi(currentCfi.current) * 100;
          if (Number.isFinite(pct)) { percentRef.current = pct; setProgress(pct); persistPosition(currentCfi.current, pct); }
        }
      }).catch(() => {});
    } catch (e) { setError(getErrorMessage(e)); setLoading(false); }
    return () => { cancelled = true; clearTimeout(saveTimer.current); try { rendition?.destroy(); } catch {} if (renditionRef.current === rendition) renditionRef.current = null; };
  }, [readerReady, settings.flow, persistPosition]);

  useEffect(() => { if (renditionRef.current) applyStyle(renditionRef.current, settings); }, [settings.theme, settings.fontSize, settings.font, settings.lineHeight, settings.margin]);
  function triggerMotion(direction) {
    setPageMotion(direction);
    setTimeout(() => { if (mounted.current) setPageMotion(''); }, 420);
  }
  async function move(direction) {
    if (!renditionRef.current || navLock.current || settings.flow !== 'paginated') return;
    navLock.current = true;
    triggerMotion(direction);
    try { if (direction === 'next') await renditionRef.current.next(); else await renditionRef.current.prev(); } catch (e) { setNotice(getErrorMessage(e)); }
    finally { navLock.current = false; }
  }
  async function jump(target) { try { setPanel(null); await renditionRef.current?.display(target); } catch (e) { setNotice(getErrorMessage(e)); } }
  async function toggleBookmark() {
    const cfi = currentCfi.current;
    if (!cfi) { setNotice('Abre una página para colocar el marcador.'); return; }
    const existing = markers.findIndex(m => m.cfi === cfi);
    const next = existing >= 0 ? markers.filter(m => m.cfi !== cfi) : [{ cfi, title: currentTitle || 'Marcador', date: Date.now() }, ...markers];
    try { await patchBook(id, { bookmarks: next }); setMarkers(next); setNotice(existing >= 0 ? 'Marcador eliminado.' : 'Página guardada en marcadores.'); } catch (e) { setNotice(getErrorMessage(e)); }
  }
  useEffect(() => {
    function keydown(event) {
      if (event.target?.closest?.('input,textarea,select,button')) return;
      if (event.key === 'Escape') { setPanel(null); return; }
      if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); move('next'); }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); move('prev'); }
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });
  function onTouchStart(e) { touchStart.current = { x: e.touches[0]?.clientX, y: e.touches[0]?.clientY }; }
  function onTouchEnd(e) {
    if (settings.flow !== 'paginated' || !touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.35) move(dx < 0 ? 'next' : 'prev');
    touchStart.current = null;
  }
  const activeBookmark = markers.some(m => m.cfi === currentCfi.current);
  const isDark = settings.theme === 'night';
  return <div className={`app reader-screen theme-${settings.theme}`}>
    <header className="reader-top"><div className="reader-top-left"><button className="icon-button" onClick={onBack} title="Biblioteca" aria-label="Volver a biblioteca"><ArrowLeft size={20}/></button><div className="reader-brand">hoja<span>.</span></div><span className="top-separator"/><div className="reader-title"><strong>{record?.title || 'Abriendo libro...'}</strong><span>{record?.author || ''}</span></div></div><div className="reader-top-right"><button className="icon-button" onClick={() => setPanel(panel === 'toc' ? null : 'toc')} title="Índice" aria-label="Índice"><List size={21}/></button><button className="icon-button" onClick={toggleBookmark} title="Marcar página" aria-label="Marcar página">{activeBookmark ? <BookmarkCheck size={20}/> : <Bookmark size={20}/>}</button><button className={`icon-button ${panel === 'settings' ? 'selected' : ''}`} onClick={() => setPanel(panel === 'settings' ? null : 'settings')} title="Ajustes" aria-label="Ajustes"><SlidersHorizontal size={20}/></button></div></header>
    <main className="reader-content" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {settings.flow === 'paginated' && <button className="nav-area nav-area-left" onClick={() => move('prev')} aria-label="Página anterior"><ChevronLeft size={24}/></button>}
      <div className={`reader-page ${pageMotion ? `motion-${pageMotion}` : ''}`}>
        <div className="page-topline"><span>✦</span><span>{currentTitle || 'UNA HISTORIA PARA DISFRUTAR'}</span><span>✦</span></div>
        <div className="epub-viewer" ref={viewer} id="epub-viewer" />
        {loading && !error && <div className="reading-loading"><BookOpen size={36} strokeWidth={1.2}/><span>Preparando tus páginas...</span></div>}
        {error && <div className="reading-loading reading-error"><Info size={30}/><strong>No se pudo abrir este EPUB</strong><span>{error}</span><button className="button button-solid" onClick={onBack}>Volver a biblioteca</button></div>}
        <div className="page-footline"><span>{record?.author || ''}</span><span>~ ✦ ~</span><span>{Math.round(progress)}%</span></div>
      </div>
      {settings.flow === 'paginated' && <button className="nav-area nav-area-right" onClick={() => move('next')} aria-label="Página siguiente"><ChevronRight size={24}/></button>}
    </main>
    <div className="reader-bottom"><div className="reader-bottom-inner"><span className="reading-small">{settings.flow === 'paginated' ? '← → para pasar páginas' : 'Desliza para continuar'}</span><div className="reader-progress"><div style={{ width: `${progress}%` }}/></div><span className="reading-percent">{Math.round(progress)}% leído</span></div></div>
    {panel && <><div className="panel-scrim" onClick={() => setPanel(null)}/><aside className="side-panel"><div className="panel-heading"><div><small>HOJA · LECTOR</small><h2>{panel === 'settings' ? 'Tu lectura, a tu manera' : 'Explorar libro'}</h2></div><button className="icon-button" onClick={() => setPanel(null)} aria-label="Cerrar panel"><X size={19}/></button></div>
      {panel === 'settings' ? <div className="settings-body"><div className="setting-group"><label>APARIENCIA</label><div className="theme-options">{[{ id: 'paper', label: 'Papel', color: '#fcfaf5' }, { id: 'sepia', label: 'Sepia', color: '#efe3cc' }, { id: 'night', label: 'Noche', color: '#25302c' }].map(t => <button key={t.id} className={`theme-choice ${settings.theme === t.id ? 'active' : ''}`} onClick={() => onSettings({ theme: t.id })}><span style={{ background: t.color }}>{settings.theme === t.id && <Check size={17} color={t.id === 'night' ? '#fff' : '#263d33'}/>}</span><span>{t.label}</span></button>)}</div></div>
      <div className="setting-group"><label htmlFor="font-family">TIPOGRAFÍA</label><select id="font-family" value={settings.font} onChange={e => onSettings({ font: e.target.value })}>{FONTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}</select><div className="font-preview" style={{ fontFamily: FONTS.find(f => f.id === settings.font)?.value }}>La magia está entre las páginas.</div></div>
      <div className="setting-group"><label>TAMAÑO DE LETRA <b>{settings.fontSize}px</b></label><div className="slider-row"><span className="font-icon-small">A</span><input type="range" min="12" max="36" step="1" value={settings.fontSize} onChange={e => onSettings({ fontSize: Number(e.target.value) })}/><span className="font-icon-big">A</span></div></div>
      <div className="setting-group"><label>INTERLINEADO <b>{settings.lineHeight.toFixed(1)}</b></label><input type="range" min="1.2" max="2.2" step="0.1" value={settings.lineHeight} onChange={e => onSettings({ lineHeight: Number(e.target.value) })}/></div>
      <div className="setting-group"><label>MÁRGENES <b>{settings.margin}px</b></label><input type="range" min="12" max="90" step="2" value={settings.margin} onChange={e => onSettings({ margin: Number(e.target.value) })}/></div>
      <div className="setting-group"><label>MODO DE LECTURA</label><div className="flow-options"><button className={settings.flow === 'paginated' ? 'active' : ''} onClick={() => onSettings({ flow: 'paginated' })}><Columns2 size={20}/> Páginas</button><button className={settings.flow === 'scrolled' ? 'active' : ''} onClick={() => onSettings({ flow: 'scrolled' })}><AlignLeft size={20}/> Continuo</button></div></div>
      <button className="reset-settings" onClick={() => onSettings(DEFAULT_SETTINGS)}><RotateCcw size={16}/> Restablecer ajustes</button></div>
      : <div className="toc-body"><div className="toc-section-label">CAPÍTULOS <span>{toc.length}</span></div>{toc.length ? toc.map((entry, i) => <button className="toc-link" key={`${entry.id || entry.href}-${i}`} style={{ paddingLeft: `${18 + Math.min(entry.depth, 3) * 14}px` }} onClick={() => jump(entry.href)}>{entry.label}</button>) : <p className="empty-toc">Este libro no incluye un índice navegable.</p>}<div className="toc-section-label bookmark-heading">MARCADORES <span>{markers.length}</span></div>{markers.length ? markers.map((m, i) => <button className="toc-link" key={`${m.cfi}-${i}`} onClick={() => jump(m.cfi)}><Bookmark size={15}/> {m.title}</button>) : <p className="empty-toc">Marca una página para encontrarla aquí.</p>}</div>}
    </aside></>}
  </div>;
}

function applyStyle(rendition, settings) {
  const font = FONTS.find(f => f.id === settings.font)?.value || FONTS[0].value;
  const fg = settings.theme === 'night' ? '#e8e6de' : settings.theme === 'sepia' ? '#4e3b2b' : '#302e29';
  const bg = settings.theme === 'night' ? '#25302c' : settings.theme === 'sepia' ? '#efe3cc' : '#fcfaf5';
  try {
    rendition.themes.default({
      'html': { 'background': `${bg} !important`, 'color': `${fg} !important` },
      'body': { 'background': `${bg} !important`, 'color': `${fg} !important`, 'font-family': `${font} !important`, 'line-height': `${settings.lineHeight} !important`, 'padding': `0 ${settings.margin}px !important`, 'box-sizing': 'border-box !important' },
      'p, li, blockquote': { 'line-height': `${settings.lineHeight} !important` },
      'a': { 'color': `${settings.theme === 'night' ? '#cdb493' : '#7c5f40'} !important` },
      'img, svg': { 'max-width': '100% !important' }
    });
    rendition.themes.font(font);
    rendition.themes.fontSize(`${settings.fontSize}px`);
  } catch {}
}
