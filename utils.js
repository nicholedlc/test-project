const transformContainerList = containers =>
  containers
    .filter(c => c.State === 'running')
    .map(c => ({
      ...c,
      // Map ports to the following format: [9300/tcp, 0.0.0.0:9100→9200/tcp]
      Ports: c.Ports.map(p => {
        const portMapping = [p.PublicPort, p.PrivatePort]
          .filter(i => !!i)
          .join('→');
        return [[p.IP, portMapping].filter(i => !!i).join(':'), p.Type].join(
          '/'
        );
      }),
    }));

const formatTasks = (svc, tasks) =>
  tasks
    .filter(t => t.ServiceID === svc.ID && t.Status.State === 'running')
    .sort((a, b) => a.Slot - b.Slot)
    .map(t => ({
      id: t.ID.slice(0, 12),
      slot: t.Slot,
      nodeId: t.NodeID.slice(0, 12),
      container: t.Status,
    }));

const getTaskCount = svc => {
  const replicas =
    svc.Mode && svc.Mode.Replicated && svc.Mode.Replicated.Replicas;
  return replicas ? { replicas } : {};
};

const transformSwarmInfo = (services, tasks) =>
  services.reduce(
    (acc, svc) => [
      ...acc,
      {
        ...getTaskCount(svc),
        id: svc.ID.slice(0, 12),
        name: svc.Spec.Name,
        tasks: formatTasks(svc, tasks),
      },
    ],
    []
  );

module.exports = { transformContainerList, transformSwarmInfo }