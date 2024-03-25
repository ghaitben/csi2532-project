"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function BookPage() {

    const router = useRouter();

    function generateBookingNumber() {
        return Math.floor(Math.random() * 1000000);
    }

    function backToHome(event: React.MouseEvent<HTMLParagraphElement>) {
        router.push("/");
    }

    return (
        <div className="panel shadow-box" style={{cursor: "pointer"}}>
            <p>The room is booked for you. Please remember your booking number : {generateBookingNumber()}</p>
            <p className="link" onClick={backToHome}>Back to home page</p>
        </div>
    )
}
