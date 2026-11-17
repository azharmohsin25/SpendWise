import React from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App.jsx'
import './styles.css'
import './styles/creative.css'
import './styles/spatial.css'

createRoot(document.getElementById('root')).render(<React.StrictMode><MotionConfig reducedMotion="user"><App /></MotionConfig></React.StrictMode>)
