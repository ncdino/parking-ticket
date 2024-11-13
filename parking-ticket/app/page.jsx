// app/page.jsx

import Header from "./components/Header";
import MainPage from "./components/MainPage";
import ReorderTabs from "./components/Tab/ReorderTabs";

export default function Home() {
  return (
    <div className="font-pretendard tracking-tighter px-4 py-8">
      {/* <MainPage /> */}
      <Header />
      <ReorderTabs />
    </div>
  );
}
