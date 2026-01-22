import {schema} from '@osd/config-schema';
import { PluginInitializerContext } from '../../../core/server';
import { ScopdAiPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export const config = {
  schema: schema.object({
    openAiKey: schema.string({ defaultValue: '' }),
  }),
};

export function plugin(initializerContext: PluginInitializerContext) {
  return new ScopdAiPlugin(initializerContext);
}

export { ScopdAiPluginSetup, ScopdAiPluginStart } from './types';
