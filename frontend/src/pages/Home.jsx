import "./Home.css";

export function Home() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section id="inicio" className="hero">
        <div className="hero__content">
          <h1>Sons of Aral</h1>
          <p>Nu/Hardcore band from Spain.</p>
          
        </div>
      </section>

      {/* Bloque de contacto */}
      <section id="contacto" className="section">
        <h2>Contacto</h2>
        <p className="section__subtitle">
          Para bolos, colaboraciones o info, este bloque luego enlazará con tu backend.
        </p>
      </section>
    </div>
  );
}

export default Home;
