import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight, ArrowRight, Bookmark, Check, ChevronDown, Clapperboard,
  Film, Heart, Play, Search, Sparkles, X,
} from 'lucide-react'
import bundledCatalog from './data/catalog.json'
import './App.css'

const genres = ['All films', 'Fantasy', 'Romance', 'Drama', 'Adventure', 'Sci-fi']
const catalogUrl = import.meta.env.VITE_S3_CATALOG_URL

function readWatchlist() {
  try {
    return JSON.parse(localStorage.getItem('sora-watchlist') || '[]')
  } catch {
    return []
  }
}

function App() {
  const [movies, setMovies] = useState(bundledCatalog)
  const [catalogSource, setCatalogSource] = useState('sample')
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('All films')
  const [activeView, setActiveView] = useState('discover')
  const [watchlist, setWatchlist] = useState(readWatchlist)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [brokenPosters, setBrokenPosters] = useState([])
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!catalogUrl) return undefined
    let active = true
    fetch(catalogUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Catalogue unavailable')
        return response.json()
      })
      .then((catalog) => {
        if (active && Array.isArray(catalog) && catalog.length) {
          setMovies(catalog)
          setCatalogSource('s3')
        }
      })
      .catch(() => {
        if (active) {
          setMovies(bundledCatalog)
          setCatalogSource('sample')
        }
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    localStorage.setItem('sora-watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 2200)
    return () => window.clearTimeout(timer)
  }, [notice])

  const featured = movies[0]
  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return movies.filter((movie) => {
      const matchesGenre = genre === 'All films' || movie.genres.includes(genre)
      const matchesQuery = !normalizedQuery ||
        `${movie.title} ${movie.originalTitle} ${movie.director} ${movie.genres.join(' ')}`.toLowerCase().includes(normalizedQuery)
      const matchesView = activeView !== 'watchlist' || watchlist.includes(movie.id)
      return matchesGenre && matchesQuery && matchesView
    })
  }, [activeView, genre, movies, query, watchlist])

  function toggleWatchlist(movie) {
    const isSaved = watchlist.includes(movie.id)
    setWatchlist((current) => isSaved ? current.filter((id) => id !== movie.id) : [...current, movie.id])
    setNotice(isSaved ? 'Removed from your list' : 'Saved to your list')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" onClick={() => setActiveView('discover')}>
          <span className="wordmark-mark"><Clapperboard size={18} /></span>
          <span>SORA<span className="wordmark-dot">.</span></span>
          <span className="wordmark-caption">ANIME FILM CLUB</span>
        </a>
        <nav className="primary-nav" aria-label="Main navigation">
          <button className={activeView === 'discover' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveView('discover')}>Discover</button>
          <button className={activeView === 'watchlist' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveView('watchlist')}>My list <span className="nav-count">{watchlist.length}</span></button>
        </nav>
        <label className="search-box">
          <Search size={17} aria-hidden="true" />
          <input aria-label="Search films" placeholder="Find a film, director..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <span className="search-shortcut">⌘ K</span>
        </label>
      </header>

      <div className="page-content" id="top">
        <section className="hero" aria-labelledby="hero-title">
          {featured && <>
            {brokenPosters.includes(featured.id) ? <div className="hero-art-fallback" /> : <img className="hero-art" src={featured.poster} alt="" onError={() => setBrokenPosters((current) => [...current, featured.id])} />}
            <div className="hero-shade" />
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-rule" /> THE SORA SELECTION · 01</div>
              <p className="hero-kicker">A film to get lost in</p>
              <h1 id="hero-title">{featured.title}</h1>
              <p className="hero-subtitle">{featured.tagline}</p>
              <div className="hero-meta"><span>{featured.year}</span><i /><span>{featured.runtime} min</span><i /><span className="rating"><Sparkles size={13} fill="currentColor" /> {featured.rating}</span></div>
              <p className="hero-description">{featured.synopsis}</p>
              <div className="hero-actions">
                <button className="button button-primary" onClick={() => setSelectedMovie(featured)}><Play size={15} fill="currentColor" /> Discover the film</button>
                <button className={watchlist.includes(featured.id) ? 'button button-quiet saved' : 'button button-quiet'} onClick={() => toggleWatchlist(featured)} aria-label={watchlist.includes(featured.id) ? 'Remove from watchlist' : 'Add to watchlist'} title={watchlist.includes(featured.id) ? 'Remove from my list' : 'Add to my list'}>
                  {watchlist.includes(featured.id) ? <Check size={17} /> : <Bookmark size={17} />}<span>{watchlist.includes(featured.id) ? 'In my list' : 'Add to my list'}</span>
                </button>
              </div>
            </div>
            <div className="hero-index"><span>01</span><span className="index-line" /><span>05</span></div>
            <div className="hero-note"><span>今夜の一本</span><span>TONIGHT'S FILM</span></div>
          </>}
        </section>

        <section className="catalog-section" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div><p className="eyebrow section-eyebrow"><span className="eyebrow-rule" /> CURATED FOR YOUR NEXT NIGHT IN</p><h2 id="catalog-title">{activeView === 'watchlist' ? 'Your watchlist' : 'Find your next favourite'}</h2></div>
            <button className="text-link" onClick={() => { setActiveView('discover'); setGenre('All films') }}>Browse all films <ArrowRight size={15} /></button>
          </div>
          <div className="catalog-controls">
            <div className="genre-list" aria-label="Filter by genre">
              {genres.map((item) => <button className={genre === item ? 'genre-chip selected' : 'genre-chip'} key={item} onClick={() => setGenre(item)}>{item}</button>)}
            </div>
            <button className="sort-button" onClick={() => setNotice('Showing our highest-rated picks')}><span>Recommended</span><ChevronDown size={15} /></button>
          </div>
          {visibleMovies.length > 0 ? <div className="movie-grid">
            {visibleMovies.map((movie, index) => <article className="movie-card" key={movie.id} style={{ '--card-order': index }}>
              <button className="poster-button" onClick={() => setSelectedMovie(movie)} aria-label={`View ${movie.title}`}>
                {brokenPosters.includes(movie.id) ? <span className="poster-fallback" aria-label={`${movie.title} artwork unavailable`}><span>{movie.originalTitle}</span><strong>{movie.title}</strong></span> : <img className="poster" src={movie.poster} alt={`${movie.title} film poster`} loading={index > 3 ? 'lazy' : 'eager'} onError={() => setBrokenPosters((current) => [...current, movie.id])} />}
                <span className="poster-scrim" /><span className="poster-rating"><Sparkles size={12} fill="currentColor" /> {movie.rating}</span><span className="poster-open"><ArrowDownRight size={18} /></span>
              </button>
              <button className={watchlist.includes(movie.id) ? 'save-button is-saved' : 'save-button'} onClick={() => toggleWatchlist(movie)} aria-label={watchlist.includes(movie.id) ? `Remove ${movie.title} from list` : `Save ${movie.title}`} title={watchlist.includes(movie.id) ? 'Remove from my list' : 'Add to my list'}>
                {watchlist.includes(movie.id) ? <Heart size={15} fill="currentColor" /> : <Bookmark size={15} />}
              </button>
              <div className="movie-info"><div className="movie-title-line"><h3>{movie.title}</h3><span>{movie.year}</span></div><p>{movie.genres.slice(0, 2).join(' · ')}</p></div>
            </article>)}
          </div> : <div className="empty-state"><Film size={25} /><h3>{activeView === 'watchlist' ? 'Your list is still a blank page.' : 'No films found.'}</h3><p>{activeView === 'watchlist' ? 'Save a film that catches your eye and it will be here.' : 'Try another title or choose a different genre.'}</p>{activeView === 'watchlist' && <button className="text-link" onClick={() => setActiveView('discover')}>Explore the catalogue <ArrowRight size={15} /></button>}</div>}
        </section>

        <footer className="site-footer">
          <div className="footer-brand"><span className="wordmark-mark"><Clapperboard size={16} /></span><span>SORA<span className="wordmark-dot">.</span></span></div>
          <p>Good stories stay with you.</p>
          <div className="storage-status" title={catalogSource === 's3' ? 'Connected to a public S3 catalogue' : 'Using the bundled static catalogue'}><span className={catalogSource === 's3' ? 'status-light connected' : 'status-light'} /><span>{catalogSource === 's3' ? 'S3 CATALOGUE' : 'STATIC CATALOGUE'}</span><span className="status-divider">/</span><span>{movies.length} FILMS</span></div>
        </footer>
      </div>

      {selectedMovie && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedMovie(null) }}>
        <section className="film-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          <button className="dialog-close icon-button" onClick={() => setSelectedMovie(null)} aria-label="Close film details"><X size={19} /></button>
          {brokenPosters.includes(selectedMovie.id) ? <div className="dialog-art-fallback" /> : <img className="dialog-art" src={selectedMovie.poster} alt="" onError={() => setBrokenPosters((current) => [...current, selectedMovie.id])} />}<div className="dialog-shade" />
          <div className="dialog-content"><p className="eyebrow"><span className="eyebrow-rule" /> {selectedMovie.year} · {selectedMovie.runtime} MIN</p><h2 id="dialog-title">{selectedMovie.title}</h2><p className="dialog-original">{selectedMovie.originalTitle} <span>·</span> Directed by {selectedMovie.director}</p><div className="dialog-rating"><Sparkles size={14} fill="currentColor" /> {selectedMovie.rating} <span>·</span> {selectedMovie.genres.join(' / ')}</div><p className="dialog-synopsis">{selectedMovie.synopsis}</p><button className="button button-primary" onClick={() => toggleWatchlist(selectedMovie)}>{watchlist.includes(selectedMovie.id) ? <Check size={16} /> : <Bookmark size={16} />}{watchlist.includes(selectedMovie.id) ? 'Saved to my list' : 'Add to my list'}</button></div>
        </section>
      </div>}
      {notice && <div className="toast" role="status"><Check size={15} />{notice}</div>}
    </main>
  )
}

export default App
