import FogaoEforno from './components/FogaoEforno/FogaoEforno';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import './App.css';

const App = () => {

  return (
    <div >
      <Router>
        <div className="App">
          <Routes>
            <Route path="/fogaoeforno" element={<FogaoEforno />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

export default App;
