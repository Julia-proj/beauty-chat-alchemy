import React from "react";

interface InstaEmbedProps {
  url: string;
  maxWidth?: number;
}

const InstaEmbed: React.FC<InstaEmbedProps> = ({ url, maxWidth = 326 }) => {
  const embedUrl = `${url}embed/`;

  return (
    <div className="instagram-embed-wrapper" style={{ width: '100%', height: '100%' }}>
      <iframe
        src={embedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          overflow: 'hidden',
        }}
        scrolling="no"
        allowTransparency={true}
        allow="encrypted-media"
        title="Instagram Reel"
      />
    </div>
  );
};

export default InstaEmbed;
