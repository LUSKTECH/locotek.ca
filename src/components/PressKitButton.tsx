"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import PressKitModal from "./PressKitModal";
import styles from "./PressKitButton.module.css";

export default function PressKitButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        className={styles.button}
        onClick={() => setIsModalOpen(true)}
      >
        <Download size={20} color="#dd2431" />
        <span className={styles.text}>Press Kit</span>
      </button>
      
      <PressKitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
