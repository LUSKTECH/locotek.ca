"use client";

import { useState } from "react";
import styles from "./PressKitModal.module.css";

interface PressKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PressKitModal({ isOpen, onClose }: PressKitModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
        document.body.removeChild(link);
        
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

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        <h2 className={styles.title}>Download Press Kit</h2>
        
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
              />
              
              {errorMessage && (
                <p className={styles.errorMessage}>{errorMessage}</p>
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
    </div>
  );
}
