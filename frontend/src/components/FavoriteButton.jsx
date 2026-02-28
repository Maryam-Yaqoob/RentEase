import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useToast } from '../context/ToastContext';

const FavoriteButton = ({ propertyId, initialIsFavorited = false, onToggle }) => {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent card click event
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = isFavorited 
        ? `http://localhost:8000/api/favorites/${propertyId}`
        : 'http://localhost:8000/api/favorites/';
      
      const options = {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      if (!isFavorited) {
        options.body = JSON.stringify({ property_id: propertyId });
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update favorite');
      }

      setIsFavorited(!isFavorited);
      success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
      
      if (onToggle) {
        onToggle(!isFavorited);
      }
    } catch (err) {
      error(err.message || 'Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFavorited ? 'danger' : 'outline-danger'}
      size="sm"
      onClick={handleToggleFavorite}
      disabled={loading}
      className="d-flex align-items-center gap-1"
      style={{ minWidth: '40px', minHeight: '40px' }}
    >
      <i className={`bi bi-heart${isFavorited ? '-fill' : ''}`}></i>
    </Button>
  );
};

export default FavoriteButton;
