import { Outlet, useNavigation } from 'react-router-dom';
import {  useState } from "react";

import MenuSidebar from './MenuSidebar';
import Header from './Header';

function RootLayout() {
  const [editing, setEditing] = useState(false);
  // const navigation = useNavigation();
  function handleAddBookClick() {
    // TODO we aren't see this function being invoked
    console.log(`add button clicked`);
    setEditing(true);
  }

  function handleHomeClick() {
    console.log(`handleHomeClick - we prob need a router`);
    setEditing(false);
  }

  return (
    <>
    <div className="h-screen flex flex-col">
      {/* Header spans full width */}
      <Header />

      {/* Below header: sidebar and content side by side */}
      <div className="flex flex-1">
        {/* Sidebar on left - fixed width, full height */}
        <aside className="w-64 flex-shrink-0 bg-stone-900 text-stone-50 overflow-y-auto">
          <MenuSidebar/>
        </aside>

        {/* Main content on right - fills remaining space */}
        <main className="flex-1 overflow-y-auto p-8">
            <Outlet />
        </main>
      </div>
    </div>
        </>
  );
}

export default RootLayout;
