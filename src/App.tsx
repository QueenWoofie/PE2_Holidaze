import { Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Venue from "./pages/Venue";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import MyBookings from "./pages/MyBookings";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/venue/:id" element={<Venue />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/bookings" element={<MyBookings />} />
      </Route>
    </Routes>
  );
}
