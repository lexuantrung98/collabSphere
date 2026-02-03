import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 👇 KHÔNG CÒN <React.StrictMode> BAO QUANH NỮA
ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
)