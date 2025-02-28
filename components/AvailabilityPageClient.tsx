"use client";
import { useState } from "react";
import AvailabilityForm from "./AvailabilityForm";
import AvailabilityList from "./AvailabilityList";

export default function AvailabilityPageClient() {
  const [viewMode, setViewMode] = useState("form");

  const toggleView = () => {
    setViewMode((prev) => (prev === "form" ? "list" : "form"));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {viewMode === "form" ? "Submit Your Availability" : "My Availabilities"}
        </h1>
        <button
          onClick={toggleView}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700 transition-colors"
        >
          {viewMode === "form" ? "View Availabilities" : "Enter Availability"}
        </button>
      </div>
      {viewMode === "form" ? <AvailabilityForm /> : <AvailabilityList />}
    </div>
  );
}