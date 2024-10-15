import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// @ts-ignore

import $ from 'jquery';
import 'bootstrap';
import 'bootstrap-select';

// Import styles
import './styles/style.scss';
import './global.css';
import './styles/animate.css';
import './styles/drift-basic.min.css';
import './styles/image-compare-viewer.min.css';
import './styles/bootstrap.min.css';
import './styles/photoswipe.css';
import './styles/styles.css';
import './styles/swiper-bundle.min.css';
import './styles/font-icons.css';
import './styles/fonts.css';

// Import JavaScript files
import './js/bootstrap.min.js';
import './js/bootstrap-select.min.js';
import './js/carousel.js';
import './js/count-down.js';
import './js/drift.min.js';
import './js/jquery-validate.js'
import './js/jquery.min.js';
import './js/lazysize.min.js'
import './js/main.js';
import './js/shop.js';
import './js/wow.min.js';
import './js/swiper-bundle.min.js';
import './js/rangle-slider.js';









import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
);
