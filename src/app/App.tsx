import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { HomePage } from './components/HomePage';
import { LayoutPage } from './components/LayoutPage';
import { CameraPage } from './components/CameraPage';
import { FramePage } from './components/FramePage';
import { SavePage } from './components/SavePage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/layout" element={<LayoutPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/frame" element={<FramePage />} />
        <Route path="/save" element={<SavePage />} />
      </Routes>
    </BrowserRouter>
  );
}
