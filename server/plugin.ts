import  { Observable } from 'rxjs';
import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../core/server';

import { ScopdAiPluginSetup, ScopdAiPluginStart, ScopdAiPluginConfig } from './types';
import { defineRoutes } from './routes';

export class ScopdAiPlugin implements Plugin<ScopdAiPluginSetup, ScopdAiPluginStart> {
  private readonly logger: Logger;
  private readonly config$: Observable<ScopdAiPluginConfig>;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    this.config$ = initializerContext.config.create<ScopdAiPluginConfig>();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('scopdAi: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router, {
      logger: this.logger,
      config$: this.config$,
    });

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('scopdAi: Started');
    return {};
  }

  public stop() {}
}
