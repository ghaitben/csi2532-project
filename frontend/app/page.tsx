"use client";
import { useRouter } from "next/navigation";
import { useAuth, useError } from "./authentication";

export default function Home() {
    const router = useRouter();
    const { user, userType, login, logout } = useAuth();
    const { error, setError } = useError();

    function check_permission_for_add_room(event) {
        event.preventDefault();

        if (!user || userType !== 'employee') {
            setError(["You must be logged in as an employee to gain access"]);
            router.push("/login");
            return;
        }

        router.push("/add_room");
    }

    function check_permission_for_rent_room(event) {
        event.preventDefault();

        if (!user || userType !== 'employee') {
            setError(["You must be logged in as an employee to gain access"]);
            router.push("/login");
            return;
        }

        router.push("/rooms/rent");
    }

    return (
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a href="/add_room" onClick={check_permission_for_add_room} className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Add Room</h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">Add a new room to an existing hotel</p>
          </a>

          <a href="/rent_room" onClick={check_permission_for_rent_room} className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Rent Room</h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">Rent room with existing reservation</p>
          </a>
      </div>
    );
}
