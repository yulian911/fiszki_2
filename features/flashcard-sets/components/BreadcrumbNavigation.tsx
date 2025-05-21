import Link from "next/link";
import React from "react";

interface BreadcrumbNavigationProps {
  setName: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ setName }) => {
  return (
    <nav className="text-sm mb-2" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex items-center space-x-2 text-muted-foreground">
        <li>
          <Link href="/protected/sets" className="hover:underline">
            Zestawy
          </Link>
        </li>
        <li>/</li>
        <li className="font-medium text-foreground truncate max-w-xs" title={setName}>
          {setName}
        </li>
      </ol>
    </nav>
  );
}; 