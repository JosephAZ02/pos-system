import Swal from "sweetalert2";

// muestra el error que manda el backend (texto plano) o un mensaje de respaldo
export function showError(err: any, fallback: string) {
  let message = fallback;

  if (err.response?.status === 403) {
    message = "No se pudo realizar la acción solicitada";
  } else if (typeof err.response?.data === "string" && err.response.data !== "") {
    message = err.response.data;
  }

  Swal.fire({
    icon: "error",
    title: "No se pudo completar",
    text: message,
    confirmButtonText: "Aceptar",
  });
}

export function showSuccess(title: string, text: string) {
  Swal.fire({
    icon: "success",
    title: title,
    text: text,
    confirmButtonText: "Aceptar",
  });
}

export function showWarning(title: string, text: string) {
  Swal.fire({
    icon: "warning",
    title: title,
    text: text,
    confirmButtonText: "Aceptar",
  });
}

// pregunta al usuario si desea continuar; devuelve true si presiona el botón de confirmar
export async function showConfirm(title: string, html: string, confirmText: string): Promise<boolean> {
  const result = await Swal.fire({
    icon: "question",
    title: title,
    html: html,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
  });

  return result.isConfirmed;
}