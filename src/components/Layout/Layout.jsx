import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] overflow-auto bg-[#F8FAFC]">
        <Outlet />
      </main>
    </>
  );
}
