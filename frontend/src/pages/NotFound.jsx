import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="container py-5 text-center">
      <h1>404</h1>
      <p>La página que buscas no existe.</p>
      <Link className="btn btn-outline-light" to="/">Volver al inicio</Link>
    </section>
  );
}

export default NotFound;
