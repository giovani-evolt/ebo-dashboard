"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CalendarBox from "@/components/CalenderBox";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";

const CalendarPage = () => {
  return (
    <ProtectedRoute>
      <Breadcrumb pageName="Calendar" />
      <CalendarBox />
    </ProtectedRoute>
  );
};

export default CalendarPage;
