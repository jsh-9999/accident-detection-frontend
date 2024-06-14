"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Hero from "@/components/mainboard/Hero";
import Features from "@/components/mainboard/Features";
import ModelTest from "@/components/mainboard/ModelTest";
import { EventSourcePolyfill } from 'event-source-polyfill';

const Home = () => {
  const router = useRouter();
  const [notification, setNotification] = useState(null);
  const [accidentNotification, setAccidentNotification] = useState(null);

  const setupSSEConnection = (token, refreshToken) => {
    console.log("Setting up SSE connection...");

    const eventSource = new EventSourcePolyfill("http://backend-capstone.site:8080/api/notify/subscribe", {
      headers: {
        'Authorization': token,
        'Refresh': refreshToken
      },
    });

    eventSource.addEventListener('open', () => {
      console.log('SSE connection opened');
    });

    eventSource.addEventListener('sse', (event) => {
      console.log('Raw event data:', event.data);
      try {
        const data = JSON.parse(event.data);  // JSON 파싱
        console.log('Notification received:', data);
        setNotification(data);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });

    eventSource.addEventListener('accident', async (event) => {
      console.log('Accident event data:', event.data);
      try {
        const data = JSON.parse(event.data);  // JSON 파싱
        console.log('Accident Notification received:', data);
        setAccidentNotification(data);

        alert('Accident event received: ' + JSON.stringify(data));

        // API 호출
        await handleApiCalls();
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });

    eventSource.addEventListener('error', (error) => {
      console.error('SSE error:', error);
      if (error.readyState === EventSource.CLOSED) {
        console.log('SSE connection was closed');
      } else {
        console.error('An unknown error occurred:', error);
      }
      eventSource.close();
    });

    return () => {
      eventSource.close();
      console.log('SSE connection closed');
    };
  };

  const handleApiCalls = async () => {
    console.log('handleApiCalls function called');
    const token = localStorage.getItem("Authorization");
    const refreshToken = localStorage.getItem("Refresh");

    if (!token || !refreshToken) {
      console.error('Token or Refresh Token is missing');
      return;
    }

    try {
      // Step 2: /api/hospital/open-data 호출
      console.log('Calling /api/hospital/open-data');
      const hospitalResponse = await fetch('http://backend-capstone.site:8080/api/hospital/open-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'Refresh': refreshToken
        }
      });

      if (!hospitalResponse.ok) {
        throw new Error('Failed to fetch hospital data');
      }

      const hospitalData = await hospitalResponse.json();
      console.log('Hospital data:', hospitalData);

      // Step 3: /api/mail/produce 호출
      console.log('Calling /api/mail/produce');
      const mailProduceResponse = await fetch('http://backend-capstone.site:8080/api/mail/produce', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'Refresh': refreshToken
        }
      });

      if (!mailProduceResponse.ok) {
        throw new Error('Failed to produce mail');
      }

      const mailProduceData = await mailProduceResponse.json();
      console.log('Mail produce data:', mailProduceData);

      // Step 4: /api/mail/transmission 호출
      console.log('Calling /api/mail/transmission');
      const mailTransmissionResponse = await fetch('http://backend-capstone.site:8080/api/mail/transmission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'Refresh': refreshToken
        },
        body: JSON.stringify({ mail: mailProduceData })
      });

      if (!mailTransmissionResponse.ok) {
        throw new Error('Failed to transmit mail');
      }

      const mailTransmissionData = await mailTransmissionResponse.json();
      console.log('Mail transmission data:', mailTransmissionData);

      // 이동
      router.push('/dashboard');
    } catch (error) {
      console.error('Error processing accident event:', error);
    }
  };

  const handleNotificationClick = () => {
    router.push('/dashboard');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("Authorization");
      const refreshToken = localStorage.getItem("Refresh");
      console.log("Token:", token);
      console.log("Refresh Token:", refreshToken);

      if (!token || !refreshToken) {
        console.log("No token found, redirecting to login page.");
        router.push('/auth/login');
      } else {
        const cleanup = setupSSEConnection(token, refreshToken);
        return cleanup;
      }
    }
  }, []);

  return (
    <>
      <Hero />
      <Features />
      <ModelTest />
      {notification && (
        <div className="notification" onClick={handleNotificationClick}>
          <p>{notification.message}</p>
        </div>
      )}
      {accidentNotification && (
        <div className="notification">
          <p>{accidentNotification.message}</p>
        </div>
      )}
    </>
  );
}

export default Home;
