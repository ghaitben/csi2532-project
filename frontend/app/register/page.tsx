"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

function CountryList() {
    return [
        "AFGHANISTAN",
        "ALBANIA",
        "ALGERIA",
        "AMERICAN SAMOA",
        "ANDORRA",
        "ANGOLA",
        "ANGUILLA",
        "ANTARCTICA",
        "ANTIGUA AND BARBUDA",
        "ARGENTINA",
        "ARMENIA",
        "ARUBA",
        "AUSTRALIA",
        "AUSTRIA",
        "AZERBAIJAN",
        "BAHAMAS",
        "BAHRAIN",
        "BANGLADESH",
        "BARBADOS",
        "BELARUS",
        "BELGIUM",
        "BELIZE",
        "BENIN",
        "BERMUDA",
        "BHUTAN",
        "BOLIVIA",
        "BOSNIA AND HERZEGOVINA",
        "BOTSWANA",
        "BOUVET ISLAND",
        "BRAZIL",
        "BRITISH INDIAN OCEAN TERRITORY",
        "BRUNEI DARUSSALAM",
        "BULGARIA",
        "BURKINA FASO",
        "BURUNDI",
        "CAMBODIA",
        "CAMEROON",
        "CANADA",
        "CAPE VERDE",
        "CAYMAN ISLANDS",
        "CENTRAL AFRICAN REPUBLIC",
        "CHAD",
        "CHILE",
        "CHINA",
        "CHRISTMAS ISLAND",
        "COCOS (KEELING) ISLANDS",
        "COLOMBIA",
        "COMOROS",
        "CONGO",
        "CONGO, THE DEMOCRATIC REPUBLIC OF THE",
        "COOK ISLANDS",
        "COSTA RICA",
        "COTE D''IVOIRE",
        "CROATIA",
        "CUBA",
        "CYPRUS",
        "CZECH REPUBLIC",
        "DENMARK",
        "DJIBOUTI",
        "DOMINICA",
        "DOMINICAN REPUBLIC",
        "ECUADOR",
        "EGYPT",
        "EL SALVADOR",
        "EQUATORIAL GUINEA",
        "ERITREA",
        "ESTONIA",
        "ETHIOPIA",
        "FALKLAND ISLANDS (MALVINAS)",
        "FAROE ISLANDS",
        "FIJI",
        "FINLAND",
        "FRANCE",
        "FRENCH GUIANA",
        "FRENCH POLYNESIA",
        "FRENCH SOUTHERN TERRITORIES",
        "GABON",
        "GAMBIA",
        "GEORGIA",
        "GERMANY",
        "GHANA",
        "GIBRALTAR",
        "GREECE",
        "GREENLAND",
        "GRENADA",
        "GUADELOUPE",
        "GUAM",
        "GUATEMALA",
        "GUINEA",
        "GUINEA-BISSAU",
        "GUYANA",
        "HAITI",
        "HEARD ISLAND AND MCDONALD ISLANDS",
        "HOLY SEE (VATICAN CITY STATE)",
        "HONDURAS",
        "HONG KONG",
        "HUNGARY",
        "ICELAND",
        "INDIA",
        "INDONESIA",
        "IRAN, ISLAMIC REPUBLIC OF",
        "IRAQ",
        "IRELAND",
        "ISRAEL",
        "ITALY",
        "JAMAICA",
        "JAPAN",
        "JORDAN",
        "KAZAKHSTAN",
        "KENYA",
        "KIRIBATI",
        "KOREA, DEMOCRATIC PEvPLE",
        "KOREA, REPUBLIC OF",
        "KUWAIT",
        "KYRGYZSTAN",
        "LAO PEOPLE",
        "LATVIA",
        "LEBANON",
        "LESOTHO",
        "LIBERIA",
        "LIBYAN ARAB JAMAHIRIYA",
        "LIECHTENSTEIN",
        "LITHUANIA",
        "LUXEMBOURG",
        "MACAO",
        "MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF",
        "MADAGASCAR",
        "MALAWI",
        "MALAYSIA",
        "MALDIVES",
        "MALI",
        "MALTA",
        "MARSHALL ISLANDS",
        "MARTINIQUE",
        "MAURITANIA",
        "MAURITIUS",
        "MAYOTTE",
        "MEXICO",
        "MICRONESIA, FEDERATED STATES OF",
        "MOLDOVA, REPUBLIC OF",
        "MONACO",
        "MONGOLIA",
        "MONTSERRAT",
        "MOROCCO",
        "MOZAMBIQUE",
        "MYANMAR",
        "NAMIBIA",
        "NAURU",
        "NEPAL",
        "NETHERLANDS",
        "NETHERLANDS ANTILLES",
        "NEW CALEDONIA",
        "NEW ZEALAND",
        "NICARAGUA",
        "NIGER",
        "NIGERIA",
        "NIUE",
        "NORFOLK ISLAND",
        "NORTHERN MARIANA ISLANDS",
        "NORWAY",
        "OMAN",
        "PAKISTAN",
        "PALAU",
        "PALESTINIAN TERRITORY, OCCUPIED",
        "PANAMA",
        "PAPUA NEW GUINEA",
        "PARAGUAY",
        "PERU",
        "PHILIPPINES",
        "PITCAIRN",
        "POLAND",
        "PORTUGAL",
        "PUERTO RICO",
        "QATAR",
        "REUNION",
        "ROMANIA",
        "RUSSIAN FEDERATION",
        "RWANDA",
        "SAINT HELENA",
        "SAINT KITTS AND NEVIS",
        "SAINT LUCIA",
        "SAINT PIERRE AND MIQUELON",
        "SAINT VINCENT AND THE GRENADINES",
        "SAMOA",
        "SAN MARINO",
        "SAO TOME AND PRINCIPE",
        "SAUDI ARABIA",
        "SENEGAL",
        "SERBIA AND MONTENEGRO",
        "SEYCHELLES",
        "SIERRA LEONE",
        "SINGAPORE",
        "SLOVAKIA",
        "SLOVENIA",
        "SOLOMON ISLANDS",
        "SOMALIA",
        "SOUTH AFRICA",
        "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS",
        "SPAIN",
        "SRI LANKA",
        "SUDAN",
        "SURINAME",
        "SVALBARD AND JAN MAYEN",
        "SWAZILAND",
        "SWEDEN",
        "SWITZERLAND",
        "SYRIAN ARAB REPUBLIC",
        "TAIWAN, PROVINCE OF CHINA",
        "TAJIKISTAN",
        "TANZANIA, UNITED REPUBLIC OF",
        "THAILAND",
        "TIMOR-LESTE",
        "TOGO",
        "TOKELAU",
        "TONGA",
        "TRINIDAD AND TOBAGO",
        "TUNISIA",
        "TURKEY",
        "TURKMENISTAN",
        "TURKS AND CAICOS ISLANDS",
        "TUVALU",
        "UGANDA",
        "UKRAINE",
        "UNITED ARAB EMIRATES",
        "UNITED KINGDOM",
        "UNITED STATES",
        "UNITED STATES MINOR OUTLYING ISLANDS",
        "URUGUAY",
        "UZBEKISTAN",
        "VANUATU",
        "VENEZUELA",
        "VIET NAM",
        "VIRGIN ISLANDS, BRITISH",
        "VIRGIN ISLANDS, U.S.",
        "WALLIS AND FUTUNA",
        "WESTERN SAHARA",
        "YEMEN",
        "ZAMBIA",
        "ZIMBABWE"
    ];
}

export default function RegistrationForm() {
    const [isEmployeeRegistration, setEmployeeRegistration] = useState<boolean>(false);
    const [error, setError] = useState<string[] | null>(null);
    const router = useRouter();

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
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

        let payload = {};
        formData.forEach((value, key) => payload[key] = value);

        console.log(payload);
        const res = await fetch("http://localhost:8000/hms/register", {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            errs.push("Failed to commit registration. Try again in a few seconds.");
            return;
        }

        router.push("/login");
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
                        Create an account
                    </h1>
                    <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
                        <div>
                            <label htmlFor="ssn" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ssn</label>
                            <input type="text" name="ssn" id="ssn" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="XXX-XXX-XXX" required="required" />
                        </div>
                        <div>
                            <label htmlFor="fullname" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                            <input type="text" name="fullname" id="fullname" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Salim mouzoune" required="required" />
                        </div>
                        <div>
                            <label htmlFor="street" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Street</label>
                            <input type="text" name="street" id="street" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required="required" />
                        </div>
                        <div>
                            <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">City</label>
                            <input type="text" name="city" id="city" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required="required" />
                        </div>

                        <div>
                          <label htmlFor="country" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Country</label>
                          <select name="country" id="country" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="required">
                            <option value="">Choose a country</option>
                            {CountryList().map((country, ndx) => {
                                return (
                                <option key={ndx} value={ndx}>{country}</option>
                                );
                            })}
                          </select>
                        </div>
                        <div>
                            <label htmlFor="postal_code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Postalcode</label>
                            <input type="text" name="postal_code" id="postal_code" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required="required" />
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input id="terms" aria-describedby="terms" type="checkbox" checked={isEmployeeRegistration} onChange={() => setEmployeeRegistration(!isEmployeeRegistration)} className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required="" />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="EmployeeRegistration" className="font-light text-gray-500 dark:text-gray-300">Register as an employee</label>
                            </div>
                        </div>

                        {isEmployeeRegistration && (
                        <div>
                            <label htmlFor="hotel_id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Hotel id</label>
                            <input type="text" name="hotel_id" id="hotel_id" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required="required" />
                        </div>
                        )}
                        <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Create an account</button>
                        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                            Already have an account? <a href="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
      </section>
    );
}

