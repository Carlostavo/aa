export const defaultStyles = {
  text: {
    fontSize: '16px',
    color: '#000000',
    backgroundColor: 'transparent',
    padding: '10px',
    borderRadius: '4px'
  },
  image: {
    border: '2px solid #ddd',
    borderRadius: '4px'
  },
  video: {
    border: '2px solid #ddd',
    borderRadius: '4px'
  },
  shape: {
    backgroundColor: '#3498db',
    border: '2px solid #2980b9'
  }
};

export const getDefaultContent = (type) => {
  switch (type) {
    case 'text': return 'Nuevo texto';
    case 'image': return '/placeholder-image.jpg';
    case 'video': return 'https://www.youtube.com/embed/';
    default: return '';
  }
};

export const validateItem = (item) => {
  const requiredFields = ['type', 'x', 'y', 'width', 'height'];
  return requiredFields.every(field => item.hasOwnProperty(field));
};