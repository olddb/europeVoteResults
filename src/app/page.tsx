import Image from "next/image";
import styles from "./page.module.css";
import dynamic from "next/dynamic";

const VoteMap = dynamic(() => import("../Components/VoteMap"), { ssr: false });

export default function Home() {
  return (
    <main className={styles.main}>
      <VoteMap />
    </main>
  );
}
