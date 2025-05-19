import React from 'react';
import ReactDOM from 'react-dom';
import { MusicApp } from './music-app';


if (window.sandbox === 'starting-music-app') {
    const rootElement = document.getElementById('root')!;
    const ctx = new window.AudioContext();
    ReactDOM.render(<MusicApp ctx={ctx} />, rootElement);
}
