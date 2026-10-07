export default function FieldError({ id, error }) {
  const message = [error].flat().filter(Boolean).join(" ");
  return message ? (
    <p id={id} className="errorMessage">
      {message}
    </p>
  ) : null;
}
