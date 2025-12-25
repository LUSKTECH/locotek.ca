import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Music } from "lucide-react";
import styles from "./page.module.css";

// Assuming Lucide doesn't have SoundCloud, using CloudLightning or Music as placeholder, 
// or I can import a custom SVG if needed. 
// Actually, Lucide doesn't have specific brand icons usually. 
// I'll check if I need to use another lib or just text/generic.
// Wait, Lucide usually has generic icons. 
// For social links, maybe just text or generic icons if Lucide lacks brands. 
// I'll stick to text + simple icons. 

export default function Home() {
  return (
    <main className={styles.container}>
      {/* Background Image */}
      <div className={styles.backgroundOverlay}>
        <Image
          src="/bg-fog.png"
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
      </div>

      <div className={styles.hero}>
        <h1 className={styles.logoText}>LOCOTEK</h1>
        <p className={styles.tagline}>Toronto-based DJ & Producer</p>
      </div>

      <div className={styles.grid}>
        <Link href="https://www.facebook.com/Locotek/" target="_blank" rel="noopener noreferrer" className={styles.card}>
          <Facebook color="#00ff94" />
          <span className={styles.cardText}>Facebook</span>
        </Link>

        <Link href="https://soundcloud.com/locotek" target="_blank" rel="noopener noreferrer" className={styles.card}>
          {/* SoundCloud usually orange, but keeping theme consistent */}
          <Music color="#00ff94" />
          <span className={styles.cardText}>SoundCloud</span>
        </Link>

        <Link href="https://x.com/LocotekOfficial" target="_blank" rel="noopener noreferrer" className={styles.card}>
          <Twitter color="#00ff94" />
          <span className={styles.cardText}>X</span>
        </Link>
      </div>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} LOCOTEK.CA | <a href="https://lusk.tech" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Lusk Technologies</a>
      </footer>
    </main>
  );
}
