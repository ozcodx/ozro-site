import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

const Main = lazy(() => import('./components/Main'));
const Information = lazy(() => import('./components/Information'));
const Database = lazy(() => import('./components/Database'));
const Rankings = lazy(() => import('./components/Rankings'));
const Donate = lazy(() => import('./components/Donate'));
const Thanks = lazy(() => import('./components/Thanks'));
const NotFound = lazy(() => import('./components/NotFound'));

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={
        <div className="loading-screen">
          <img src="/logo.png" alt="Cargando..." className="loading-logo" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/information" element={<Information />} />
          <Route path="/database" element={<Database />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
