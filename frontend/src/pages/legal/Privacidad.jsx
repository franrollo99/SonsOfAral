import { Link } from "react-router-dom";
import "./LegalPages.css";

function Privacidad() {
  return (
    <section className="container legalPage">
      <div className="legalWrap d-flex flex-column gap-4">
        <div className="legalHeader d-flex flex-column gap-2">
          <h1>Política de Privacidad</h1>
          <p className="legalSubtitle">
            Información sobre el tratamiento de datos personales.
          </p>
        </div>

        <div className="legalBody d-flex flex-column gap-2">
          <p>
            Este sitio web está destinado a informar sobre la actividad musical
            de Sons of Aral. No dispone de registro público ni realiza ventas.
          </p>

          <h2>Datos que se pueden recoger</h2>
          <ul>
            <li>Datos técnicos imprescindibles para el funcionamiento del sitio</li>
            <li>Datos de contacto que se envíen voluntariamente por los canales indicados</li>
          </ul>

          <h2>Finalidad</h2>
          <p>
            Mostrar el contenido del sitio y atender comunicaciones voluntarias.
            No se realizan ventas ni cesiones de datos a terceros con fines comerciales.
          </p>

          <h2>Base legal</h2>
          <p>
            Interés legítimo para el funcionamiento técnico del sitio y consentimiento
            cuando una persona contacte voluntariamente.
          </p>

          <h2>Conservación</h2>
          <p>
            Los datos se conservan únicamente durante el tiempo necesario para el
            desarrollo y evaluación del proyecto académico.
          </p>

          <h2>Derechos</h2>
          <p>
            El usuario puede solicitar el acceso, rectificación o eliminación de
            sus datos contactando con el titular del proyecto: [email de
            contacto].
          </p>
        </div>
      </div>
    </section>
  );
}

export default Privacidad;
