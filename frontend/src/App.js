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
import PerSubEvent from "./components/PerSubEvent"; // tanpa kurung kurawal

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/nextregister" element={<SecondRegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/details" element={<EventDetails />} />
        <Route path="/subevent/:eventId" element={<SubEventDetails />} />
        <Route path="/details/:eventId" element={<Details />} />
        <Route path="/subevents/detail/:subeventId" element={<PerSubEvent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
