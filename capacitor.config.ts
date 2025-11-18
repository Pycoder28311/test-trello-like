import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dimitris.trello',
  appName: 'MyTrello',
  webDir: "out",  
  server: {
    url: "https://test-trello-like-production.up.railway.app/", // or your deployed site URL
    cleartext: true
  }
};

export default config;
