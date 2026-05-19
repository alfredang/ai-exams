'use client';

import { useEffect } from 'react';

export function ClearApiTokenFlash() {
  useEffect(() => {
    void fetch('/api/admin/api-token-flash', { method: 'DELETE' });
  }, []);

  return null;
}
