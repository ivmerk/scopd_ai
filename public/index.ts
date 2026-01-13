import './index.scss';

import { ScopdAiPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.
export function plugin() {
  return new ScopdAiPlugin();
}
export { ScopdAiPluginSetup, ScopdAiPluginStart } from './types';
