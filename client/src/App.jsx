import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Your routes/components */}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;