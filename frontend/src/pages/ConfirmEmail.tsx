import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmEmail } from '../services/authService';
import '../styles/pages/ConfirmEmail.scss';

const ConfirmEmail = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de confirmation manquant.');
      return;
    }

    const confirm = async () => {
      try {
        const response = await confirmEmail(token);
        setStatus('success');
        // Fallback si le backend ne renvoie pas de message
        setMessage(response?.message || 'Email confirmé avec succès.');

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        console.error('Confirm email error:', error);
        setStatus('error');
        const serverMessage = error?.response?.data?.message;
        const fallback = error?.message || 'Erreur lors de la confirmation de l\'email.';
        setMessage(serverMessage || fallback);
      }
    };

    confirm();
  }, [searchParams, navigate]);

  return (
    <div className="confirm-email-page">
      <div className="confirm-container">
        {status === 'loading' && (
          <div className="loading-state">
            <div className="spinner"></div>
            <h1>Confirmation en cours...</h1>
            <p>Veuillez patienter pendant que nous confirmons votre email.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="success-state">
            <div className="success-icon">✅</div>
            <h1>Email confirmé !</h1>
            <p>{message}</p>
            <p className="redirect-info">
              Vous allez être redirigé vers la page de connexion dans quelques secondes...
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="login-button"
            >
              Aller à la connexion
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h1>Erreur de confirmation</h1>
            <p>{message}</p>
            <div className="error-actions">
              <button 
                onClick={() => navigate('/register')}
                className="register-button"
              >
                Créer un nouveau compte
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="login-button"
              >
                Retour à la connexion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
