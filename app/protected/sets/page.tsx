"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { useRouter } from 'next/navigation';

export default function FlashcardsSetsListViewPage() {
  const {
    setsData,
    isLoading,
    error,
    fetchSets,
    isMutating,
    resetError,
    resetState
  } = useFlashcardSetsStore();

  const router = useRouter();
  const [currentModal, setCurrentModal] = useState<CurrentModalViewModel>({ type: null, data: undefined });

  // Efekt do odświeżania danych
  useEffect(() => {
    console.log('Initial fetch sets');
    fetchSets().catch(console.error);
  }, [fetchSets]);

  // Efekt do śledzenia zmian stanu
  useEffect(() => {
    console.log('State changed:', {
      currentModal,
      isMutating,
      isLoading,
      error,
      setsData: setsData ? {
        total: setsData.meta?.total,
        currentPage: setsData.meta?.page,
        itemsCount: setsData.data.length
      } : null
    });
  }, [currentModal, isMutating, isLoading, error, setsData]);

  const handleOpenCreateModal = useCallback(() => {
    console.log('Opening create modal, current state:', { isMutating });
    if (!isMutating) {
      setCurrentModal({ type: "create" });
    }
  }, [isMutating, setCurrentModal]);

  const handleOpenEditModal = useCallback((set: FlashcardsSetDTO) => {
    console.log('Opening edit modal, current state:', { isMutating, set });
    if (!isMutating) {
      setCurrentModal({ type: "edit", data: set });
    }
  }, [isMutating, setCurrentModal]);

  const handleOpenDeleteModal = useCallback((set: FlashcardsSetDTO) => {
    console.log('Opening delete modal, current state:', { isMutating, set });
    if (!isMutating) {
      setCurrentModal({ type: "delete", data: set });
    }
  }, [isMutating, setCurrentModal]);

  const handleCloseModal = useCallback(async () => {
    console.log('Closing modal, current state:', { isMutating, currentModal });
    if (!isMutating) {
      setCurrentModal({ type: null, data: undefined });
      resetState();
      try {
        console.log('Refreshing data after modal close');
        await fetchSets();
        console.log('Data refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh data after modal close:', error);
      }
    }
  }, [fetchSets, isMutating, resetState, currentModal]);

  const handleViewDetails = useCallback((setId: string) => {
    console.log('Viewing details, current state:', { isMutating, setId });
    if (!isMutating) {
      router.push(`/protected/sets/${setId}`);
    }
  }, [router, isMutating]);

  const renderContent = useCallback(() => {
    if (isLoading && !setsData) {
      return <p className="text-center text-lg py-10">Ładowanie zestawów...</p>;
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">
            Wystąpił błąd podczas ładowania zestawów: {error.message}
          </p>
          <Button onClick={() => fetchSets().catch(console.error)}>
            Spróbuj ponownie
          </Button>
        </div>
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
  }, [isLoading, error, setsData, handleOpenCreateModal, handleViewDetails, handleOpenEditModal, handleOpenDeleteModal, fetchSets]);

  const memoizedContent = useMemo(() => renderContent(), [renderContent]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Moje Zestawy Fiszek</h1>
        <Button 
          onClick={handleOpenCreateModal}
          disabled={isMutating}
        >
          Utwórz nowy zestaw
        </Button>
      </div>

      <FilterControlsComponent />
      
      {memoizedContent}

      {currentModal.type === 'create' && (
        <CreateSetModalComponent 
          key="create-modal"
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}

      {currentModal.type === 'edit' && currentModal.data && (
        <EditSetModalComponent 
          key={`edit-modal-${currentModal.data.id}`}
          isOpen={true}
          onClose={handleCloseModal}
          set={currentModal.data}
        />
      )}
      
      {currentModal.type === 'delete' && currentModal.data && (
        <ConfirmDeleteModalComponent 
          key={`delete-modal-${currentModal.data.id}`}
          isOpen={true}
          onClose={handleCloseModal}
          set={currentModal.data}
        />
      )}
    </div>
  );
} 