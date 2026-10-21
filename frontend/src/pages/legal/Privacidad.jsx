import { Link } from "react-router-dom";
import "./LegalPages.css";

function Privacidad() {
  return (
    <section className="container legalPage">
      <div className="legalWrap d-flex flex-column gap-4">
        <div className="legalHeader d-flex flex-column gap-2">
          <h1>Política de Privacidad</h1>
          <p className="legalSubtitle">
            Tu privacidad también forma parte de nuestra relación contigo.
          </p>
        </div>

        <div className="legalBody d-flex flex-column gap-2">
          <p>
            En Sons of Aral respetamos tu privacidad. Aquí te explicamos cómo se
            utiliza la información relacionada con tu visita y las opciones que
            tienes para proteger tus datos.
          </p>

          <h2>Información que compartes</h2>
          <p>
            Puedes descubrir nuestra música, consultar los próximos conciertos y
            visitar la galería sin registrarte ni facilitar datos de contacto.
            Si escribes a la banda, podremos recibir tu nombre, tu dirección de
            contacto y el contenido del mensaje que decidas enviar.
          </p>

          <h2>Cómo utilizamos la información</h2>
          <p>
            La información de las visitas se utiliza para mostrar los contenidos
            y mantener una navegación segura. Los datos que nos facilites al
            contactar se emplearán para responderte y atender tu solicitud.
            Cuando una gestión requiera tu autorización, se te solicitará
            previamente.
          </p>

          <h2>Conservación y protección</h2>
          <p>
            La información se conserva durante el tiempo necesario para atender
            la finalidad para la que se recibió y cumplir las obligaciones
            aplicables. Se adoptan medidas para protegerla frente a accesos
            indebidos, pérdidas o usos no autorizados, aunque ningún servicio en
            Internet puede garantizar una seguridad absoluta.
          </p>

          <h2>Preferencias de navegación</h2>
          <p>
            Puedes gestionar o eliminar desde tu navegador los datos que la web
            guarda en tu dispositivo para facilitar la visita. Al eliminarlos,
            algunas funciones pueden necesitar cargarse de nuevo.
          </p>

          <h2>Servicios y enlaces externos</h2>
          <p>
            Algunos elementos del sitio se muestran mediante servicios externos,
            que pueden recibir información de la visita para ofrecerlos. También
            encontrarás enlaces a plataformas de música, vídeo, redes sociales y
            entradas. Cada servicio aplica su propia política de privacidad, que
            te recomendamos consultar al utilizarlo.
          </p>

          <h2>Tus derechos</h2>
          <p>
            Puedes solicitar el acceso, la rectificación o la supresión de tus
            datos, así como la limitación, la oposición o la portabilidad cuando
            corresponda. Si has dado tu consentimiento para un uso concreto,
            puedes retirarlo en cualquier momento.
          </p>
          <p>
            Para consultas o solicitudes relacionadas con tu información, puedes
            contactar con la banda a través de sus canales oficiales enlazados
            en esta web. También puedes presentar una reclamación ante la{" "}
            <a href="https://www.aepd.es/">
              Agencia Española de Protección de Datos
            </a>
            .
          </p>

          <p>
            Puedes consultar también las condiciones de uso del sitio en nuestro{" "}
            <Link to="/aviso-legal">aviso legal</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Privacidad;
