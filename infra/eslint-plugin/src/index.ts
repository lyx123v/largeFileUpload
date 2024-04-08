import { jsonParser } from './processors/json';

export const preset = {
  processors: {
    '.json': jsonParser,
  },
};
