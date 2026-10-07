import { useEffect, useRef, useState } from "react";

export function useFormErrors(error) {
  const [fieldErrors, setFieldErrors] = useState({});
  const formRef = useRef(null);
  useEffect(() => {
    if (!error) return;
    const form = formRef.current;
    (
      form?.querySelector(
        '[aria-invalid="true"]:not([readonly]):not(:disabled)',
      ) || form?.querySelector('[role="alert"]')
    )?.focus();
  }, [error, fieldErrors]);
  const fieldProps = (name) => ({
    "aria-invalid": fieldErrors[name] ? true : undefined,
    "aria-describedby": fieldErrors[name] ? `${name}-error` : undefined,
  });
  return { formRef, fieldErrors, setFieldErrors, fieldProps };
}
