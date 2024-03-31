"use client";

import React, { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PayRentPage() {

    const router = useRouter();
    const [roomID, setRoomID] = React.useState("");
    const [paymentAmount, setPaymentAmount] = React.useState(0.0);
    const [rentalMessage, setRentalMessage] = React.useState("");
    const [error, setError] = React.useState("");

    useEffect(() => {
        let userId = localStorage.getItem("userId");
        if (userId === undefined || userId === null || userId === "") {
            router.push("/login");
            return;
        }
        setRoomID(localStorage.getItem("room_id"));
        setPaymentAmount(parseFloat(localStorage.getItem("room_price")));
    }, []);

    function isEmpty(value: any) {
        return (value === undefined || value === null || value === "");
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        let payload = {};
        formData.forEach((value, key) => { if (!isEmpty(value)) payload[key] = value});

        payload['user_type'] = localStorage.getItem('userType');
        payload['user_id'] = localStorage.getItem('userId');

        fetch("http://localhost:8000/hms/rent_room", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((data) => {
                setRentalMessage(data.message + " of room ID " + localStorage.getItem("room_id") + ". Rent reference : " + data.rental);
            })
            .catch((error) => {
                console.error("Error:", error.message);
                setError("Error: " + error.message);
            });
    }

    return (
        <div className="panel shadow-box">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Rent a room (ID: {roomID})</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Fill in the form to check-in</p>
            <form className="mt-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-400">Reservation ID</span>
                        <input type="text" placeholder="Enter your reservation ID" name="reservation_id" id="reservation_id" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" required />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-400">Payment amount</span>
                        <input type="number" step="0.01" name="payment" value={paymentAmount} placeholder="Enter the payed amount" id="payment" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" required />
                    </label>
                    <button type="submit" className="button">Payment</button>
                    {rentalMessage !== "" ? <p className="ok_message">{rentalMessage}</p> : null}
                    {error !== "" ? <p className="error_message">{error}</p> : null}
                </div>
            </form>
        </div>
    )
}