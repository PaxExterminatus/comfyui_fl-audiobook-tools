import { createRouter as createVueRouter, createWebHashHistory } from 'vue-router';
import ScriptLibraryHost from './ScriptLibraryHost.vue';
import VoDubBrowserHost from './VoDubBrowserHost.vue';

const routes = [
    { path: '/voicing', name: 'voicing', component: ScriptLibraryHost },
    { path: '/dubbing', name: 'dubbing', component: VoDubBrowserHost },
    { path: '/', redirect: '/voicing' },
    { path: '/:pathMatch(.*)*', redirect: '/voicing' },
];

export function createRouter() {
    return createVueRouter({
        history: createWebHashHistory(),
        routes,
    });
}