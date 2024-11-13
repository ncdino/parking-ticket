import React from "react";
import Tab from "./Tab"; // Tab 컴포넌트를 여기서 불러옵니다

const TabList = ({ pages, selectedTab, setSelectedTab }) => {
  return (
    <div className="flex space-x-2">
      {pages.map((page) => (
        <Tab
          key={page.id}
          item={page}
          isSelected={selectedTab === page.id}
          onClick={() => setSelectedTab(page.id)}
        />
      ))}
    </div>
  );
};

export default TabList;
