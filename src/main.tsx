import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import App from './App.js'
import 'bootstrap/dist/css/bootstrap.min.css';
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
