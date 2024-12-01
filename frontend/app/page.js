"use client"

import React, { useEffect } from "react";
import "./globals.css";
import { Maps } from "./home/Maps";
import { useRouter } from "next/navigation";
import { reportWebVitals, trackPageView, trackJsError } from '../lib/monitoring';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
};

export default function Display() {
    const router = useRouter();

    useEffect(() => {
        // Authentication check
        if (!getCookie("logged_in")) {
            router.push("/login");
            return;
        }

        // Initialize monitoring
        try {
            reportWebVitals();
            trackPageView();

            // Error boundary
            const handleError = (error) => {
                trackJsError(error);
                console.error('Page Error:', error);
            };

            window.addEventListener('error', handleError);

            return () => {
                window.removeEventListener('error', handleError);
            };
        } catch (error) {
            console.error('Monitoring setup error:', error);
        }
    }, [router]);

    // Error boundary for the entire component
    try {
        return (
            <>
                <Maps />
            </>
        );
    } catch (error) {
        trackJsError(error);
        return <div>Something went wrong. Please try again.</div>;
    }
}

// Report web vitals for performance monitoring
export function reportWebVitals(metric) {
    // You can send the metric to your analytics service here
    console.log(metric);
}