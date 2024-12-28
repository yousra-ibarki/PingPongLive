"use client";

import React, { useEffect, useState } from "react";
import "./globals.css";
import { useRouter } from "next/navigation";
import { reportWebVitals, trackPageView, trackJsError } from '../lib/monitoring';
import { Task } from './(pages)/Components/task';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
};

export default function rootPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    // useEffect(() => {
    //     // Authentication check
    //     if (!getCookie("logged_in")) {
    //         router.push("/login");
    //         return;
    //     }

    //     // Initialize monitoring
    //     try {
    //         setLoading(true);
    //         reportWebVitals();
    //         trackPageView();

    //         // Error boundary
    //         const handleError = (error) => {
    //             trackJsError(error);
    //             console.error('Page Error:', error);
    //         };

    //         window.addEventListener('error', handleError);

    //         return () => {
    //             window.removeEventListener('error', handleError);
    //         };
    //     } catch (error) {
    //         console.error('Monitoring setup error:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [router]);

    if (loading) {
        return (
            <div calssName="h-[700px] w-[100%] flex justify-center items-center">
                <div className="loaderSettings "></div>
            </div>
        );
    }

    // Error boundary for the entire component
    try {
        router.push("/dashboard");
    } catch (error) {
        trackJsError(error);
        return <div>Something went wrong. Please try again.</div>;
    }
}

// // Report web vitals for performance monitoring
// export function reportWebVitals(metric) {
//     // You can send the metric to your analytics service here
//     console.log(metric);
// }
