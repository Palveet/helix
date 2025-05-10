
## Project Overview

- Frontend: React + TypeScript (Vite)
- Backend: Flask (Python 3.10+)
- Database: PostgreSQL
- Agentic Infra: LLM-based 

---

## Local Setup Instructions

Tested on Windows


### Setting Open API Key

1. Open Command Prompt (cmd)
2. Set your API key:
   ```cmd
   set OPENAI_API_KEY=your-api-key-here
   ```
3. Run your application from the same Command Prompt window

Remember that the `set` command only sets the environment variable for the current Command Prompt session. If you close the window, you'll need to set it again.

If you want to make it permanent, you can:
1. Open System Properties (Win + Pause/Break)
2. Click "Environment Variables"
3. Under "User variables", click "New"
4. Set Variable name as `OPENAI_API_KEY`
5. Set Variable value as your API key
6. Click OK

This way you won't need to set it via command line each time you start a new session.



### 1. Backend Setup (Python Flask)

#### Set up a virtual environment:

```bash
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
```

#### Install backend dependencies:

```bash
pip install -r requirements.txt
```

#### Configure the database:

Make sure PostgreSQL is installed and running.

Create a database:

```bash
createdb helix_db
```

Check or update your `backend/config.py`:

```python
SQLALCHEMY_DATABASE_URI = 'postgresql://<username>:<password>@localhost/helix_db'
```

(Update `postgres` and `password` if you have different credentials.)

### Create Tables
```
open python shell and run these commands

from models import db
db.create_all()
exit()
```

#### Run the backend server:

```bash
export FLASK_APP=app.py  
flask run
```

Backend will start at: http://localhost:5000

---

### 3. Frontend Setup (React + Vite)

#### Install Node.js dependencies:

```bash
npm install
```

#### Run the frontend app:

```bash
npm run dev
```

Frontend will be live at: http://localhost:3000

---

## Folder Structure

```plaintext
helix/
├── backend/
│   ├── app.py             # Main Flask app
│   ├── config.py          # DB config (PostgreSQL URI)
│   ├── models/            # SQLAlchemy models (User, Sequences, etc.)
│   ├── routes/            # Flask API routes
│   ├── agents/            # Agentic logic 
│   └── requirements.txt   # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components (ChatBar, Workspace, SequenceItem)
│   │   ├── hooks/          # React custom hooks
│   │   ├── pages/          # Main pages (Home, etc.)
│   │   ├── services/       # API services (Axios setup)
│   │   ├── utils/          # Utility functions/helpers
│   │   └── App.tsx         # Main React App
│   ├── public/             # Static files
│   ├── package.json        # Frontend dependencies and scripts
│   └── vite.config.ts      # Vite config
│
├── README.md               # Project documentation (this file)
└── helix_db/                # PostgreSQL local database (if needed)
```

---

## Key Features

- Chat-Driven Interface: Recruiters input ideas conversationally.
- Dynamic Workspace: Live sequence editing and AI reactions.
- Live Updates: Changes reflect instantly across chat and workspace.
- Persistent Data: Stores recruiter preferences and sequences.
- Agentic Architecture: Modular LLM agent backend.

---

##  Commands

| Command             | Purpose                             |
| :------------------ | :---------------------------------- |
| `npm run dev`        | Start frontend server (React)       |
| `npm run build`      | Build frontend for production       |
| `npm run preview`    | Preview production build locally    |
| `flask run`          | Start backend server (Flask)        |

---

## Checklist Completed

- React + Typescript Frontend
- Flask Modular Backend
- PostgreSQL Database
- Real-Time Workspace Updates
- Dynamic Sequence Generation
- Basic Agentic Infrastructure


---

##  Resources Used

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite](https://vitejs.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Socket.IO for live updates](https://socket.io/)

