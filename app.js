const express = require('express');
const Docker = require('dockerode');

const app = express();
const port = process.env.DOCK_PORT || 4040;

const docker = new Docker()

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  try {
    const containers = await docker.listContainers()
    const runningContainers = containers.filter(c => c.State === 'running')
    const services = await docker.listServices()
    const tasks = await docker.listTasks()

    const swarm = services.reduce((acc, svc) => {
      const replicas = svc.Mode && svc.Mode.Replicated && svc.Mode.Replicated.Replicas;
      const taskCount = replicas ? { replicas } : {}
      return [
        ...acc,
        {
          ...taskCount,
          id: svc.ID.slice(0, 12),
          name: svc.Spec.Name,
          tasks: tasks
            .sort((a, b) => a.Slot - b.Slot)
            .filter(t => t.ServiceID === svc.ID)
            .map(t => ({
              id: t.ID.slice(0, 12),
              slot: t.Slot,
              nodeId: t.NodeID.slice(0, 12),
              container: t.Status,
            })),
        },
      ];
    }, [])

    console.dir({ services }, { depth: null })
    res.render('index', { title: 'Docker Containers', runningContainers, swarm });
  } catch (err) {
    console.error(err)
  }
})

app.listen(port, () => console.log(`📡 Server is listening on port ${port}!`));
