"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MainPage from "../MainPage";

const pages = [
  { id: "Map", title: "지도", content: "실시간 지도" },
  { id: "Graph", title: "그래프", content: "통계" },
  {
    id: "contact",
    title: "Contact",
    content: "Get in touch on the Contact Page.",
  },
];

export default function ReorderTabs() {
  const [selectedTab, setSelectedTab] = useState(pages[0].id);

  return (
    <div className="w-full h-full max-w-[100vw] max-h-[100vh] rounded-lg bg-[#f3f3f3] overflow-hidden shadow-xl flex flex-col">
      <nav className="bg-[#fdfdfd] p-2 rounded-t-lg border-b border-gray-200 flex items-center">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setSelectedTab(page.id)}
            className={`rounded-t-lg w-full px-4 py-2 bg-[#fdfdfd] cursor-pointer h-10 flex justify-between items-center text-black ${
              selectedTab === page.id
                ? "bg-gray-200 text-gray-900"
                : "bg-[#f3f3f3]"
            }`}
          >
            {page.title}
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        {pages
          .filter((page) => page.id === selectedTab)
          .map((page) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-gray-100 rounded-lg flex-grow"
            >
              {selectedTab === "Map" ? (
                <MainPage /> // Home 탭일 때 MapComponent 렌더링
              ) : (
                <p>{page.content}</p> // 다른 탭에서는 해당 페이지의 content를 렌더링
              )}
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
