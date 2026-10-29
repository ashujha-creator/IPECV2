"use client";
import {
  Mail,
  Phone,
  Search,
  NotebookPen,
  SquareArrowOutUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";
import Link from "next/link";
const Header = () => {
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/logo.png"
              alt="College Logo"
              width={700}
              height={250}
              className="h-auto w-56 sm:w-72 md:w-80 lg:w-[420px] xl:w-[500px]"
              priority
            />
          </div>

          {/* Right Section */}
          <div className="flex flex-col gap-5 w-full lg:w-auto">
            {/* Contact Information */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-end">
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>123-456-7890</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>123-312-3123</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail size={18} />
                <span>admissions@college.edu</span>
              </div>
            </div>

            {/* Buttons & Search */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {/* Admission Button */}
              <Button
                size="lg"
                className="w-full lg:w-auto bg-[#ed4200] hover:bg-orange-600 text-white rounded-xl px-6 py-6 flex items-center justify-center gap-2"
              >
                <NotebookPen className="h-5 w-5" />
                <Link href={"/addmission"}>
                  <span>Admission Open</span>
                </Link>
              </Button>

              {/* Virtual Tour Button */}
              <Link href={"/tour"}>
                <Button
                  size="lg"
                  className="w-full lg:w-auto bg-[#ed4200] hover:bg-orange-600 text-white rounded-xl px-6 py-6 flex items-center justify-center gap-2"
                >
                  <SquareArrowOutUpRight className="h-5 w-5" />
                  <span>Virtual Campus Tour</span>
                </Button>
              </Link>
              {/* Search */}
              <div className="flex w-full lg:w-72 items-center rounded-xl border border-gray-300 px-3 py-2">
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 bg-transparent outline-none"
                />
                <Search className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
