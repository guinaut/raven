import { useState, useEffect } from 'react';
import { Text, Stack, Loader, Center } from '@mantine/core';
import { Raven } from '@prisma/client';  // Assuming you have the Prisma types available
import { RavenCard } from './raven-card';

const RavenList = () => {
    const [ravens, setRavens] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRavens = async () => {
          try {
            const res = await fetch('/api/v1/account/raven/list');
            const data = await res.json();
            setRavens(data);
          } catch (error) {
            console.error('Error fetching ravens:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchRavens();
      }, []);
  
  return (
    <Stack w={340} >
        <Text>Your Ravens</Text>
        
        {loading ? <Center mih={300}><Loader  /></Center> :<>{ravens.map((raven: Raven) => (
            <RavenCard key={raven.id} raven={raven} />
        ))}</>}
    </Stack>
  );
};

export { RavenList };