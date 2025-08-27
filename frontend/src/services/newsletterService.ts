import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface NewsletterSubscription {
  email: string;
  preferences?: {
    newRecipes: boolean;
    weeklyDigest: boolean;
    communityUpdates: boolean;
  };
}

export interface NewsletterEmail {
  subject: string;
  content: string;
  recipients: string[];
  type: 'new_recipe' | 'weekly_digest' | 'community_update';
}

class NewsletterService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/newsletter`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // S'abonner à la newsletter
  async subscribe(subscription: NewsletterSubscription): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/subscribe', subscription);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de l\'abonnement à la newsletter:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'abonnement');
    }
  }

  // Se désabonner de la newsletter
  async unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/unsubscribe', { email });
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors du désabonnement:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du désabonnement');
    }
  }

  // Envoyer un email newsletter (côté admin)
  async sendNewsletter(emailData: NewsletterEmail): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/send', emailData);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de la newsletter:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    }
  }

  // Obtenir les statistiques de la newsletter (côté admin)
  async getStats(): Promise<{
    totalSubscribers: number;
    activeSubscribers: number;
    emailsSent: number;
  }> {
    try {
      const response = await this.api.get('/stats');
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // Vérifier si un email est abonné
  async isSubscribed(email: string): Promise<boolean> {
    try {
      const response = await this.api.get(`/is-subscribed/${encodeURIComponent(email)}`);
      return response.data.subscribed;
    } catch (error: any) {
      console.error('Erreur lors de la vérification d\'abonnement:', error);
      return false;
    }
  }
}

export const newsletterService = new NewsletterService();
