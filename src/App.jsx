import { useState, useEffect } from 'react';
import GardenMap from './components/GardenMap';
import Login from './components/Login';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;

  if (!session) {
    return <Login onLogin={() => {}} />;
  }

  return <GardenMap />;
}

export default App;
