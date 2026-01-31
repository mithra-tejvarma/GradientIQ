import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardOverview from './pages/DashboardOverview';
import AssessmentPage from './pages/AssessmentPage';
import AnalysisPage from './pages/AnalysisPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="assessment" element={<AssessmentPage />} />
        <Route path="analysis" element={<AnalysisPage />} />
      </Route>
    </Routes>
  );
}

export default App;
