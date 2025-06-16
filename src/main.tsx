import React from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import App from './App.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Provider } from 'react-redux';
import { store } from './Redux/store/Store.js';
import { ToastContainer } from 'react-toastify';
import 'react-loading-skeleton/dist/skeleton.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <Provider store={store}>
    <BrowserRouter>
      <App />
      <ToastContainer/>
    </BrowserRouter>
    </Provider>
  );
} else {
  console.error("Root element not found");
}
