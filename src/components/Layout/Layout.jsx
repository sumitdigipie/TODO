import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <>
      <Header />
      <main className="bg-[#F8FAFC] ">
        <Outlet />
      </main>
    </>
  );
}
