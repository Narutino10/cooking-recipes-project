import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Header />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRecipe />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
