import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyD_xdjVQ2Sp85Wf64xMsfzvkh2GhSkNmOc",
  authDomain: "imessage-clone-3fe43.firebaseapp.com",
  projectId: "imessage-clone-3fe43",
  storageBucket: "imessage-clone-3fe43.appspot.com",
  messagingSenderId: "60083606891",
  appId: "1:60083606891:web:fa90fa6fee2ed6c623682e",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { auth, provider };
export default db;
