import type { IConfig } from '../../autoinstallers/plugins/node_modules/rush-init-project-plugin';
import SetDefaultAuthorPlugin from '../_plugins/SetDefaultAuthorPlugin';

const config: IConfig = {
  plugins: [new SetDefaultAuthorPlugin()],
};

export default config;
