import './App.css';
import {Route, Link, Routes, useParams, useSearchParams, Navigate} from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <a
          className="App-link"
          href="https://github.com/jharring17/CS-554-Final-Project"
          target="_blank"
          rel="noopener noreferrer">
          Link to Github
        </a>
        <Routes>
          <Route path="/" element={<><p>Let's Put A Home Element Here</p></>}/>
        </Routes>
      </header>
    </div>
  );
}

export default App;
