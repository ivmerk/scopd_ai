import { PluginInitializerContext } from '../../../core/server';
import { ScopdAiPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new ScopdAiPlugin(initializerContext);
}

export { ScopdAiPluginSetup, ScopdAiPluginStart } from './types';
