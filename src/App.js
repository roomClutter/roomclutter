
import React from 'react';
import {BrowserRouter as Router, redirect, Route, Switch } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';

import firebase from 'firebase/app';
import 'firebase/auth';

export default function App() {
  return (
    <div>
      <Router>
        <Route path ="/" exact component={HomeScreen}/>
      </Router>
    </div>
  );
}

const firebaseConfig = {
  apiKey: "AIzaSyDvNKAiBr0kbCl3VugVBqxPaxFFnhrHEGk",
  authDomain: "roomclutter-ba3dd.firebaseapp.com",
  databaseURL: "https://roomclutter-ba3dd.firebaseio.com",
  projectId: "roomclutter-ba3dd",
  storageBucket: "roomclutter-ba3dd.appspot.com",
  messagingSenderId: "647350297501",
  appId: "1:647350297501:web:b3a3b0ba1b14f2a5130574",
  measurementId: "G-Q2Y3SR981D"
};
firebase.initializeApp(firebaseConfig);