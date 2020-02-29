const express = require('express');
const Docker = require('dockerode');

const app = express();
const PORT = 4040;

const docker = new Docker()

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  try {
    const containers = await docker.listContainers()
    const runningContainers = containers.filter(c => c.State === 'running')
    res.render('index', { title: 'Docker Containers', runningContainers });
  } catch (err) {
    console.error(err)
  }
})

app.listen(PORT, () => console.log(`📡 Server is listening on port ${PORT}!`));
