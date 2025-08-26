import React from 'react';

interface Props {
  title?: string;
  message?: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  padding: '20px',
  borderRadius: 8,
  maxWidth: 400,
  width: '90%',
  boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
};

export default function ConfirmModal({ title = 'Confirmer', message = 'Êtes-vous sûr ?', open, onCancel, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div style={backdropStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button onClick={onCancel} style={{ padding: '8px 12px' }}>Annuler</button>
          <button onClick={onConfirm} style={{ padding: '8px 12px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 4 }}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}
