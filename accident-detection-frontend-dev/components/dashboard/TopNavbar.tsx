"use client";
import Link from "next/link";
import useSidebar from "@/contexts/useSidebar";
import { Menu } from "lucide-react";
import UserNav from "../auth/UserNav";
import MaxWidthContainer from "../layouts/MaxWidthContainer";
import { Button } from "../ui/button";

type Props = {};

export default function TopNavbar({}: Props) {
  const { showSidebar, setShowSidebar } = useSidebar();
  return (
    <main className="bg-white py-4 border-b-2">
      <MaxWidthContainer className="max-w-none md:px-5">
        <nav className="flex flex-row items-center justify-between ">
          <div>
            <div
              className="block md:hidden"
              onClick={() => {
                setShowSidebar(true);
              }}
            >
              <Menu />
            </div>
            <Link href="/auth/bbb">
              <h2 className="text-xl font-black text-gray-900 cursor-pointer"></h2>
            </Link>
          </div>
          <ul className="flex items-center justify-center space-x-6">
            <Button
              onClick={() => {
                localStorage.removeItem("Authorization");
                localStorage.removeItem("Refresh");
                window.location.pathname = "/";
              }}
            >
              Logout
            </Button>
            <UserNav />
          </ul>
        </nav>
      </MaxWidthContainer>
    </main>
  );
}