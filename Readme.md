# 🚀 Node.js + Express + TypeScript Backend

A step-by-step guide to set up a backend server using **Node.js**, **Express**, and **TypeScript**.

---

## 📦 Project Setup
### 1️⃣ Initialize Project
```bash
mkdir express-ts-backend
cd express-ts-backend
npm init -y
```

### 2️⃣ Install Dependencies
Install Express (production dependency):
```bash
npm install express
```

### Install development tools:
```bash
npm install -D typescript ts-node @types/node @types/express nodemon
```


### 📌 What these do:

typescript → TypeScript compiler (tsc)

ts-node → Run TypeScript files directly

@types/node → Type definitions for Node.js

@types/express → Type definitions for Express

nodemon → Auto-restarts the server on file changes

### 3️⃣ Setup TypeScript

Generate a tsconfig.json:
```bash
npx tsc --init
```

Update it for Node.js + Express:
```bash
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "lib": ["ESNext"],
    "types": ["node", "express"],
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```
### 4️⃣ Project Structure
express-ts-backend/
│── src/
│   └── index.ts     # Entry point
│── tsconfig.json
│── package.json

### 5️⃣ Create Express Server (src/index.ts)
```bash
import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript 🚀");
});

app.get("/api/users", (req: Request, res: Response) => {
  res.json([{ id: 1, name: "Vedant" }, { id: 2, name: "Pawar" }]);
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
```

### 6️⃣ Add NPM Scripts (package.json)
```bash
"scripts": {
  "dev": "nodemon --watch src --exec ts-node src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

### 📌 What these do:
```bash
npm run dev → Run server in development mode with live reload

npm run build → Compile TypeScript (src/ → dist/)

npm start → Run compiled JavaScript in production
```
### 7️⃣ Run the Server

Development mode:
```bash
npm run dev
```

Build + Production:
```bash
npm run build
npm start
```

### ✅ Endpoints
```bash
GET / → Returns Hello from Express + TypeScript 🚀

GET /api/users → Returns sample user JSON
```
🎉 You’re Ready!

You now have a fully working Node.js + Express + TypeScript backend server with hot-reload in dev and optimized build for production.