"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function BookPage() {

    const router = useRouter();

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        router.push("/rooms/confirm-book");
    }

    return (
        <div className="panel shadow-box">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Book a room</h1>
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
                        <input type="date" name="checkin" id="checkin" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" required />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-400">Check-out</span>
                        <input type="date" name="checkout" id="checkout" className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" required />
                    </label>
                    <button type="submit">Book It</button>
                </div>
            </form>
        </div>
    )
}