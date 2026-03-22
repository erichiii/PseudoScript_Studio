# PseudoScript Studio

## ✨ Features

- **Landing Page**: Cute 3D computer asset with interactive zoom animation
- **Compiler Workspace**: Full-stack compiler with live explainability logs
- **Real-time Backend**: FastAPI integration for lexer, parser, and semantic analyzer phases

## Getting Started

### Backend (FastAPI)
1. Create/activate the virtual environment (optional but recommended):
	```bash
	python -m venv .venv
	.venv\Scripts\activate
	```
2. Install dependencies:
	```bash
	pip install -r requirements.txt
	```
3. Start the API server:
	```bash
	uvicorn server.main:app --reload
	```
	The compiler endpoints are now available at `http://localhost:8000`.

### Frontend (Vite + React)
1. Install dependencies:
	```bash
	cd frontend
	npm install
	```
2. Run the dev server:
	```bash
	npm run dev
	```
3. Visit `http://localhost:5173`. 
   - You'll see the landing page with a cute 3D computer.
   - Click the computer or press **SPACEBAR** to enter the compiler workspace.
   - The compiler UI now streams real logs from the Python backend.

### One-Command Dev Environment
- Start both FastAPI and Vite from the `frontend` folder:
	```bash
	npm run dev:full
	```
- This runs `uvicorn server.main:app --reload --host 0.0.0.0 --port 8000` and `vite` concurrently, so the React UI automatically talks to the fresh backend.

> Set a custom API origin via `VITE_API_URL` if the backend is not running on `http://localhost:8000`.