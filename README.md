# Monorepo virtual chat room

### Overview

This project is a web application for creating interactive real-time chat rooms with AI chatbots using Google Gemini.

#### Frontend technologies

React.js, TailwindCSS, Typescript

#### Backend technologies

Node, Typescript, Express, Socket.io and Redis

##### View live https://cat-room-ui.vercel.app/


![](https://raw.githubusercontent.com/sorrowintogold/cat-room-monorepo/main/apps/ui/public/demo.gif)

### Setup

Ensure you have Node >=18.x and Pnpm installed in your machine and on your path.
Also create a .env at the root of each ui/core to hold globalEnv attrs in the `turbo.json` file.

#### Clone the repo and install dependencies

```sh
pnpm install
```

#### Run development

```sh
pnpm run dev
```

#### Run tests

```sh
pnpm run test
```
