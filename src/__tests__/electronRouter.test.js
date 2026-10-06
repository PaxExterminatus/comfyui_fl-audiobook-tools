import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter as createElectronRouter } from '../../electron-ui/router.js';
import App from '../../electron-ui/App.vue';
import { createRouter as createVueRouter, createMemoryHistory } from 'vue-router';


describe('Electron Router', () => {
  it('resolves /voicing to the voicing route', async () => {
    const router = createElectronRouter();
    await router.push('/voicing');
    expect(router.currentRoute.value.name).toBe('voicing');
  });

  it('resolves /dubbing to the dubbing route', async () => {
    const router = createElectronRouter();
    await router.push('/dubbing');
    expect(router.currentRoute.value.name).toBe('dubbing');
  });

  it('redirects / to /voicing', async () => {
    const router = createElectronRouter();
    await router.push('/');
    expect(router.currentRoute.value.path).toBe('/voicing');
  });

  it('redirects unknown paths to /voicing', async () => {
    const router = createElectronRouter();
    await router.push('/some/random/path');
    expect(router.currentRoute.value.path).toBe('/voicing');
  });

  it('uses hash-based history', () => {
    const router = createElectronRouter();
    expect(router.options.history.createHref('/voicing')).toBe('#/voicing');
  });
});

describe('App Shell', () => {
  it('navigates to dubbing route when clicking Дубляж button', async () => {
    const router = createVueRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/voicing', name: 'voicing', component: { template: '<div>Voicing</div>' } },
        { path: '/dubbing', name: 'dubbing', component: { template: '<div>Dubbing</div>' } },
      ]
    });

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          RouterView: true
        }
      }
    });

    const buttons = wrapper.findAll('button');
    const dubbingBtn = buttons.find(b => b.text().includes('Дубляж'));
    expect(dubbingBtn).toBeTruthy();

    await dubbingBtn.trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/dubbing');
  });

  it('shows both mode buttons', () => {
    const router = createVueRouter({
      history: createMemoryHistory(),
      routes: []
    });

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          RouterView: true
        }
      }
    });

    expect(wrapper.text()).toContain('Озвучка');
    expect(wrapper.text()).toContain('Дубляж');
  });
});
