🚦 Intelligent Traffic & Streetlight Management System

An integrated IoT + AI solution that automates streetlight and traffic signal control using real-time camera and motion data. Built with a FastAPI/Flask backend and a React + Vite + TailwindCSS frontend for smooth communication and analytics visualization.

🧩 Tech Stack

Frontend: React, Vite, TailwindCSS
Backend: Python (FastAPI/Flask)
Communication: REST API + WebSocket
Tools: Node.js, Virtual Environment (venv)

🗂 Project Structure

project-root/
│
├── backend/
│   ├── devices/              # IoT device logic  
│   ├── motion/               # Motion and camera modules  
│   ├── config.py             # App configuration  
│   ├── server.py             # Main backend server  
│   ├── shared_state.py       # Shared memory/state manager  
│   └── requirements.txt      # Python dependencies  
│
├── src/
│   ├── assets/               # Static media  
│   ├── components/           # React UI components  
│   ├── lib/                  # Utility and helper functions  
│   ├── App.jsx               # Main React component  
│   └── main.jsx              # App entry point  
│
├── public/                   # Public frontend assets  
├── tailwind.config.js        # Tailwind setup  
├── vite.config.js            # Vite build config  
├── package.json              # Node dependencies  
└── README.md                 # Documentation  

⚙️ Installation
1️⃣ Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python server.py


Backend runs by default on http://127.0.0.1:5000

2️⃣ Frontend Setup
npm install
npm run dev


Frontend runs on http://localhost:5173

🌐 Features

🚘 Adaptive Signal Control based on vehicle density

💡 Automated Streetlight Dimming

📊 Real-time Traffic Analytics Dashboard

⚡ Energy Generation Integration (Wind Turbines)

🧠 Shared State System for backend coordination

📸 UI & Visualization

Interactive web dashboard for monitoring and manual override with smooth Tailwind animations and responsive layout.
