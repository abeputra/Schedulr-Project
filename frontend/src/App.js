import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import SecondRegisterPage from "./components/SecondRegisterPage";
import DashboardPage from "./components/DashboardPage";
import ProfilePage from "./components/ProfilePage";
import CreatePage from "./components/CreatePage";
import EventDetails from "./components/EventDetails";
import SubEventDetails from "./components/SubEventDetails";
import Details from "./components/Details";
import PerSubEvent from "./components/PerSubEvent";
import ProtectedRoute from "./components/ProtectedRoute"; // tambahkan ini
import ChatbotPage from "./components/ChatbotPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tidak dilindungi */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/nextregister" element={<SecondRegisterPage />} />

        {/* Dilindungi */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/details"
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subevent/:eventId"
          element={
            <ProtectedRoute>
              <SubEventDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/details/:eventId"
          element={
            <ProtectedRoute>
              <Details />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subevents/detail/:subeventId"
          element={
            <ProtectedRoute>
              <PerSubEvent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
