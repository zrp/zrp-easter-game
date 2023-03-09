import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './client/App'
import './client/index.css'

const loader = document.getElementById('loader');
const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App onLoaded={() => {
      if (process.env.NODE_ENV == 'production') {
        loader.querySelectorAll('span').forEach(el => el.innerHTML = 'Carregado!');

        loader.animate({ transform: 'translateY(-100%)' }, { delay: 500, duration: 700, iterations: 1, fill: 'forwards' });
        root.animate({ opacity: 1 }, { delay: 0, duration: 300, iterations: 1, fill: 'forwards' });

        return new Promise((resolve) => {
          setTimeout(() => {
            loader.remove();
            resolve();
          }, 1200);
        })
      } else {
        root.style.opacity = 1;
        loader.remove();
        return new Promise(resolve => resolve());
      }
    }} />
  </React.StrictMode>,
)
