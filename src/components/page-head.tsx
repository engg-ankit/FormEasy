'use client';

import { useEffect } from 'react';

interface PageHeadProps {
  title: string;
  description?: string;
}

export const PageHead = ({ title, description }: PageHeadProps) => {
  useEffect(() => {
    document.title = `${title} | CyberSeva`;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', description);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        meta.setAttribute('content', description);
        document.head.appendChild(meta);
      }
    }

    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `${title} | CyberSeva`);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.setAttribute('content', description);
  }, [title, description]);

  return null;
};
