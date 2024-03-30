"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useError, useAuth } from "../authentication";

export default function Home() {

    const router = useRouter();
    const { user, userType, userId, login, logout } = useAuth();
    const { error, setError } = useError();
    const [ ok, setOk ] = useState<boolean>(false);

    async function onSubmit(event: FormEvent<HTMLFormEvent>) {
        event.preventDefault();
        setError(null);
        let errs: string[] = [];

        const formData = new FormData(event.currentTarget);

        let payload = {};
        formData.forEach((value, key) => payload[key] = value);
        payload['user_type'] = userType;
        payload['user_id'] = userId;

        console.log(payload);

        const res = await fetch("http://localhost:8000/hms/add_room", {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const res_json = await res.json();
            errs.push(res_json.message);
            setError(errs);
            return;
        }

        setOk(true);
        event.target.reset();
    }

    return (
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
                E-Hotels
            </a>

            {ok && (
                <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                  <span className="font-medium">Room added successfully</span>
                </div>
            )}

            {error && (
                <div className="flex p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                  <svg className="flex-shrink-0 inline w-4 h-4 me-3 mt-[2px]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                  </svg>
                  <span className="sr-only">Info</span>
                  <div>
                    <span className="font-medium">Ensure that these requirements are met:</span>
                      <ul className="mt-1.5 list-disc list-inside">
                      {error.map((msg, ndx) => {
                          return (
                          <li key={ndx}>{msg}</li>
                          );
                      })}
                    </ul>
                  </div>
                </div>
            )}
            <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                        Add a new room
                    </h1>
                    <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
                        <div>
                            <label htmlFor="hotel_id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">hotel_id</label>
                            <input type="text" name="hotel_id" id="hotel_id" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required="required" />
                        </div>
                        <div>
                            <label htmlFor="price_per_day" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price per day</label>
                            <input type="text" name="price_per_day" id="price_per_day" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="$" required="required" />
                        </div>
                        <div>
                            <label htmlFor="surface_area" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Surface area</label>
                            <input type="text" name="surface_area" id="surface_area" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required="required" />
                        </div>

                        <div>
                          <label htmlFor="room_capacity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Room capacity</label>
                          <select name="room_capacity" id="room_capacity" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="required">
                            <option value="">Select room capacity</option>
                            {['simple', 'double'].map((val, ndx) => {
                                return (
                                <option key={ndx} value={val}>{val}</option>
                                );
                            })}
                          </select>
                        </div>

                        <div>
                            <label htmlFor="damage_description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Damage description</label>
                            <textarea id="damage_description" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Describe the damage in the room..."></textarea>
                        </div>

                        <div>
                          <label htmlFor="expansion_type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Expansion type</label>
                          <select name="expansion_type" id="expansion_type" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="required">
                            <option value="">Select expansion type</option>
                            {['none', 'additional bed', 'private balcony'].map((val, ndx) => {
                                return (
                                <option key={ndx} value={val}>{val}</option>
                                );
                            })}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="view_type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">View type</label>
                          <select name="view_type" id="view_type" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="required">
                            <option value="">Select view type</option>
                            {['ocean', 'mountains'].map((val, ndx) => {
                                return (
                                <option key={ndx} value={val}>{val}</option>
                                );
                            })}
                          </select>
                        </div>


                        <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Add room</button>
                    </form>
                </div>
            </div>
        </div>
      </section>
    );
}

