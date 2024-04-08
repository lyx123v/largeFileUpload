import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useStatsStore } from '../../stores/graph';
import { LoadingStatus, ErrorStatus } from './status';
import { BodyComponent } from './body';

import s from './index.module.less';

const renderContent = () => {
  const loading = useStatsStore(state => state.loading);
  const error = useStatsStore(state => state.error);
  const res = useStatsStore(state => state.response);

  if (loading) {
    return <LoadingStatus />;
  } else if (!!error && error?.length > 0) {
    return <ErrorStatus />;
  } else if (res) {
    return <BodyComponent />;
  }
};

export function HomePage() {
  const { load } = useStatsStore(
    useShallow(state => ({
      load: state.load,
    })),
  );
  useEffect(() => {
    load();
  }, []);

  return <div className={s.container}>{renderContent()}</div>;
}
