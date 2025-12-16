# Student Performance Tracker & Productivity Hub

A comprehensive dashboard for tracking student coding performance across multiple platforms (LeetCode, Codeforces, CodeChef, HackerRank). Built with a modern, premium "Dark/Silver" aesthetic.

## 🚀 Features

*   **Multi-Platform Tracking**: Aggregates statistics from:
    *   **LeetCode**: Solved count (Easy/Medium/Hard), Contest Rating, Global Rank.
    *   **Codeforces**: Rating, Max Rating, Rank, Problem Count.
    *   **CodeChef**: Rating, Stars, Division, Global/Country Rank.
    *   **HackerRank**: Badges, Problems Solved.
*   **Analytics Dashboard**: Visualizations using Recharts for overall class performance.
*   **Excel Export Engine**:
    *   **Performance Report**: detailed multi-sheet workbook for all platforms.
    *   **Contest Data Report**: Generate reports for specific contests (e.g., "Weekly Contest 300") with custom headers and calculated "Top %" metrics.
*   **Premium UI**: Custom-designed dark theme with glassmorphism, smooth animations (Framer Motion), and responsive layout.
*   **Automated Data Sync**: Background scheduler to update student stats periodically.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS, Vanilla CSS (Custom dark theme)
*   **Animations**: Framer Motion
*   **Charts**: Recharts
*   **Icons**: Lucide React

### Backend
*   **Framework**: FastAPI (Python)
*   **Database**: MongoDB (via PyMongo)
*   **Data Processing**: Pandas, OpenPyXL (Advanced Excel generation)
*   **Scraping/API**: HTTPX, BeautifulSoup4, Re (Regex)
*   **Scheduling**: APScheduler

## ⚙️ Setup Instructions

### Prerequisites
*   Node.js & npm
*   Python 3.10+
*   MongoDB (Local or Atlas)

### 1. Database Setup
Ensure MongoDB is running locally on port `27017` or update the `MONGO_URI` in the server configuration.

### 2. Backend Setup
Navigate to the server directory:
```bash
cd server
```

Create and activate a virtual environment (optional but recommended):
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

Install dependencies:
```bash
pip install fastapi uvicorn pymongo python-dotenv httpx beautifulsoup4 pandas openpyxl apscheduler requests
```

Create a `.env` file in the `server` directory:
```env
MONGO_URI=mongodb://localhost:27017
SECRET_KEY=your_secret_key_here
```

Run the server:
```bash
# Using Python directly (Windows)
py -m uvicorn main:app --reload --port 8000

# Or using uvicorn directly
uvicorn main:app --reload --port 8000
```
Server will start at `http://localhost:8000`.

### 3. Frontend Setup
Navigate to the client directory:
```bash
cd client
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 📂 Project Structure

```
contest_tracker2/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components (Sidebar, StatCards)
│   │   ├── pages/          # Dashboard, StudentProfile, ExportPage
│   │   └── ...
│   └── ...
├── server/                 # FastAPI Backend
│   ├── api/routes/         # API Endpoints
│   ├── services/           # Business Logic (platforms, export)
│   ├── models/             # Data Models
│   └── ...
└── README.md
```

## 📝 Usage

1.  **Add Students**: Use the API or Dashboard (if enabled) to add students by their Register Number and Platform Usernames.
2.  **View Profiles**: Click on a student to see their detailed aggregated stats.
3.  **Refresh Data**: Use the "Verify/Refresh" button on a profile to fetch the latest live data.
4.  **Export Reports**: Go to the "Export" page to download Excel reports for specific departments, years, or contests.
