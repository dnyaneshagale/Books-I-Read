import React from 'react';
import { Toaster } from 'react-hot-toast';
import AppRouter from '@/app/router/AppRouter';
import { toasterOptions } from '@/app/config/toasterOptions';

/**
 * Main App Component
 */
function App() {
  return (
    <div className="min-h-[100dvh]">
      <Toaster {...toasterOptions} />
      <AppRouter />
    </div>
  );
}

export default App;
