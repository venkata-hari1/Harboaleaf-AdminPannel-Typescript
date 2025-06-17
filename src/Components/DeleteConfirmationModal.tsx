// src/Components/DeleteConfirmationModal.tsx
import React from 'react';
import '../Styles/DeleteConfirmationModal.css'; // Make sure to create this CSS file

interface DeleteConfirmationModalProps {
    onConfirm: () => void;
    onCancel: () => void;
    itemName?: string; // Optional: Pass the name of the item being deleted for better context
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ onConfirm, onCancel, itemName = "this item" }) => {

    // Prevent clicks inside the modal content from bubbling up to the overlay
    // This stops the modal from closing if someone clicks inside it
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="delete-modal-overlay" onClick={onCancel}>
            <div className="delete-modal-content" onClick={handleContentClick}>
                <h2>Confirm Deletion</h2>
                <p>Are you sure you want to delete <span className="item-name-highlight">{itemName}</span>? This action cannot be undone.</p>
                <div className="delete-modal-actions">
                    <button className="delete-modal-cancel-btn" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="delete-modal-confirm-btn" onClick={onConfirm}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;