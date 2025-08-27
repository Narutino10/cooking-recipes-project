import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import GenerateRecipe from './pages/GenerateRecipe';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Login from './pages/Login';
import Register from './pages/Register';
import ConfirmEmail from './pages/ConfirmEmail';
import Profile from './pages/Profile';
import ChatPage from './pages/ChatPage';
import MyRecipes from './pages/MyRecipes';
import UpdateRecipe from './pages/UpdateRecipe';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <Header />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="/generate" element={<GenerateRecipe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
          <Route path="/edit-recipe/:id" element={<UpdateRecipe />} />
          <Route path="/chat" element={<ChatPage />} />

        </Routes>
      </main>
      <Footer />
  <ChatWidget />
    </Router>
  );
}

export default App;
