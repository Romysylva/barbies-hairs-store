// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { SidebarProps } from "@/lib/types/menu";
// import Image from "next/image";
// import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
// import { menuItems } from "@/data/menu-items";

// const Sidebar: React.FC<SidebarProps> = ({ userRole, onCustomAction }) => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
//     {}
//   );
//   const pathname = usePathname();

//   const toggleSubmenu = (label: string) => {
//     setExpandedMenus((prev) => ({
//       ...prev,
//       [label]: !prev[label],
//     }));
//   };

//   return (
//     <>
//       {/* Mobile Hamburger */}
//       <button
//         className="bhs:p-2 bhs:m-2 bhs-bg-pink-500 bhs:rounded-md bhs:md:hidden bhs:text-white"
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//       >
//         {isSidebarOpen ? <X /> : <Menu />}
//       </button>

//       {/* Sidebar */}
//       <aside
//         className={`bhs:fixed bhs:top-0 bhs:left-0 bhs:h-full bhs:bg-white bhs:dark:bg-gray-900 bhs:shadow-md bhs:transition-transform
//           ${isSidebarOpen ? "bhs:translate-x-0" : "-bhs:translate-x-full"}
//           bhs:md:translate-x-0 bhs:w-64`}
//       >
//         <h2 className="bhs:text-xl bhs:font-bold bhs:p-4 bhs:text-pink-600">
//           Barbie’s Hairs
//         </h2>

//         <ul className="bhs:space-y-1 bhs:p-2">
//           {menuItems
//             .filter((item) => item.roles.includes(userRole))
//             .map((item) => (
//               <li key={item.label}>
//                 {item.submenu ? (
//                   <>
//                     <div
//                       className="bhs:flex bhs:items-center bhs:justify-between bhs:p-3 bhs:cursor-pointer bhs:hover:bg-pink-50 bhs:dark:hover:bg-gray-800 bhs:rounded-md"
//                       onClick={() => toggleSubmenu(item.label)}
//                     >
//                       <span className="bhs:flex bhs:items-center bhs:gap-2">
//                         {item.icon}
//                         {item.label}
//                       </span>
//                       {expandedMenus[item.label] ? (
//                         <ChevronDown />
//                       ) : (
//                         <ChevronRight />
//                       )}
//                     </div>

//                     {expandedMenus[item.label] && (
//                       <ul className="bhs-ml-6 bhs-mt-1 bhs-space-y-1">
//                         {item.submenu.map((sub) => (
//                           <li key={sub.label}>
//                             {sub.action ? (
//                               <button
//                                 className="bhs:flex bhs:items-center bhs:gap-2 bhs:w-full bhs:text-left bhs:p-2 bhs:rounded-md bhs:hover:bg-pink-100 bhs:dark:hover:bg-gray-700"
//                                 onClick={() => onCustomAction?.(sub.action!)}
//                               >
//                                 {sub.icon} {sub.label}
//                               </button>
//                             ) : (
//                               <Link
//                                 href={sub.path!}
//                                 className={`bhs:flex bhs:items-center bhs:gap-2 bhs:p-2 bhs:rounded-md hover:bhs-bg-pink-100 bhs:dark:hover:bg-gray-700 ${
//                                   pathname === sub.path
//                                     ? "bhs:bg-pink-100 bhs:dark:bg-gray-800 bhs:font-semibold"
//                                     : ""
//                                 }`}
//                               >
//                                 {sub.icon} {sub.label}
//                               </Link>
//                             )}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </>
//                 ) : (
//                   <Link
//                     href={item.path!}
//                     className={`bhs:flex bhs:items-center bhs:gap-2 bhs:p-3 bhs:rounded-md hover:bhs-bg-pink-50 dark:bhs:hover:bg-gray-800 ${
//                       pathname === item.path
//                         ? "bhs:bg-pink-100 bhs:dark:bg-gray-800 bhs:font-semibold"
//                         : ""
//                     }`}
//                   >
//                     {item.icon} {item.label}
//                   </Link>
//                 )}
//               </li>
//             ))}
//         </ul>
//         <div className="advatar">
//           <div className="bhs:flex bhs:flex-row bhs:m-5 bhs:mb-8">
//             <Image
//               height={40}
//               width={40}
//               src="./globe.svg"
//               alt="User Avatar"
//               className="bhs:rounded-full bhs:border-2 bhs:border-pink-600"
//             />
//             <div className="bhs:m-auto bhs:text-lg">Promise Sylva</div>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";

import { SidebarProps } from "@/data/types/menu";
import { menuItems } from "@/data/menu-items";
import { getMe } from "@/services/services"; // or getCurrentUser (/me)
import { User } from "@/data/types/users";

{
  /* <Image src={imageUrl} height={40} width={40} alt={user.name} /> */
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, onCustomAction }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );
  const [user, setUser] = useState<User | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getMe();
        if (user) {
          setUser(user);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  if (!user) return null;
  const baseApi = process.env.NEXT_PUBLIC_API_URL?.replace(
    "/api/barbies/v1",
    ""
  );
  const imageUrl = `${baseApi}/uploads/${user.photo}`;

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="bhs:p-2 bhs:m-2 bhs-bg-pink-500 bhs:rounded-md bhs:md:hidden bhs:text-white"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`bhs:fixed bhs:top-0 bhs:left-0 bhs:h-full bhs:bg-white bhs:dark:bg-gray-900
          bhs:shadow-md bhs:transition-transform
          ${isSidebarOpen ? "bhs:translate-x-0" : "-bhs:translate-x-full"}
          bhs:md:translate-x-0 bhs:w-64`}
      >
        <h2 className="bhs:text-xl bhs:font-bold bhs:p-4 bhs:text-pink-600">
          Barbie’s Hairs
        </h2>

        {/* Menu Items */}
        <ul className="bhs:space-y-1 bhs:p-2">
          {menuItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => (
              <li key={item.label}>
                {item.submenu ? (
                  <>
                    <div
                      className="bhs:flex bhs:items-center bhs:justify-between
                        bhs:p-3 bhs:cursor-pointer bhs:hover:bg-pink-50
                        bhs:dark:hover:bg-gray-800 bhs:rounded-md"
                      onClick={() => toggleSubmenu(item.label)}
                    >
                      <span className="bhs:flex bhs:items-center bhs:gap-2">
                        {item.icon} {item.label}
                      </span>
                      {expandedMenus[item.label] ? (
                        <ChevronDown />
                      ) : (
                        <ChevronRight />
                      )}
                    </div>

                    {expandedMenus[item.label] && (
                      <ul className="bhs-ml-6 bhs-mt-1 bhs-space-y-1">
                        {item.submenu.map((sub) => (
                          <li key={sub.label}>
                            {sub.action ? (
                              <button
                                className="bhs:flex bhs:items-center bhs:gap-2
                                  bhs:w-full bhs:text-left bhs:p-2
                                  bhs:rounded-md bhs:hover:bg-pink-100
                                  bhs:dark:hover:bg-gray-700"
                                onClick={() => onCustomAction?.(sub.action!)}
                              >
                                {sub.icon} {sub.label}
                              </button>
                            ) : (
                              <Link
                                href={sub.path!}
                                className={`bhs:flex bhs:items-center bhs:gap-2
                                  bhs:p-2 bhs:rounded-md hover:bhs:bg-pink-100
                                  bhs:dark:hover:bg-gray-700 ${
                                    pathname === sub.path
                                      ? "bhs:bg-pink-100 bhs:dark:bg-gray-800 bhs:font-semibold"
                                      : ""
                                  }`}
                              >
                                {sub.icon} {sub.label}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path!}
                    className={`bhs:flex bhs:items-center bhs:gap-2 bhs:p-3
                      bhs:rounded-md hover:bhs:bg-pink-50
                      dark:bhs:hover:bg-gray-800 ${
                        pathname === item.path
                          ? "bhs:bg-pink-100 bhs:dark:bg-gray-800 bhs:font-semibold"
                          : ""
                      }`}
                  >
                    {item.icon} {item.label}
                  </Link>
                )}
              </li>
            ))}
        </ul>

        {/* User Avatar & Info */}
        <div className="advatar">
          {user && (
            <div className="bhs:flex bhs:flex-row bhs:m-5 bhs:mb-8">
              <Image
                height={40}
                width={40}
                src={`${imageUrl}`}
                alt={user.name}
                className="bhs:rounded-full bhs:border-2 bhs:border-pink-600"
              />
              <div className="bhs:text-lg bhs:truncate bhs:mx-auto">
                {user.name}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
