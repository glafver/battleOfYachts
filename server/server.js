#!/usr/bin/env node

/**
 * Module dependencies.
 */

require('dotenv').config();

const debug = require('debug')('game:server');
const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const { instrument } = require("@socket.io/admin-ui");
const socket_controller = require('./controllers/socket_controller');

/**
 * Get port from environment.
 */
const port = process.env.PORT || '4000';

/**
 * Create the Express app (used to serve the built React client).
 */
const app = express();
const publicDir = path.join(__dirname, 'public');

// Let Socket.io (a separate HTTP listener) handle its own requests.
app.use((req, res, next) => {
	if (req.url.startsWith('/socket.io')) {
		return;
	}
	next();
});

// Serve static files (the built React app).
app.use(express.static(publicDir));

// SPA fallback: serve index.html for any unmatched GET route.
app.get('*', (req, res) => {
	res.sendFile(path.join(publicDir, 'index.html'), (err) => {
		if (err) {
			res.status(404).send('Client not built. Run `npm run build` in client/ first.');
		}
	});
});

/**
 * Create HTTP and Socket.IO server.
 */
const server = http.createServer(app);
const io = new socketio.Server(server, {
	cors: {
		origin: '*',
		credentials: true,
	}
});

/**
 * Set up Socket.IO Admin
 */
instrument(io, {
	auth: false,
});

/**
 * Handle incoming connections
 */
io.on('connection', socket => {
	socket_controller(socket, io);
});

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EADDRINUSE':
			console.error(`Port ${port} is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
	const addr = server.address();
	console.log(`Listening on port ${addr.port}`);
}
