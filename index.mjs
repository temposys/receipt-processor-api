import { createServer } from 'node:http';
const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World!\n');
});
// starts a simple http server locally on port 3000
server.listen(8080, 'localhost', () => {
    console.log('Listening on localhost:8080');
});
