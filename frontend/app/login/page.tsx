"use client";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../authentication";

export default function LoginForm() {
    const [isEmployeeLogin, setEmployeeLogin] = useState<boolean>(false);
    const [error, setError] = useState<string[] | null>(null);
    const { user, login, logout } = useAuth();
    const router = useRouter();

    async function onSubmit(event: FormEvent<HTMLFormEvent>) {
        event.preventDefault();
        setError(null);
        let errs: string[] = [];

        const formData = new FormData(event.currentTarget);

        if ([...formData.get('ssn')].some((c) => !(c >= '0' && c <= '9'))) {
            errs.push("SSN field must only contain digits.");
        }

        if (formData.get('ssn').length != 9) {
            errs.push("SSN field must be of length 9.");
        }

        if (errs.length != 0) {
            setError(errs);
            return;
        }

        if (!isEmployeeLogin) {
            let payload = {};
            formData.forEach((value, key) => payload[key] = value);
            const res = await fetch("http://localhost:8000/hms/login", {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                errs.push("Invalid credentials.");
                setError(errs);
                return;
            }

            login(formData.get('fullname'));

            router.push("/");
            // just in case this router thing returns.
            return;
        }

        errs.push("Employee Login not supported.");
        setError(errs);
        return;
    }

    return (
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
                E-Hotels
            </a>
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
                        Sign in to your account
                    </h1>
                    <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
                        <div>
                            <label htmlFor="fullname" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                            <input type="text" name="fullname" id="fullname" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Salim berou" required="required" />
                        </div>
                        <div>
                            <label htmlFor="ssn" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ssn</label>
                            <input type="text" name="ssn" id="ssn" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="XXX-XXX-XXX" required="required" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                  <input checked={isEmployeeLogin} onChange={() => setEmployeeLogin(!isEmployeeLogin)} id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required="" />
                                </div>
                                <div className="ml-3 text-sm">
                                  <label htmlFor="employee_sign_in" className="text-gray-500 dark:text-gray-300">Sign in as an employee</label>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</button>
                        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                            Don’t have an account yet? <a href="/register" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
      </section>
    );
}
