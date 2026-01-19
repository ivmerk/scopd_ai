import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../core/server';

import { ScopdAiPluginSetup, ScopdAiPluginStart } from './types';
import { defineRoutes } from './routes';

export class ScopdAiPlugin implements Plugin<ScopdAiPluginSetup, ScopdAiPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('scopdAi: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router, {
      logger: this.logger
    });

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('scopdAi: Started');
    return {};
  }

  public stop() {}
}
