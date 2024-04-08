import { useStatsStore } from '../../stores/graph';
import { ModuleGraphChat } from '../../components/module-graph';

export const BodyComponent = () => {
  const graphData = useStatsStore(s => s.response);

  return (
    <>
      <ModuleGraphChat graphData={graphData!}></ModuleGraphChat>
    </>
  );
};
