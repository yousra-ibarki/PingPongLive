"use client";

import React from 'react';
import toast from 'react-hot-toast';

export const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
  
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      toast.error("Error formatting timestamp");
      return timestamp;
    }
};