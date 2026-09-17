import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutSection, EventGallery, TracksAndSchedule, VenueSponsorsFaq } from './components/Sections';
import './style.css';

function App() {
  return <MotionConfig reducedMotion="user"><Header /><main><Hero /><AboutSection /><EventGallery /><TracksAndSchedule /><VenueSponsorsFaq /></main><Footer /></MotionConfig>;
}

createRoot(document.getElementById('root')!).render(<App />);
