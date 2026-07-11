import styles from './App.module.css'

function App() {
  return (
    <main className={`safe-area ${styles.appShell}`}>
      <section className={styles.phoneShell} aria-label="drinkit app shell">
        <div className={styles.topBar}>
          <span className={styles.brand}>drinkit</span>
          <span className={styles.status}>09:41</span>
        </div>
        <div className={styles.heroBlock}>
          <p className={styles.kicker}>Mobile coffee</p>
          <h1>Dark app shell</h1>
          <p className={styles.copy}>React, Vite, TypeScript, Inter, and tokens are ready.</p>
        </div>
        <div className={styles.previewCard}>
          <div className={styles.previewImage} />
          <div>
            <p className={styles.previewTitle}>Iced latte</p>
            <p className={styles.previewMeta}>2 600 KZT</p>
          </div>
          <span className={styles.previewButton}>+</span>
        </div>
      </section>
    </main>
  )
}

export default App
