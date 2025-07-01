import React, { useState, useEffect } from 'react';
import { metadataService } from '../services/metadataService';
import '../styles/components/IntoleranceSelector.scss';

interface IntoleranceSelectorProps {
  selectedIntolerances: string[];
  onChange: (intolerances: string[]) => void;
  className?: string;
}

export const IntoleranceSelector: React.FC<IntoleranceSelectorProps> = ({
  selectedIntolerances,
  onChange,
  className
}) => {
  const [validOptions, setValidOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIntolerances = async () => {
      try {
        setLoading(true);
        const options = await metadataService.getValidIntolerances();
        setValidOptions(options);
        setError(null);
      } catch (err) {
        setError('Impossible de charger les options d\'intolérances');
        console.error('Erreur lors du chargement des intolérances:', err);
      } finally {
        setLoading(false);
      }
    };

    loadIntolerances();
  }, []);

  const handleCheckboxChange = (intolerance: string, checked: boolean) => {
    if (checked) {
      // Ajouter l'intolérance si elle n'est pas déjà sélectionnée
      if (!selectedIntolerances.includes(intolerance)) {
        onChange([...selectedIntolerances, intolerance]);
      }
    } else {
      // Retirer l'intolérance
      onChange(selectedIntolerances.filter(item => item !== intolerance));
    }
  };

  if (loading) {
    return <div className={className}>Chargement des options...</div>;
  }

  if (error) {
    return (
      <div className={className}>
        <div className="error-message">{error}</div>
        <div className="fallback-note">
          Options par défaut : Lactose, Gluten
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="intolerance-options">
        {validOptions.map(intolerance => (
          <label key={intolerance} className="intolerance-option">
            <input
              type="checkbox"
              checked={selectedIntolerances.includes(intolerance)}
              onChange={(e) => handleCheckboxChange(intolerance, e.target.checked)}
            />
            {intolerance}
          </label>
        ))}
      </div>
      {selectedIntolerances.length > 0 && (
        <div className="selected-intolerances">
          <small>Sélectionnées : {selectedIntolerances.join(', ')}</small>
        </div>
      )}
    </div>
  );
};
