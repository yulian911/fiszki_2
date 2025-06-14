"use client";

import { ResponsiveModal } from "@/components/response-modal";
import useEditModalSet from "../hooks/useEditModal";
import { EditSetFormComponent } from "./EditSetFormComponent";
import { ConfirmDeleteModalComponent } from "./ConfirmDeleteModalComponent";
import { CreateSetFormComponent } from "./CreateSetFormComponent";

// type Props = {
//   //   onOpenChange?: () => void;
//   //   open: boolean;
//   userId?: string;
// };

export default function OpenEditDeleteFlashcardSetModal() {
  const {
    flashcardSetEditId,
    deleteFlashcardSetId,
    deleteClose,
    open,
    isOpen,
    close,
    closeEdit,
  } = useEditModalSet();

  // Określa, czy modal powinien być otwarty
  const isModalOpen =
    !!isOpen || !!flashcardSetEditId || !!deleteFlashcardSetId;

  // Obsługa zamykania modalu
  const handleModalClose = () => {
    if (isOpen) {
      close();
    }
    if (flashcardSetEditId) {
      closeEdit();
    }
    if (deleteFlashcardSetId) {
      deleteClose();
    }
  };

  // Określenie treści modalu na podstawie aktualnego stanu
  let title = "Utwórz nowy zestaw fiszek";
  let description =
    "Wprowadź nazwę dla swojego nowego zestawu. Po zapisaniu będziesz mógł dodać do niego fiszki.";
  let content = null;
  let testId = "create-set-modal"; // Domyślny test-id

  if (flashcardSetEditId) {
    title = "Edytuj zestaw fiszek";
    description = "Edytuj nazwę swojego zestawu fiszek";
    testId = "edit-set-modal";
    content = (
      <EditSetFormComponent
        flashcardSetId={flashcardSetEditId}
        onCancel={closeEdit}
      />
    );
  } else if (deleteFlashcardSetId) {
    title = "Usuń zestaw fiszek";
    description = "Czy na pewno chcesz usunąć ten zestaw fiszek?";
    testId = "delete-set-modal";
    content = (
      <ConfirmDeleteModalComponent
        deleteFlashcardSetId={deleteFlashcardSetId}
        onCancel={deleteClose}
      />
    );
  } else if (isOpen) {
    content = <CreateSetFormComponent onCancel={close} />;
  }

  // Jeśli nie ma treści, nie renderuj modalu wcale
  if (!isModalOpen || !content) {
    return null;
  }

  return (
    <ResponsiveModal
      open={isModalOpen}
      title={title}
      description={description}
      onOpenChange={handleModalClose}
      data-testid={testId}
    >
      {content}
    </ResponsiveModal>
  );
}
