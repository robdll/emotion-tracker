import Head from "next/head";
import CameraFeed from '../components/CameraFeed';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>Emotion Recognition Demo</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1>Emotion Recognition Demo</h1>
        <CameraFeed />
      </main>
    </>
  );
}
