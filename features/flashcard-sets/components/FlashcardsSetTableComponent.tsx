import React from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FlashcardsSetDTO, FlashcardsSetStatus } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/utils/utils";

// Interfejs dla propsów komponentu
interface FlashcardsSetTableComponentProps {
  sets: FlashcardsSetDTO[];
  onEdit: (set: FlashcardsSetDTO) => void;
  onShare: (set: FlashcardsSetDTO) => void;
  onDelete: (set: FlashcardsSetDTO) => void;
  onClone: (set: FlashcardsSetDTO) => void;
}

export const FlashcardsSetTableComponent: React.FC<FlashcardsSetTableComponentProps> = ({
  sets,
  onEdit,
  onShare,
  onDelete,
  onClone,
}) => {

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
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Liczba fiszek</TableHead>
          <TableHead className="hidden md:table-cell">Data utworzenia</TableHead>
          <TableHead className="text-right">Akcje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sets.map((set) => {
          // Logika oparta w 100% na statusie
          const canEdit = set.status === 'accepted' || set.status === 'pending' || set.status === 'rejected';
          const canDelete = set.status === 'accepted' || set.status === 'rejected';
          const canShare = set.status === 'accepted';
          const canClone = set.status === 'accepted';
          
          return (
            <TableRow key={set.id}>
              <TableCell className="font-medium">{set.name}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(set.status)}>{set.status}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{set.flashcardCount ?? 0}</TableCell>
              <TableCell className="hidden md:table-cell">{formatDate(set.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onEdit(set)} disabled={!canEdit}>
                        <FilePenLine className="mr-2 h-4 w-4" /> Edytuj
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onShare(set)} disabled={!canShare}>
                        <Share2 className="mr-2 h-4 w-4" /> Udostępnij
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onClone(set)} disabled={!canClone}>
                        <Copy className="mr-2 h-4 w-4" /> Klonuj
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(set)} disabled={!canDelete} className="text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" /> Usuń
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="hidden md:flex items-center justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(set)} disabled={!canEdit}>
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                       <TooltipContent>{canEdit ? "Edytuj" : "Edycja niedostępna dla tego statusu"}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onShare(set)} disabled={!canShare}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{canShare ? "Udostępnij" : "Akcja dostępna tylko dla zaakceptowanych"}</TooltipContent>
                    </Tooltip>
                     <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onClone(set)} disabled={!canClone}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{canClone ? "Klonuj" : "Akcja dostępna tylko dla zaakceptowanych"}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(set)} disabled={!canDelete}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{canDelete ? "Usuń" : "Usuwanie niedostępne dla tego statusu"}</TooltipContent>
                    </Tooltip>
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