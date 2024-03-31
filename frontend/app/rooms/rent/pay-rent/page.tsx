"use client";

import React, { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PayRentPage() {

    const router = useRouter();
    const [message, setMessage] = useState("");

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setMessage("Payment sent successfully");
    }

    function back() {
        router.push("/");
    }

    return (
        <div className="panel shadow-box">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Payment form</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Fill in the form to send payment</p>
            <form className="mt-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-400">Card Number</span>
                        <input type="text" maxLength={16} placeholder="Enter your card number" name="cardNumber" id="cardNumber" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" required />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-400">Expiry date</span>
                        <input type="date" name="expiryDate" placeholder="Enter the expiry date" id="expiryDate" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" required />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-400">CVV Number</span>
                        <input type="number" name="crc" id="crc" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" required />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-400">Amount</span>
                        <input type="number" step="0.01" name="amount" id="amount" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" value={300} />
                    </label>
                    <p style={{color: "darkgreen"}}>{message}</p>
                    <button type="submit">Send payment</button>
                    {message != "" ? <p onClick={back} style={{color: "blue", cursor: "pointer"}}>Back to homepage</p>: ""}
                </div>
            </form>
        </div>
    )
}