const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyBqKVMZQesGZbyGX24evZjHch2Mx1bS80M",
  authDomain: "kavach-3e799.firebaseapp.com",
  projectId: "kavach-3e799",
  storageBucket: "kavach-3e799.firebasestorage.app",
  messagingSenderId: "856554130718",
  appId: "1:856554130718:web:840dbeadedeb6b090d8d0f"
};

async function testFirebase() {
  console.log("Initializing Firebase...");
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    console.log("Firebase App Initialized successfully!");
    console.log("Testing Authentication connection (expecting 'user-not-found' or 'invalid-credential' if it connects successfully)...");
    
    try {
      await signInWithEmailAndPassword(auth, "test-connection@example.com", "fakePassword123!");
    } catch (authError) {
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/invalid-login-credentials') {
         console.log("✅ SUCCESS! Firebase Auth is connected and rejecting bad logins properly.");
      } else if (authError.code === 'auth/configuration-not-found' || authError.code === 'auth/operation-not-allowed') {
         console.log("❌ FAILED: API key is valid, but Email/Password authentication is NOT ENABLED in the Firebase Console!");
      } else {
         console.log(`❌ FAILED with unexpected auth error: ${authError.code} - ${authError.message}`);
      }
    }
  } catch (error) {
    console.error("❌ FAILED to initialize Firebase (API Key or Config is completely invalid):", error.message);
  }
}

testFirebase();
