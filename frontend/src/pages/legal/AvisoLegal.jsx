import { Link } from "react-router-dom";
import "./LegalPages.css";

function AvisoLegal() {
  return (
    <section className="container legalPage">
      <div className="legalWrap d-flex flex-column gap-4">
        <div className="legalHeader d-flex flex-column gap-2">
          <h1>Aviso Legal</h1>
          <p className="legalSubtitle">Información legal del sitio web.</p>
        </div>

        <div className="legalBody d-flex flex-column gap-2">
          <p>
            En cumplimiento de lo dispuesto en la Ley 34/2002, de Servicios de la
            Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se
            informa que el presente sitio web constituye un proyecto académico
            desarrollado como Trabajo de Fin de Grado Superior.
          </p>

          <h2>Titular del sitio web</h2>
          <ul>
            <li>Nombre: Francisco Rodríguez Llorente</li>
            <li>Proyecto: Sons of Aral Website</li>
            <li>Finalidad: Proyecto académico sin fines comerciales reales</li>
          </ul>

          <h2>Condiciones de uso</h2>
          <p>
            El acceso y navegación por este sitio web implica la aceptación de las
            condiciones aquí establecidas. El titular no se responsabiliza del uso
            indebido que los usuarios puedan hacer del contenido del sitio web.
          </p>

          <h2>Enlaces a terceros</h2>
          <p>
            Este sitio puede contener enlaces a páginas de terceros. El titular no
            se responsabiliza del contenido externo enlazado.
          </p>

          <h2>Cookies</h2>
          <p>
            Este sitio puede utilizar cookies técnicas necesarias para el
            funcionamiento y la navegación. Para más información, revisa la
            política de privacidad.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AvisoLegal;