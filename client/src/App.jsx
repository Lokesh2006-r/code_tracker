import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Department from './pages/Department';
import DepartmentDetails from './pages/DepartmentDetails';
import StudentProfile from './pages/StudentProfile';
import ExportPage from './pages/ExportPage';
import Login from './pages/Login';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-black text-white font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-auto relative z-10">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-zinc-800/20 rounded-full blur-[150px]" />
        </div>
        <main className="p-8">
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
