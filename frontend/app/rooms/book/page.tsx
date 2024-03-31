"use client";

import React, { useState, FormEvent, useEffect } from "react";

export default function BookPage() {

    const [reservationID, setReservationID] = useState("");
    const [error, setError] = useState("");
    const [roomId, setRoomId] = useState("");

    useEffect(() => {
        setRoomId(localStorage.getItem("room_id"));
    }, []);
    
    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const payload = [];
        payload["user_type"] = localStorage.getItem("userType");
        payload["user_id"] = localStorage.getItem("userId");
        payload["client_id"] = localStorage.getItem("userId"); //TODO : Temporary beacause we don't have yet an endpoint that returns the client list with their client Ids
        payload["room_id"] = localStorage.getItem("room_id");
        payload["start_date"] = (document.getElementById("start_date") as HTMLInputElement).value;
        payload["end_date"] = (document.getElementById("end_date") as HTMLInputElement).value;

        fetch("http://localhost:8000/hms/reserve_room", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }).then((response) => response.json())
        .then(data => {
            setReservationID(data.reservation_id);
        }).catch((error) => {
            setError(error.message);
            console.error("Error:", error.message);
        });

    }

    return (
        <div className="panel shadow-box">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Book a room (ID: {roomId})</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Fill in the form to book the room</p>
            <form className="mt-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-400">Name</span>
                        <input type="text" placeholder="Enter your name" name="name" id="name" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" required />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-400">Email</span>
                        <input type="email" name="email" placeholder="Enter your email" id="email" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" required />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-400">Check-in</span>
                        <input type="date" name="start_date" id="start_date" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" required />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-400">Check-out</span>
                        <input type="date" name="end_date" id="end_date" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" required />
                    </label>
                    <button type="submit" className="button">Book It</button>
                </div>
                {reservationID !== "" ? <p className="ok_message">Your reservation has been accepted. Your reservation number is {reservationID} </p> : (error != "" ? <p className="error_message">{error}</p> : "")}
            </form>
        </div>
        )
}