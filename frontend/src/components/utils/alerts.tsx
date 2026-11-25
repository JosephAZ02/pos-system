import Swal from "sweetalert2";

// muestra el error que manda el backend (texto plano) o un mensaje de respaldo
export const showError = (error: any, defaultMessage: string = 'Ocurrió un error') => {
  // 1. Intentamos sacar el mensaje del backend
  let message = error?.response?.data?.message;

  // Si el backend mandó un objeto con statusCode y message (típico de NestJS)
  if (!message && error?.response?.data?.error) {
    message = error.response.data.error;
  }

  // 2. Si el backend mandó un arreglo (por el ValidationPipe)
  if (Array.isArray(message)) {
    message = message.join('\n');
  }

  // 3. Si después de todo no hay mensaje, usamos el quemado
  if (!message) {
    message = defaultMessage;
  }

  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
  });
};

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