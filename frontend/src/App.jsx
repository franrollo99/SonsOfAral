// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { AppRouter } from "./routes/AppRouter";
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider><AppRouter /></AuthProvider>
    </BrowserRouter>
  );
}

export default App;
