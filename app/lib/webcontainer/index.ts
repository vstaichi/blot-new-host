import { WebContainer } from '@webcontainer/api';
import { WORK_DIR_NAME } from '~/utils/constants';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = import.meta.hot?.data.webcontainerContext ?? {
  loaded: false,
};

if (import.meta.hot) {
  import.meta.hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

if (!import.meta.env.SSR) {
  webcontainer =
    import.meta.hot?.data.webcontainer ??
    Promise.resolve()
      .then(() => {
        return WebContainer.boot({
          workdirName: WORK_DIR_NAME,
          forwardPreviewErrors: true, // Enable error forwarding from iframes
        });
      })
      .then((webcontainer) => {
        webcontainerContext.loaded = true;

        // Listen for preview errors
        webcontainer.on('preview-message', (message) => {
          console.log('WebContainer preview message:', message);
        });

        return webcontainer;
      });

  if (import.meta.hot) {
    import.meta.hot.data.webcontainer = webcontainer;
  }
}
