"use client";
import { useEffect } from "react";
import { useMedia } from "react-use";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { Drawer, DrawerContent } from "./ui/drawer";

type ResponsiveModalProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
};

export const ResponsiveModal = ({
  children,
  open,
  onOpenChange,
  title,
  description,
}: ResponsiveModalProps) => {
  const isDesktop = useMedia("(min-width: 1024px)", true);
  
  // Force document body to be non-interactive when modal is open
  useEffect(() => {
    if (open) {
      // If modal is open, we want to prevent scroll on body
      document.body.style.overflow = "hidden";
    } else {
      // When closed, restore scrolling
      document.body.style.overflow = "";
    }
    
    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
        <DialogContent className="sm:max-w-[425px]">
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
          {children}
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="px-4 py-6 overflow-y-auto hide-scrollbar max-h-[85vh]">
          {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
          {description && <p className="text-gray-500 mb-4">{description}</p>}
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
