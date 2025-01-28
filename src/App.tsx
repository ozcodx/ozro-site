import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import NotFound from './components/NotFound';
import Information from './components/Information';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/information" element={<Information />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
