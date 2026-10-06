import { createRouter as createVueRouter, createWebHashHistory } from "vue-router";
import ScriptLibraryHost from "./ScriptLibraryHost.vue";
import VoDubBrowserHost from "./VoDubBrowserHost.vue";
import LineEditorHost from "./LineEditorHost.vue";
import VoDubLineEditorHost from "./VoDubLineEditorHost.vue";
import RolesEditorHost from "./RolesEditorHost.vue";
import DubRolesEditorHost from "./DubRolesEditorHost.vue";

/*
 Every screen is a route. The editors used to be PrimeVue <Dialog>s mounted
 into document.body by their own createApp; now they are pages, so Back works
 and a given script or bucket can be linked to.

 Folders and buckets ride in the query string, not in path segments: they are
 absolute Windows paths whose drive-letter colon and backslashes do not
 survive a path segment.

 The folder picker is deliberately NOT a route. It answers a question --
 openBrowseDialog hands its caller a path through onSelect -- and a route has
 nowhere to put a return value.
*/
const routes = [
    { path: "/voicing", name: "voicing", component: ScriptLibraryHost },
    { path: "/voicing/roles", name: "voicing-roles", component: RolesEditorHost },
    { path: "/voicing/line", name: "voicing-line", component: LineEditorHost },

    { path: "/dubbing", name: "dubbing", component: VoDubBrowserHost },
    { path: "/dubbing/roles", name: "dubbing-roles", component: DubRolesEditorHost },
    { path: "/dubbing/bucket", name: "dubbing-bucket", component: VoDubLineEditorHost },

    { path: "/", redirect: "/voicing" },
    { path: "/:pathMatch(.*)*", redirect: "/voicing" },
];

export function createRouter() {
    return createVueRouter({
        history: createWebHashHistory(),
        routes,
    });
}
