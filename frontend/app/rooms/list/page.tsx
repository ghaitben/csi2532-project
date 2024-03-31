"use client";

import React from "react";
import { useState } from "react";
import StarRating from "@/app/components/StarRating/StarRating";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RoomsPage = () => {

    const [myUserType, setMyUserType] = useState(localStorage.getItem("userType"));
    const [rooms, setRooms] = useState<any[]>([]);

    useEffect(() => {
        let string_rooms = localStorage.getItem("rooms");
        setRooms(JSON.parse(string_rooms));
    }, []);
    let router = useRouter();


    function handleBook(event) {
        localStorage.removeItem("room_id");
        localStorage.setItem("room_id", event);
        router.push('/rooms/book');
    }

    function handleRent(room) {
        localStorage.removeItem("room_price");
        localStorage.removeItem("room_id");
        localStorage.setItem("room_price", room.room_price);
        localStorage.setItem("room_id", room.room_id);
        router.push('/rooms/rent');
    }

    return (
        <div id="room_list">
            {rooms && rooms.length > 0 &&
                rooms.map((room, index) => (
                    <div key={room.room_id} className="container">
                        <div>
                            {room.hotel_chain_name}<br />
                            <span style={{ fontSize: "xx-small" }}>{room.city}, {room.country_name}</span>
                        </div>
                        <div>
                            ${room.room_price}/night
                            <StarRating rating={room.hotel_rating} />
                        </div>
                        <div>
                            Capacity: {room.capacity}
                        </div>
                        <button onClick={() => handleBook(room.room_id)} id={"Book" + room.room_id} className="button">Book it</button>
                        {myUserType === "employee" && <button onClick={() => handleRent(room)} id={"Rent" + room.room_id} style={{ marginLeft: "20px" }} className="button">Rent</button>}
                    </div>
                ))}
        </div>
    );
}

export default RoomsPage;
