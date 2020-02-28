Build image: `docker build -t <username>/test-project .`

Start container:  `docker run -v /var/run/docker.sock:/var/run/docker.sock -p 4040:4040 <username>/test-project`.

Go to [localhost:4040](localhost:4040)