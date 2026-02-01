import React from 'react';
import { Link } from 'react-router-dom';
import { FaComments, FaWhatsapp } from 'react-icons/fa/index.esm.js';

export default function ChatUsButton({ label = 'Chat Us', variant = 'default' }) {
  const isWhatsApp = variant === 'whatsapp';
  const baseClasses = 'fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center space-x-2';
  const colorClasses = isWhatsApp
    ? 'bg-[#25D366] text-white'
    : 'bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-white';

  // Link to chat page; could be adapted to WhatsApp link if desired
  return (
    <Link to="/chat-us" className={`${baseClasses} ${colorClasses}`}>
      {isWhatsApp ? (
        <FaWhatsapp className="text-xl" />
      ) : (
        <FaComments className="text-xl" />
      )}
      <span className="hidden sm:block font-semibold">{label}</span>
    </Link>
  );
}
