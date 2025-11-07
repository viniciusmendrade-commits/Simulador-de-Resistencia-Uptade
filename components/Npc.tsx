import React from 'react';

const NPC_IMAGE_URL = 'https://i.postimg.cc/jSJkNBRK/Chat-GPT-Image-7-de-nov-de-2025-14-42-57.png';

export const TeacherNpc: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative select-none ${className}`}>
    <img 
        src={NPC_IMAGE_URL} 
        alt="Professora Melina" 
        className="w-full h-full object-contain drop-shadow-lg" 
    />
  </div>
);