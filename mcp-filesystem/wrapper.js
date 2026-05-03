import express from 'express';
import { spawn } from 'child_process';
import readline from 'readline';

const app = express();
app.use(express.json());

const mcpCommand = 'npx';

const mcpArgs = [
    '-y', 
    '@modelcontextprotocol/server-filesystem', 
    '/mnt/documents'
];

const mcpProcess = spawn(mcpCommand, mcpArgs, { shell: true });
let sseResponse = null;

const rl = readline.createInterface({
    input: mcpProcess.stdout,
    terminal: false
});

rl.on('line', (line) => {
    if (sseResponse) {
        sseResponse.write(`event: message\ndata: ${line}\n\n`);
    }
});

mcpProcess.stderr.on('data', (data) => {
    console.error(`[Filesystem MCP Log]: ${data.toString()}`);
});


app.get('/fs/sse', (req, res) => {    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    sseResponse = res;
    
    res.write(`event: endpoint\ndata: /fs/messages\n\n`);
});

app.post('/fs/messages', (req, res) => {
    const message = JSON.stringify(req.body);
    mcpProcess.stdin.write(message + '\n');
    res.status(200).send('OK');
});

const PORT = 8001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Filesystem server listening in port: ${PORT}`);
});