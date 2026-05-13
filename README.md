# 🧠 EEG Analysis Project

A machine learning and EEG signal processing project built using **Python 3.12.4**, **TensorFlow**, and modern frontend tooling.

---

# 🚀 Prerequisites

Before starting, make sure the following are installed on your machine:

- Python 3.12.4
- Node.js (Latest LTS Recommended)
- npm
- Git

---

# 📦 Clone the Repository

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

---

# 🐍 Install Python 3.12.4

Download Python 3.12.4 from the official website:

https://www.python.org/downloads/release/python-3124/

### During Installation

Make sure to:

- ✅ Check **"Add Python to PATH"**
- ✅ Install for all users (Optional but Recommended)

---

# 📁 Create Virtual Environment

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

## Windows

```bash
venv\Scripts\activate
```

## macOS / Linux

```bash
source venv/bin/activate
```

---

# 📚 Install Python Dependencies

Install required Python packages:

```bash
pip install -r requirements.txt
```

---

# 📄 requirements.txt

```txt
numpy==1.26.4
scipy==1.11.4
pandas==2.2.2
matplotlib==3.8.4
seaborn==0.13.2
scikit-learn==1.5.1
mne==1.6.1
pymatreader==0.0.32
tensorflow==2.17.1
```

---

# 🌐 Install Frontend Dependencies

Install npm packages:

```bash
npm install
```

---

# ▶️ Run the Project

Start the development server:

```bash
npm run dev
```

---

# ✅ Recommended Versions

| Software | Version |
|----------|----------|
| Python | 3.12.4 |
| Node.js | Latest LTS |
| TensorFlow | 2.17.1 |

---

# 🛠 Troubleshooting

## Python Not Recognized

If you get:

```bash
'python' is not recognized as an internal or external command
```

Reinstall Python and ensure:

- ✅ "Add Python to PATH" is checked

---

## Virtual Environment Activation Error (Windows)

Run PowerShell as Administrator and execute:

```powershell
Set-ExecutionPolicy RemoteSigned
```

Then try activating the environment again.

---

# 📌 Notes

- Always activate the virtual environment before running the project.
- Restart the terminal after installing Python or Node.js.
- Recommended IDE: Visual Studio Code

---

# 👨‍💻 Development Workflow

```bash
# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
npm install

# Run development server
npm run dev
```

---

# 📜 License

This project is intended for educational and research purposes.
