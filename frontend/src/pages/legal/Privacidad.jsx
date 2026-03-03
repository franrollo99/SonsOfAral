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
            Este sitio web puede recoger datos personales mediante formularios de
            registro, inicio de sesión y pedidos con la finalidad de simular el
            funcionamiento de una plataforma dentro de un proyecto académico.
          </p>

          <h2>Datos que se pueden recoger</h2>
          <ul>
            <li>Nombre y apellidos</li>
            <li>Email</li>
            <li>Dirección (provincia, municipio, dirección, código postal)</li>
            <li>Información necesaria para la gestión de pedidos</li>
          </ul>

          <h2>Finalidad</h2>
          <p>
            Gestión de usuarios y simulación de pedidos dentro del entorno
            académico. No se realizan cesiones de datos a terceros con fines
            comerciales.
          </p>

          <h2>Base legal</h2>
          <p>
            Consentimiento del usuario al registrarse o enviar formularios en el
            sitio.
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