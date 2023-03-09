import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './client/App'
import './client/index.css'

const loader = document.getElementById('loader');
const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App onLoaded={() => {
      root.style.opacity = 1;
      loader.remove();
      return new Promise(resolve => resolve());
    }} />
  </React.StrictMode>,
)
