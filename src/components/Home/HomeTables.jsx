import React from 'react';
import ScrollableTable from './ScrollableTable';
import { auth } from '../../App';
import { fetchUserUrls, fetchAccessDates } from '../../services/api';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomeTables() {
    const [urlTableData, setUrlTableData] = React.useState(null);
    const [groupTableData, setGroupTableData] = React.useState(null);
    const [userUrls, setUserUrls] = React.useState(null);
    const [docTableData, setDocTableData] = React.useState(null);

    const urlColumns = ["ShortUrl", "Clicks", "Last Accessed"]

    async function fillTables(urlList) {
        let urlData = []
        let groupData = []
        urlData.push(urlColumns)
        groupData.push(urlColumns.slice(1, urlColumns.length))
        // unpack groups
        let groups = urlList.groups
            for (let key in groups) {
                const group = groups[key]
                let groupClicks = 0
                
                // For each group of URLS

                for (let idx in group) {
                    const url = group[idx]
                    const accessData = Object.values(await fetchAccessDates(url));

                    let clicks = 0
                    if (accessData.length !== 0) {
                        for (let date in accessData) {
                            clicks += Number(Object.values(accessData[date]))
                        }
                    }
                    groupClicks += clicks

                    const sortedDates = Object.keys(accessData).sort();
                    urlData.push([url, clicks, sortedDates[0]])
                }
                groupData.push([group, groupClicks]);
        }

        setUrlTableData(urlData);
        setGroupTableData(groupData);
    }
    
    React.useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, async (userCredential) => {
          if (userCredential) {
            try {
            if (userUrls === null) {
                const urls = await fetchUserUrls(userCredential.uid);
                setUserUrls(urls);
            }

            if (urlTableData === null || groupTableData === null) {
                await fillTables(userUrls);
            }

        } catch (err) {
            console.log('Failed to fetch user URLs:', err.message);
        }
        }
        });
    
        return () => unsubscribe();
    });



    return (
        <div>
        <h2>Your Shortlinks:</h2>
        <ScrollableTable data={urlTableData} />
        <h2>Your Groups:</h2>
        <ScrollableTable data={groupTableData} />
        </div>
    );

};