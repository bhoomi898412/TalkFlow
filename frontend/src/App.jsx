import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPageWrapper from './Landing/LandingPageWrapper'
import DashboardPageWrapper from './Dashboard/DashboardPageWrapper'
import ProtectedRoute from "./Dashboard/components/ProtectedRoute";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<LandingPageWrapper />} />
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardPageWrapper />
            </ProtectedRoute>} />
          </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
