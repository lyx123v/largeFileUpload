import { useShallow } from 'zustand/react/shallow';
import { Empty, Spin, Typography, Button, Divider } from 'antd';

import { useStatsStore } from '../../stores/graph';

export const LoadingStatus = () => (
  <Empty
    description={
      <>
        <Spin /> Loading
      </>
    }
  />
);

export const ErrorStatus = () => {
  const error = useStatsStore(state => state.error);
  const { reload } = useStatsStore(
    useShallow(state => ({
      reload: state.reload,
    })),
  );

  return (
    <Empty
      description={
        <>
          <Typography.Text>错误原因： {error}</Typography.Text>
          <Divider />
          <Button onClick={reload}>重试</Button>
        </>
      }
    />
  );
};
