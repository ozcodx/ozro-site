import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import NotFound from './components/NotFound';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
