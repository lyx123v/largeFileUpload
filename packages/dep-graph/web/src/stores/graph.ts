import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { type DepGraph } from '@demo/dep-graph-core';

import { fetchGraph } from '../api/graph';

interface StoreState {
  response?: DepGraph;
  loading: boolean;
  error?: string;
}

const defaultState: StoreState = {
  response: undefined,
  loading: false,
  error: undefined,
};

interface StoreActions {
  load: () => Promise<void>;
  reload: () => Promise<void>;
}

export const useStatsStore = create<StoreState & StoreActions>()(
  devtools(
    subscribeWithSelector(set => {
      const load = async () => {
        try {
          set({ loading: true });
          const response = await fetchGraph();
          set({ response, loading: false });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
        }
      };
      return {
        ...defaultState,
        load,
        reload: () => {
          set({ error: undefined });
          return load();
        },
      };
    }),
    {
      enabled: true,
      name: 'statsStore',
    },
  ),
);
