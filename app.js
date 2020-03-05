const express = require('express');
const Docker = require('dockerode');
const utils = require('./utils');

const app = express();
const port = process.env.DOCK_PORT || 4040;

const SUMO_ACCESS_ID = 'sumo-access-id';
const SUMO_ACCESS_KEY = 'sumo-access-key';
const LOG_COLLECTOR = 'log-collector';

const docker = new Docker();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))

app.get('/', async (req, res) => {
  console.log(`🦍 DON'T BE BAD!`)
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
    const swarmInfo = utils.transformSwarmInfo(services, tasks)

    res.render('index', { runningContainers, swarmInfo });
  } catch (err) {
    console.error(err);
  }
});

app.get('/creds', async (req, res) => {
  const services = await docker.listServices();
  const serviceForDeletion = services.find(svc => svc.Spec.Name === LOG_COLLECTOR);
  if (serviceForDeletion) {
    const logCollectorService = await docker.getService(LOG_COLLECTOR)
    await logCollectorService.remove();
  }

  const secretList = await docker.listSecrets();
  const secretsForDeletion = secretList.filter(s =>
    [SUMO_ACCESS_ID, SUMO_ACCESS_KEY].includes(s.Spec.Name)
  );
  await Promise.all(
    secretsForDeletion.map(s => {
      const secret = docker.getSecret(s.ID);
      return secret.remove();
    })
  );

  res.render('creds')
})

app.post('/creds', async (req, res) => {
  const { body } = req;
  // TODO: handle when there's already a service running
  // TODO: handle error and success, refactor!
  // TODO: be able to spin up a new task and container when the service is empty

  try {
    const sumoAccessId = await docker.createSecret({
      Name: SUMO_ACCESS_ID,
      Data: Buffer.from(body.sumoAccessId).toString('base64')
    });

    const sumoAccessKey = await docker.createSecret({
      Name: SUMO_ACCESS_KEY,
      Data: Buffer.from(body.sumoAccessKey).toString('base64'),
    });

    const service = await docker.createService({
      Name: 'log-collector',
      Labels: {
        'com.docker.stack.image': 'sumologic/collector:latest',
        'com.docker.stack.namespace': 'log-collector',
      },
      TaskTemplate: {
        ContainerSpec: {
          Image: 'sumologic/collector:latest',
          Env: [
            'SUMO_ACCESS_ID_FILE=/run/secrets/sumo-access-id',
            'SUMO_ACCESS_KEY_FILE=/run/secrets/sumo-access-key',
          ],
          Privileges: {
            CredentialSpec: null,
            SELinuxContext: null,
          },
          Mounts: [
            {
              Type: 'bind',
              Source: '/var/run/docker.sock',
              Target: '/var/run/docker.sock',
              ReadOnly: true,
            },
          ],
          StopGracePeriod: 10000000000,
          DNSConfig: {},
          Secrets: [
            {
              File: {
                Name: 'sumo-access-id',
                UID: '33',
                GID: '33',
                Mode: 384,
              },
              SecretID: sumoAccessId.id,
              SecretName: 'sumo-access-id',
            },
            {
              File: {
                Name: SUMO_ACCESS_KEY,
                UID: '33',
                GID: '33',
                Mode: 384,
              },
              SecretID: sumoAccessKey.id,
              SecretName: SUMO_ACCESS_KEY,
            },
          ],
        },
        Resources: {},
        RestartPolicy: {
          Condition: 'any',
          Delay: 5000000000,
          MaxAttempts: 0,
        },
        Placement: {
          Platforms: [
            {
              Architecture: 'amd64',
              OS: 'linux',
            },
          ],
        },
        ForceUpdate: 0,
        Runtime: 'container',
      },
      Mode: {
        Global: {},
      },
      UpdateConfig: {
        Parallelism: 1,
        FailureAction: 'pause',
        Monitor: 5000000000,
        MaxFailureRatio: 0,
        Order: 'stop-first',
      },
      RollbackConfig: {
        Parallelism: 1,
        FailureAction: 'pause',
        Monitor: 5000000000,
        MaxFailureRatio: 0,
        Order: 'stop-first',
      },
    });

    res.redirect('/')
  } catch (err) {
    console.error(err)
  }
})

app.listen(port, () => console.log(`📡 Server is listening on port ${port}!`));
