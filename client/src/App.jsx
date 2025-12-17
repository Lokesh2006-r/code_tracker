import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Department from './pages/Department';
import DepartmentDetails from './pages/DepartmentDetails';
import StudentProfile from './pages/StudentProfile';
import ExportPage from './pages/ExportPage';
import Login from './pages/Login';
import StudentsLeaderboard from './pages/StudentsLeaderboard'; // New import

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop, sliding on mobile */}
      <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-auto relative z-10 w-full">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-zinc-800/20 rounded-full blur-[150px]" />
        </div>

        {/* Mobile Header with Menu Button */}
        <div className="md:hidden p-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-lg font-bold text-white">CodeTrack</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white">
            <Menu size={24} />
          </button>
        </div>

        <main className="p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/department" element={<Department />} />
                <Route path="/department/:deptName" element={<DepartmentDetails />} />
                <Route path="/student/:regNo" element={<StudentProfile />} />
                <Route path="/students" element={<StudentsLeaderboard />} />
                <Route path="/export" element={<ExportPage />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
