import { useState, useEffect } from 'react';
import '../styles/pages/Events.scss';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'workshop' | 'tasting' | 'competition' | 'meeting';
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  image: string;
  organizer: string;
  tags: string[];
  featured: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Simulation de données d'événements
    const mockEvents: Event[] = [
      {
        id: 1,
        title: "Atelier Cuisine Française Traditionnelle",
        description: "Apprenez les bases de la cuisine française avec notre chef étoilé. Au programme : techniques de base, sauces classiques et dressage.",
        date: "2025-02-15",
        time: "14:00 - 18:00",
        location: "École de Cuisine Paris, 15ème",
        type: "workshop",
        price: 85,
        maxParticipants: 12,
        currentParticipants: 8,
        image: "/images/events/french-workshop.jpg",
        organizer: "Chef Jean-Pierre Dubois",
        tags: ["atelier", "français", "techniques"],
        featured: true
      },
      {
        id: 2,
        title: "Dégustation Vins & Fromages",
        description: "Découvrez l'harmonie parfaite entre vins français et fromages artisanaux. Sélection de 8 vins et 12 fromages.",
        date: "2025-02-20",
        time: "19:00 - 22:00",
        location: "Cave & Terroir, 6ème arrondissement",
        type: "tasting",
        price: 45,
        maxParticipants: 25,
        currentParticipants: 18,
        image: "/images/events/wine-tasting.jpg",
        organizer: "Sommelier Marie Laurent",
        tags: ["vin", "fromage", "dégustation"],
        featured: false
      },
      {
        id: 3,
        title: "Concours de Cuisine Amateur",
        description: "Montrez vos talents culinaires ! Thème : 'Cuisine du monde'. Prix à gagner : panier garni et publication de votre recette.",
        date: "2025-03-10",
        time: "10:00 - 17:00",
        location: "Centre Culturel Belleville",
        type: "competition",
        price: 15,
        maxParticipants: 20,
        currentParticipants: 14,
        image: "/images/events/cooking-competition.jpg",
        organizer: "Association Cuisine Passion",
        tags: ["concours", "amateur", "prix"],
        featured: false
      },
      {
        id: 4,
        title: "Rencontre Mensuelle des Foodies",
        description: "Échangez autour d'un verre sur vos dernières découvertes culinaires. Apportez vos photos de plats préférés !",
        date: "2025-01-25",
        time: "18:30 - 21:00",
        location: "Café Gastro, Bastille",
        type: "meeting",
        price: 0,
        maxParticipants: 30,
        currentParticipants: 22,
        image: "/images/events/foodies-meetup.jpg",
        organizer: "Communauté Cooking Recipes",
        tags: ["rencontre", "échange", "communauté"],
        featured: false
      }
    ];

    const now = new Date();
    const upcoming = mockEvents.filter(event => new Date(event.date) >= now);
    const past = mockEvents.filter(event => new Date(event.date) < now);

    setEvents(mockEvents);
    setUpcomingEvents(upcoming);
    setPastEvents(past);
  }, []);

  const eventTypes = [
    { value: 'all', label: 'Tous les événements', icon: '📅' },
    { value: 'workshop', label: 'Ateliers', icon: '👨‍🍳' },
    { value: 'tasting', label: 'Dégustations', icon: '🍷' },
    { value: 'competition', label: 'Concours', icon: '🏆' },
    { value: 'meeting', label: 'Rencontres', icon: '👥' }
  ];

  const filteredEvents = selectedType === 'all'
    ? upcomingEvents
    : upcomingEvents.filter(event => event.type === selectedType);

  const featuredEvent = upcomingEvents.find(event => event.featured);

  const getEventTypeLabel = (type: string) => {
    return eventTypes.find(t => t.value === type)?.label || type;
  };

  const getEventTypeIcon = (type: string) => {
    return eventTypes.find(t => t.value === type)?.icon || '📅';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="events-page">
      <div className="events-container">
        <header className="events-header">
          <h1>🎉 Événements Culinaires</h1>
          <p>Découvrez et participez aux meilleurs événements culinaires près de chez vous</p>
        </header>

        {featuredEvent && (
          <section className="featured-event">
            <div className="featured-content">
              <div className="featured-image">
                <img src={featuredEvent.image} alt={featuredEvent.title} />
                <div className="featured-badge">Événement phare</div>
              </div>
              <div className="featured-text">
                <div className="event-type">
                  <span className="type-icon">{getEventTypeIcon(featuredEvent.type)}</span>
                  <span className="type-label">{getEventTypeLabel(featuredEvent.type)}</span>
                </div>
                <h2>{featuredEvent.title}</h2>
                <p className="event-description">{featuredEvent.description}</p>
                <div className="event-details">
                  <div className="detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>{formatDate(featuredEvent.date)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-clock"></i>
                    <span>{featuredEvent.time}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{featuredEvent.location}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <span>{featuredEvent.currentParticipants}/{featuredEvent.maxParticipants} participants</span>
                  </div>
                </div>
                <div className="event-footer">
                  <div className="event-price">
                    {featuredEvent.price === 0 ? 'Gratuit' : `${featuredEvent.price}€`}
                  </div>
                  <button className="btn btn-primary">
                    S'inscrire maintenant
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="events-controls">
          <div className="type-filter">
            {eventTypes.map(type => (
              <button
                key={type.value}
                className={`filter-btn ${selectedType === type.value ? 'active' : ''}`}
                onClick={() => setSelectedType(type.value)}
              >
                <span className="filter-icon">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="events-grid">
          {filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-image">
                <img src={event.image} alt={event.title} />
                <div className="event-type-badge">
                  <span className="type-icon">{getEventTypeIcon(event.type)}</span>
                  <span className="type-label">{getEventTypeLabel(event.type)}</span>
                </div>
                {event.price === 0 && <div className="free-badge">Gratuit</div>}
              </div>

              <div className="event-content">
                <h3>{event.title}</h3>
                <p className="event-description">{event.description}</p>

                <div className="event-info">
                  <div className="info-item">
                    <i className="fas fa-calendar"></i>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <span>{event.time}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{event.location}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-users"></i>
                    <span>{event.currentParticipants}/{event.maxParticipants}</span>
                  </div>
                </div>

                <div className="event-tags">
                  {event.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>

                <div className="event-footer">
                  <div className="event-price">
                    {event.price === 0 ? 'Gratuit' : `${event.price}€`}
                  </div>
                  <button className="btn btn-primary">
                    S'inscrire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pastEvents.length > 0 && (
          <section className="past-events">
            <h2>Événements passés</h2>
            <div className="past-events-grid">
              {pastEvents.slice(0, 3).map(event => (
                <div key={event.id} className="past-event-card">
                  <div className="past-event-image">
                    <img src={event.image} alt={event.title} />
                  </div>
                  <div className="past-event-content">
                    <h4>{event.title}</h4>
                    <p className="past-event-date">
                      <i className="fas fa-calendar"></i>
                      {formatDate(event.date)}
                    </p>
                    <p className="past-event-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="events-cta">
          <div className="cta-content">
            <h2>Organisez votre propre événement</h2>
            <p>Vous êtes un chef, un passionné ou un professionnel ? Proposez votre événement culinaire sur notre plateforme.</p>
            <button className="btn btn-primary">
              Proposer un événement
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Events;
