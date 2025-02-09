# Project setup

Go to the current directory and run:
```shell
docker compose -p rp up -d
```
This will build and run docker containers needed.
Go to rp-node container:
```shell
docker exec -it rp-node /bin/sh 
```

Install and run a project:
```shell
npm install
npm run start
```

Now you are able to test API calls on http://localhost:3080
