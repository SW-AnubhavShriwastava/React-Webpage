import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotUsername from './pages/ForgotUsername';
import ForgotPassword from './pages/ForgotPassword';
import Home from './components/Home';
import ApiDetail from './pages/ApiDetail';
import PrivateRoute from './components/PrivateRoute'; // Import the PrivateRoute component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-username" element={<ForgotUsername />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Route */}
        <Route path="/dashboard" element={<PrivateRoute />}>
          <Route path="" element={<Home />} /> {/* Renders Home component only if authenticated */}
        </Route>

        <Route path="/api/:apiName" element={<ApiDetail />} /> {/* API Detail accessible after login */}
      </Routes>
    </Router>
  );
}

export default App;
