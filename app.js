const express = require('express');
const Docker = require('dockerode');
const utils = require('./utils');

const app = express();
const port = process.env.DOCK_PORT || 4040;

const docker = new Docker()

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  try {
    const containers = await docker.listContainers();
    const runningContainers = utils.transformContainerList(containers);

    const { Swarm } = await docker.info();
    if (Swarm.LocalNodeState === 'inactive') {
      res.render('index', { runningContainers, swarmInfo: null });
      return
    }

    const services = await docker.listServices();
    const tasks = await docker.listTasks();
    console.dir(tasks, { depth: null });
    const swarmInfo = utils.transformSwarmInfo(services, tasks)

    res.render('index', { runningContainers, swarmInfo });
  } catch (err) {
    console.error(err);
  }
});

app.listen(port, () => console.log(`📡 Server is listening on port ${port}!`));
