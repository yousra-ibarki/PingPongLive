"use client";

import React, { useEffect, useState } from "react";
import "./globals.css";
import { useRouter } from "next/navigation";
// import { reportWebVitals, trackPageView, trackJsError } from '../lib/monitoring';
// import { Task } from './(pages)/Components/task';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
};

export default function rootPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Authentication check
        if (!getCookie("logged_in")) {
            router.push("/login");
            return;
        } else {
            router.push("/dashboard");
        }
    }, [router]);
    // Error boundary for the entire component
    return (
        <div className="h-[700px] w-[100%] flex justify-center items-center">
            <div className="loaderSettings "></div>
        </div>
    );
}
