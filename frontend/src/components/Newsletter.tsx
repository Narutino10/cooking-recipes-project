import { useState } from 'react';
import { newsletterService } from '../services/newsletterService';
import '../styles/components/Newsletter.scss';

interface NewsletterProps {
  className?: string;
}

const Newsletter = ({ className = '' }: NewsletterProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Veuillez entrer une adresse email valide.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await newsletterService.subscribe({
        email,
        preferences: {
          newRecipes: true,
          weeklyDigest: true,
          communityUpdates: true,
        },
      });

      setMessage({ type: 'success', text: result.message });
      setIsSubscribed(true);
      setEmail('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Veuillez entrer une adresse email valide.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await newsletterService.unsubscribe(email);
      setMessage({ type: 'success', text: result.message });
      setIsSubscribed(false);
      setEmail('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`newsletter ${className}`}>
      <h5>Newsletter</h5>
      <p>Recevez nos meilleures recettes chaque semaine</p>

      <form onSubmit={handleSubmit} className="newsletter-form">
        <div className="newsletter-input-group">
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="newsletter-btn"
          >
            {isLoading ? (
              <span className="loading-spinner">⟳</span>
            ) : isSubscribed ? (
              'Abonné ✓'
            ) : (
              'S\'abonner'
            )}
          </button>
        </div>

        {message && (
          <div className={`newsletter-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {isSubscribed && (
          <button
            type="button"
            onClick={handleUnsubscribe}
            className="newsletter-unsubscribe"
            disabled={isLoading}
          >
            Se désabonner
          </button>
        )}
      </form>
    </div>
  );
};

export default Newsletter;
