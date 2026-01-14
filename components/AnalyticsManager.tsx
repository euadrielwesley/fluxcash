
import React, { useEffect, useRef } from 'react';
import { useIntegration } from './IntegrationContext';

declare global {
  interface Window {
    dataLayer: any[];
    google_tag_manager: any;
  }
}

// Utility to track events from anywhere
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
      timestamp: new Date().toISOString()
    });
  } else {
    // Debug mode or Fallback
    console.debug(`[Analytics] Event Skipped (No GTM): ${eventName}`, params);
  }
};

const AnalyticsManager: React.FC = () => {
  const { integrations } = useIntegration();
  const injectedRef = useRef<boolean>(false);

  useEffect(() => {
    const gtmConfig = integrations['gtm'];
    
    if (gtmConfig && gtmConfig.enabled) {
      const containerId = gtmConfig.credentials['containerId'];

      if (containerId && containerId.startsWith('GTM-') && !injectedRef.current) {
        // Inject GTM
        (function(w,d,s,l,i){
            w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s) as HTMLScriptElement,
            dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode?.insertBefore(j,f);
        })(window, document, 'script', 'dataLayer', containerId);
        
        injectedRef.current = true;
        console.log(`[FluxCash] Analytics Connected: ${containerId}`);
        trackEvent('app_initialized', { version: '1.0.0' });
      }
    }
  }, [integrations]);

  return null; // Headless component
};

export default AnalyticsManager;
