import Image from "next/image";
import Link from "next/link";
import { Facebook, X, SoundCloud } from "@/components/Icons";
import styles from "./page.module.css";
import VantaFog from "@/components/VantaFog";
import PressKitButton from "@/components/PressKitButton";

export default function Home() {
  return (
    <main className={styles.container}>
      {/* Background Image */}
      <div className={styles.backgroundOverlay}>
        <Image
          src="/bg-fog-flat.jpg"
          alt="Background"
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          priority
          suppressHydrationWarning
        />
        <div
          style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.4)" }}
          suppressHydrationWarning
        />
        {/* Moving Fog Animation at Bottom */}
        <div className={styles.fogContainer}>
          <VantaFog />
        </div>
      </div>

      <div className={styles.hero}>
        <h1 className={styles.logoWrapper}>
          <Image
            src="/logo.svg"
            alt="LOCOTEK"
            width={600}
            height={120}
            className={styles.logo}
            priority
          />
        </h1>
        <p className={styles.tagline}>Toronto-based DJ & Producer</p>
      </div>

      <div className={styles.grid}>
        <Link href="https://www.facebook.com/Locotek/" target="_blank" rel="noopener noreferrer" className={styles.card}>
          <Facebook color="#dd2431" width={24} height={24} />
          <span className={styles.cardText}>Facebook</span>
        </Link>

        <Link href="https://soundcloud.com/locotek" target="_blank" rel="noopener noreferrer" className={styles.card}>
          <SoundCloud color="#dd2431" width={24} height={24} />
          <span className={styles.cardText}>SoundCloud</span>
        </Link>

        <Link href="https://x.com/LocotekOfficial" target="_blank" rel="noopener noreferrer" className={styles.card}>
          <X color="#dd2431" width={24} height={24} />
          <span className={styles.cardText}>X</span>
        </Link>
      </div>

      <PressKitButton />

      <footer className={styles.footer}>
        © {new Date().getFullYear()} LOCOTEK.CA | <a href="https://lusk.tech" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Lusk Technologies</a>
      </footer>
    </main>
  );
}
