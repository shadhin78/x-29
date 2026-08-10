module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.status(200).json({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB3esen42Pqg2KzwSbn2N9Af_XpR90Z8Cw",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "trax-76836.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "trax-76836",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "trax-76836.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "451643537797",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:451643537797:web:ccd35df69ff56e3320ecec"
  });
};

