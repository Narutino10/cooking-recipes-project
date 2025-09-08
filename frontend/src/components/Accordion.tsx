import React, { useState } from 'react';
import '../styles/components/Accordion.scss';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Déterminer la classe CSS basée sur le titre pour les couleurs spécifiques
  const getAccordionClass = () => {
    const baseClass = 'accordion';
    if (title.toLowerCase().includes('instruction')) return `${baseClass} accordion-instructions`;
    if (title.toLowerCase().includes('ingrédient')) return `${baseClass} accordion-ingredients`;
    if (title.toLowerCase().includes('nutrition')) return `${baseClass} accordion-nutrition`;
    if (title.toLowerCase().includes('avis') || title.toLowerCase().includes('commentaire')) return `${baseClass} accordion-ratings`;
    return baseClass;
  };

  return (
    <div className={`${getAccordionClass()} ${isOpen ? 'open' : ''}`}>
      <button
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="accordion-title">
          {icon && <span className="accordion-icon">{icon}</span>}
          <span className="accordion-text">{title}</span>
        </div>
        <span className="accordion-toggle">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <div className="accordion-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
