import React from 'react';
import ScrollableTable from './ScrollableTable';
import { auth } from '../App';
import { fetchUserUrls } from '../services/api';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomeTables() {
    const [loading, setLoading] = React.useState(true);
    const [urlData, setUrlData] = React.useState([]);
    React.useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, async (userCredential) => {
          if (userCredential) {
            try {
            const urls = await fetchUserUrls(userCredential.uid);
            console.log("Success, got something.");
            console.log(urls);
            setUrlData(urls);
            
    
            
        } catch (err) {
            console.log('Failed to fetch user URLs:', err.message);
        }
        setLoading(false);
        }
        });
    
        return () => unsubscribe();
    });



    return !loading ? (
        <div>
        <h2>Your Shortlinks:</h2>
        <ScrollableTable data={urlData} />
        <h2>Your Documents:</h2>
        <ScrollableTable data={urlData} />
        </div>
    ) : (<p>Loading...</p>);

};