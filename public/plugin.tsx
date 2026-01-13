import React from 'react';
import ReactDOM from 'react-dom';

import { i18n } from '@osd/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import { ScopdAiPluginSetup, ScopdAiPluginStart, AppPluginStartDependencies } from './types';
import { PLUGIN_NAME } from '../common';
import { AiFloatingButton } from './ui/ai_floating_button';


export class ScopdAiPlugin
  implements Plugin<ScopdAiPluginSetup, ScopdAiPluginStart>
{
  public setup(core: CoreSetup): ScopdAiPluginSetup {
    // Sidebar application (optional)
    core.application.register({
      id: 'scopdAi',
      title: PLUGIN_NAME,
      async mount(params: AppMountParameters) {
        const { renderApp } = await import('./application');
        const [coreStart, depsStart] = await core.getStartServices();

        return renderApp(
          coreStart,
          depsStart as AppPluginStartDependencies,
          params
        );
      },
    });

    // Return methods that should be available to other plugins
    return {
      getGreeting() {
        return i18n.translate('scopdAi.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: PLUGIN_NAME,
          },
        });
      },
    };
  }

  public start(core: CoreStart): ScopdAiPluginStart {
    core.chrome.navControls.registerRight({
      order: 1000,
      mount: (el) => {
        ReactDOM.render(
          <AiFloatingButton core={core} />,
          el
        );

        return () => {
          ReactDOM.unmountComponentAtNode(el);
        };
      },
    });

    return {};
  }

  public stop() {}
}
