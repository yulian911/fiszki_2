import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  FilePenLine,
  Trash2,
  MoreHorizontal,
  Share2,
  Copy,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FlashcardsSetDTO, FlashcardsSetStatus } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/utils/utils";
import { useRouter } from "next/navigation";

// Interfejs dla propsów komponentu
interface FlashcardsSetTableComponentProps {
  sets: FlashcardsSetDTO[];
  onEdit: (set: FlashcardsSetDTO) => void;
  onShare: (set: FlashcardsSetDTO) => void;
  onDelete: (set: FlashcardsSetDTO) => void;
  onClone: (set: FlashcardsSetDTO) => void;
  onLearn: (set: FlashcardsSetDTO) => void;
}

export const FlashcardsSetTableComponent: React.FC<
  FlashcardsSetTableComponentProps
> = ({ sets, onEdit, onShare, onDelete, onClone, onLearn }) => {
  const router = useRouter();
  const getStatusVariant = (status: FlashcardsSetStatus) => {
    switch (status) {
      case "accepted":
        return "success";
      case "rejected":
        return "destructive";
      case "pending":
      default:
        return "secondary";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nazwa</TableHead>
          <TableHead>Właściciel</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Liczba fiszek</TableHead>
          <TableHead className="hidden md:table-cell">
            Data utworzenia
          </TableHead>
          <TableHead className="text-right">Akcje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sets.map((set) => {
          const isOwner = set.accessLevel === "owner";
          const canEdit = isOwner;
          const canDelete = isOwner;
          const canShare = isOwner && set.status === "accepted";
          const canClone = isOwner && set.status === "accepted"; // Klonowanie tylko własnych, zaakceptowanych zestawów
          const canLearn = (set.flashcardCount ?? 0) > 0;

          return (
            <TableRow key={set.id} data-testid={`set-row-${set.id}`}>
              <TableCell className="font-medium">
                <span
                  onClick={() => router.push(`/protected/sets/${set.id}`)}
                  className={
                    isOwner
                      ? "hover:underline cursor-pointer"
                      : "cursor-default"
                  }
                >
                  {set.name}
                </span>
              </TableCell>
              <TableCell>
                {isOwner ? (
                  <Badge variant="outline">Ja</Badge>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary">{set.ownerEmail}</Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        Udostępnione przez: {set.ownerEmail}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(set.status)}>
                  {set.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {set.flashcardCount ?? 0}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDate(set.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {isOwner ? (
                        <>
                          <DropdownMenuItem
                            onClick={() => onEdit(set)}
                            disabled={!canEdit}
                            data-testid={`edit-set-mobile-${set.id}`}
                          >
                            <FilePenLine className="mr-2 h-4 w-4" /> Edytuj
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onShare(set)}
                            disabled={!canShare}
                            data-testid={`share-set-mobile-${set.id}`}
                          >
                            <Share2 className="mr-2 h-4 w-4" /> Udostępnij
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onClone(set)}
                            disabled={!canClone}
                            data-testid={`clone-set-mobile-${set.id}`}
                          >
                            <Copy className="mr-2 h-4 w-4" /> Klonuj
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(set)}
                            disabled={!canDelete}
                            className="text-red-500"
                            data-testid={`delete-set-mobile-${set.id}`}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Usuń
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem
                            onClick={() => onLearn(set)}
                            disabled={!canLearn}
                            data-testid={`learn-set-mobile-${set.id}`}
                          >
                            <BookOpen className="mr-2 h-4 w-4" /> Ucz się
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="hidden md:flex items-center justify-end gap-2">
                  <TooltipProvider>
                    {isOwner ? (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(set)}
                              disabled={!canEdit}
                              data-testid={`edit-set-desktop-${set.id}`}
                            >
                              <FilePenLine className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edytuj</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onShare(set)}
                              disabled={!canShare}
                              data-testid={`share-set-desktop-${set.id}`}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {canShare
                              ? "Udostępnij"
                              : "Udostępnianie dostępne tylko dla zaakceptowanych"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onClone(set)}
                              disabled={!canClone}
                              data-testid={`clone-set-desktop-${set.id}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {canClone
                              ? "Klonuj"
                              : "Klonowanie dostępne tylko dla zaakceptowanych"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(set)}
                              disabled={!canDelete}
                              data-testid={`delete-set-desktop-${set.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Usuń</TooltipContent>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onLearn(set)}
                              disabled={!canLearn}
                              data-testid={`learn-set-desktop-${set.id}`}
                            >
                              <BookOpen className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {canLearn ? "Ucz się" : "Zestaw nie zawiera fiszek"}
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
