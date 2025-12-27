"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./PressKitModal.module.css";

interface PressKitModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function PressKitModal({ isOpen, onClose }: PressKitModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    // Handle backdrop click by checking if click is on the dialog itself (not content)
    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleClick);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/presskit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        // Trigger download
        const link = document.createElement("a");
        link.href = data.downloadUrl || "/uploads/PressKit.zip";
        link.download = "LOCOTEK-PressKit.zip";
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // Reset and close after delay
        setTimeout(() => {
          setEmail("");
          setStatus("idle");
          onClose();
        }, 2000);
      } else {
        throw new Error(data.error || "Form submission failed");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <dialog 
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="modal-title"
    >
      <div className={styles.modal}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
        
        <h2 id="modal-title" className={styles.title}>Download Press Kit</h2>
        
        {status === "success" ? (
          <p className={styles.successMessage}>
            Thanks! Your download should start automatically.
          </p>
        ) : (
          <>
            <p className={styles.description}>
              Enter your email to download the press kit.
            </p>
            
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                disabled={status === "loading"}
                aria-describedby={errorMessage ? "email-error" : undefined}
              />
              
              {errorMessage && (
                <p id="email-error" className={styles.errorMessage} role="alert">
                  {errorMessage}
                </p>
              )}
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Processing..." : "Download"}
              </button>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
