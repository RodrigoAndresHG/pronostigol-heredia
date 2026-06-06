import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import MotionProvider from './movimiento/MotionProvider.tsx';
import { SonidoProvider } from './movimiento/SonidoContext.tsx';

/**
 * Punto de entrada.
 *   BrowserRouter → SonidoProvider → MotionProvider → App
 * - MotionProvider: respeto global a prefers-reduced-motion.
 * - SonidoProvider: micro-sonidos UI compartidos (apagados por defecto).
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SonidoProvider>
        <MotionProvider>
          <App />
        </MotionProvider>
      </SonidoProvider>
    </BrowserRouter>
  </StrictMode>
);
