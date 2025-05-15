"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useFlashcardSetsStore } from '@/features/flashcard-sets/hooks/useFlashcardSets';
import type { CurrentModalViewModel, FlashcardsSetViewItem } from '@/features/flashcard-sets/types';
import { FilterControlsComponent } from '@/features/flashcard-sets/components/FilterControlsComponent';
import { FlashcardsSetTableComponent } from '@/features/flashcard-sets/components/FlashcardsSetTableComponent';
import { PaginationControlsComponent } from '@/features/flashcard-sets/components/PaginationControlsComponent';
import { CreateSetModalComponent } from '@/features/flashcard-sets/components/CreateSetModalComponent';
import { EditSetModalComponent } from '@/features/flashcard-sets/components/EditSetModalComponent';
import { ConfirmDeleteModalComponent } from '@/features/flashcard-sets/components/ConfirmDeleteModalComponent';
import { EmptyStateSetsComponent } from '@/features/flashcard-sets/components/EmptyStateSetsComponent';
import type { FlashcardsSetDTO } from '@/types';

export default function FlashcardsSetsListViewPage() {
  const {
    setsData,
    isLoading,
    error,
    fetchSets,
  } = useFlashcardSetsStore();

  const [currentModal, setCurrentModal] = useState<CurrentModalViewModel>({ type: null, data: undefined });

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  const handleOpenCreateModal = () => {
    setCurrentModal({ type: "create" });
  };

  const handleOpenEditModal = (set: FlashcardsSetDTO) => {
    setCurrentModal({ type: "edit", data: set });
  };

  const handleOpenDeleteModal = (set: FlashcardsSetDTO) => {
    setCurrentModal({ type: "delete", data: set });
  };

  const handleCloseModal = () => {
    setCurrentModal({ type: null, data: undefined });
  };

  const handleViewDetails = (setId: string) => {
    console.log("Nawigacja do szczegółów zestawu:", setId);
    // import { useRouter } from 'next/navigation';
    // const router = useRouter();
    // router.push(`/sets/${setId}`);
  };

  const renderContent = () => {
    if (isLoading && !setsData) {
      return <p className="text-center text-lg py-10">Ładowanie zestawów...</p>;
    }

    if (error) {
      return (
        <p className="text-center text-red-500 py-10">
          Wystąpił błąd podczas ładowania zestawów: {error.message}
        </p>
      );
    }

    if (setsData && setsData.data.length === 0) {
      return <EmptyStateSetsComponent onOpenCreateModal={handleOpenCreateModal} />;
    }

    if (setsData && setsData.data.length > 0) {
      return (
        <div className="mt-6">
          <FlashcardsSetTableComponent 
            sets={setsData.data as FlashcardsSetViewItem[]} 
            isLoading={isLoading} 
            onViewDetails={handleViewDetails}
            onEditSet={handleOpenEditModal} 
            onDeleteSet={handleOpenDeleteModal} 
          />
          {setsData.meta && setsData.meta.total > 0 && (
             <PaginationControlsComponent meta={setsData.meta} />
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Moje Zestawy Fiszek</h1>
        <Button onClick={handleOpenCreateModal}>Utwórz nowy zestaw</Button>
      </div>

      <FilterControlsComponent />
      
      {renderContent()}

      <CreateSetModalComponent 
        isOpen={currentModal.type === 'create'}
        onClose={handleCloseModal}
      />

      <EditSetModalComponent 
        isOpen={currentModal.type === 'edit'}
        onClose={handleCloseModal}
        set={currentModal.type === 'edit' ? currentModal.data : undefined}
      />
      
      <ConfirmDeleteModalComponent 
        isOpen={currentModal.type === 'delete'}
        onClose={handleCloseModal}
        set={currentModal.type === 'delete' ? currentModal.data : undefined}
      />

    </div>
  );
} 