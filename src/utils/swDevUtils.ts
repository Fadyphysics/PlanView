/**
 * Utility functions to manage service workers during development
 */

export const unregisterServiceWorkers = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered:', registration.scope);
      }
    } catch (error) {
      console.error('Error unregistering service workers:', error);
    }
  }
};

// Unregister service workers in development mode
if (import.meta.env.DEV) {
  unregisterServiceWorkers();
}