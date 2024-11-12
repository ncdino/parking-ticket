// app/page.jsx

import Header from "./components/Header";
import MainPage from "./components/MainPage";

export default function Home() {
  return (
    <div className="font-paperlogy tracking-tighter px-10">
      <Header />
      <MainPage />
    </div>
  );
}
