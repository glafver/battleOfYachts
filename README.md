# Battle of the Yachts

A nautical-themed [Battleship](https://en.wikipedia.org/wiki/Battleship_(game)) game. Sink your opponent's fleet before they sink yours — play against a friend in real time, or challenge the computer.

## Features

- 🎮 **Two game modes**
  - **Play with computer** — single-player against an AI opponent.
  - **Play with a friend** — real-time two-player over Socket.io.
- ⚓ **Manual or random ship placement** — drag ships onto the board yourself, or let the game place them.
- 📊 **Lobby & statistics** — after each game, see your per-player stats (games played, wins, win rate, accuracy).
- 📖 **How to play** — a step-by-step guide with screenshots.
- 📱 **Responsive** — works on desktop and mobile (with tabs to switch between boards on small screens).

## Project structure

This is a monorepo containing both the frontend and the backend:

```
battleOfYachts/
├── client/   # React frontend (create-react-app)
└── server/   # Node.js + Express + Socket.io backend
```

## Tech stack

**Frontend** — React, React Router, Socket.io Client, Bootstrap, Sass (SCSS).

**Backend** — Node.js, Express, Socket.io.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

### Installation

Install dependencies for both the client and the server:

```bash
# server
cd server
npm install

# client
cd client
npm install
```

### Environment variables

Copy the example env files and adjust if needed:

- `server/.env` — `PORT=4000` (the port the Socket.io server listens on).
- `client/.env` — `REACT_APP_SOCKET_URL=http://localhost:4000` (where the client connects).

### Run

Start the server, then the client:

```bash
# 1. start the backend (port 4000)
cd server
npm start

# 2. start the frontend (port 3000)
cd client
npm start
```

Open <http://localhost:3000> and play!

> **Note:** to play against a friend, open the app in two browsers/tabs and have both players join a game.

## How to play

1. Enter your name.
2. Choose a game mode (computer or friend).
3. Place your ships manually or randomly.
4. Take turns firing at the opponent's board — sink all their ships to win.
