const express = require('express');
const Docker = require('dockerode');

const app = express();
const PORT = 3000;

const docker = new Docker()

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  const containers = await docker.listContainers()
  console.log(containers)
  res.render('index', { title: 'Docker Containers', containers })
})

app.listen(PORT, () => console.log(`📡 Server is listening on port ${PORT}!`));
