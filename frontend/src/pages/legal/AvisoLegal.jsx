import { Link } from "react-router-dom";
import "./LegalPages.css";

function AvisoLegal() {
  return (
    <section className="container legalPage">
      <div className="legalWrap d-flex flex-column gap-4">
        <div className="legalHeader d-flex flex-column gap-2">
          <h1>Aviso Legal</h1>
          <p className="legalSubtitle">
            Condiciones para disfrutar del contenido de Sons of Aral.
          </p>
        </div>

        <div className="legalBody d-flex flex-column gap-2">
          <p>
            Bienvenido al sitio web de Sons of Aral. Aquí compartimos nuestra
            música, los próximos conciertos y las imágenes que forman parte de
            la trayectoria de la banda.
          </p>

          <h2>Uso del sitio</h2>
          <p>
            La consulta de los contenidos es gratuita y no requiere registro.
            Utiliza la web de forma lícita y respetuosa con los derechos de
            otras personas. No se permiten usos que perjudiquen el servicio,
            alteren sus contenidos o vulneren los derechos de la banda o de
            terceros.
          </p>

          <h2>Derechos sobre los contenidos</h2>
          <p>
            Las canciones, grabaciones, fotografías, logotipos, textos y demás
            materiales pertenecen a Sons of Aral o a sus respectivos titulares.
            Poder acceder a ellos no supone una cesión de derechos ni autoriza
            su reproducción, distribución o explotación, salvo autorización o en
            los casos permitidos por la ley.
          </p>

          <h2>Conciertos y entradas</h2>
          <p>
            Las fechas, recintos, horarios y precios pueden variar por
            circunstancias de organización. Antes de acudir a un concierto o
            adquirir entradas, comprueba la información del organizador y las
            condiciones de la plataforma de venta.
          </p>
          <p>
            Las compras que realices a través de los enlaces de entradas se
            gestionan en sitios externos, bajo sus propias condiciones. Esta web
            no tramita pedidos ni pagos.
          </p>

          <h2>Plataformas externas</h2>
          <p>
            Los enlaces a servicios de música, vídeo y redes sociales te
            permiten seguir disfrutando del contenido de la banda fuera de esta
            web. Cada plataforma establece sus propias condiciones de acceso y
            uso.
          </p>

          <h2>Información y disponibilidad</h2>
          <p>
            Procuramos mantener el contenido actualizado y disponible. Aun así,
            puede haber cambios, errores o interrupciones temporales. Estas
            condiciones no limitan los derechos ni las responsabilidades
            establecidos por la normativa aplicable.
          </p>

          <h2>Privacidad</h2>
          <p>
            Para conocer cómo se utiliza la información relacionada con tu
            visita y qué derechos puedes ejercer, consulta nuestra{" "}
            <Link to="/privacidad">política de privacidad</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AvisoLegal;
