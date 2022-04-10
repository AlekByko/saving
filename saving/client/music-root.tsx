import { MusicApp } from './music-app';
import { willRerenderOver } from './reacting';
import { fail, isNull } from './shared/core';

function run() {
    const rootElement = document.getElementById('root');
    if (isNull(rootElement)) return fail('No root element.');
    const willRender = willRerenderOver(MusicApp, rootElement);
    willRender({});
    return;
}
run();
