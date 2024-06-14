"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Map from "./Map"; // Map 컴포넌트를 임포트합니다.

const fetchAccidentDetails = async (accidentId) => {
  const token = localStorage.getItem("Authorization");
  const refreshToken = localStorage.getItem("Refresh");

  if (!token || !refreshToken) {
    throw new Error("No token found");
  }

  const response = await fetch("http://backend-capstone.site:8080/api/hospital/accident/details", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': token,
      'Refresh': refreshToken,
    },
    body: JSON.stringify({ accidentId }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch accident details");
  }

  const data = await response.json();
  return data;
};

const AccidentDetails = () => {
  const searchParams = useSearchParams();
  const accidentId = searchParams.get('accidentId');
  const [accidentDetails, setAccidentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accidentId) {
      setLoading(false);
      return;
    }

    fetchAccidentDetails(accidentId)
      .then((data) => {
        console.log("Fetched data: ", data);
        setAccidentDetails(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching accident details:", error);
        setError(error);
        setLoading(false);
      });
  }, [accidentId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading accident details</div>;
  if (!accidentDetails) return <div>No accident details available</div>;

  return (
    <div className="container">
      <h2>Accident Details</h2>
      <div className="content-row">
        <div className="details-box">
          <div className="detail">
            <strong>Longitude:</strong> {accidentDetails.longitude}
          </div>
          <div className="detail">
            <strong>Latitude:</strong> {accidentDetails.latitude}
          </div>
          <div className="detail">
            <strong>Sorting:</strong> {accidentDetails.sorting}
          </div>
          <div className="detail">
            <strong>Accuracy:</strong> {accidentDetails.accuracy}
          </div>
          <div className="detail">
            <strong>Date:</strong> {accidentDetails.date}
          </div>
        </div>
        <div className="image-box">
          <strong>Accident Image:</strong>
          <img src={`data:image/png;base64,${accidentDetails.attachPngBase64}`} alt="사고" />
        </div>
        <div className="map-box">
          <strong>Hospital Location:</strong>
          <Map location={{ lat: parseFloat(accidentDetails.latitude), lng: parseFloat(accidentDetails.longitude) }} />
        </div>
      </div>
      <style jsx>{`
        .container {
          width: 100%;
          margin: 0 auto;
          padding: 20px;
        }
        .content-row {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .details-box, .image-box, .map-box {
          width: 100%;
          padding: 20px;
          border: 2px solid #ddd;
          border-radius: 10px;
          background-color: #f4f4f9;
        }
        .details-box .detail {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #fff;
          margin-bottom: 10px;
        }
        .image-box img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 8px;
        }
        .map-box {
          height: 600px;
        }
        .map-box strong {
          display: block;
          margin-bottom: 10px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default AccidentDetails;