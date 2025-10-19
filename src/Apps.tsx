// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import TownSquare from "./pages/landing/TownSquare";

// Placeholder room components (update with Nostr feeds later)
const MosqueRoom = () => <div>Mosque Feed</div>;
const TempleRoom = () => <div>Temple Feed</div>;
const SynagogueRoom = () => <div>Synagogue Feed</div>;
const ChurchRoom = () => <div>Church Feed</div>;
const MathrisRoom = () => <div>Mathris Feed</div>;
const AtheismRoom = () => <div>Atheism Feed</div>;
const LobbyRoom = () => <div>Lobby Feed</div>;
const MarketRoom = () => <div>Market Feed</div>;
const NewsRoom = () => <div>News Feed</div>;

const App = () => (
  <Routes>
    <Route path="/" element={<TownSquare />} />
    <Route path="/room/mosque" element={<MosqueRoom />} />
    <Route path="/room/temple" element={<TempleRoom />} />
    <Route path="/room/synagogue" element={<SynagogueRoom />} />
    <Route path="/room/church" element={<ChurchRoom />} />
    <Route path="/room/mathris" element={<MathrisRoom />} />
    <Route path="/room/atheism" element={<AtheismRoom />} />
    <Route path="/room/lobby" element={<LobbyRoom />} />
    <Route path="/room/market" element={<MarketRoom />} />
    <Route path="/rooms/news" element={<NewsRoom />} />
  </Routes>
);

export default App;