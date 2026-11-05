# Spike de grabación en laptops

**Estado:** pendiente de ejecutar en laptops reales de MHCONSULTANCY.

## Propósito

Comprobar antes de construir la grabadora de producción si `MediaRecorder` con fragmentos de 10 segundos se mantiene activo en las laptops de captura y si la suspensión del sistema produce huecos detectables. El spike registra únicamente metadatos técnicos; no guarda ni transmite audio.

## Preparación

- Abrir `laptop-recording-spike.html` desde `localhost` o HTTPS en cada navegador/OS usado por los analistas.
- Usar audio controlado y consentido; no grabar clientes, entrevistas reales ni datos personales.
- Conectar la laptop a la corriente para la sesión larga.
- Conceder permiso de micrófono y registrar el resultado de `navigator.storage.persist()` y `navigator.storage.estimate()`.

## Pruebas por laptop

1. Grabar durante 60 minutos sin cambiar de pestaña; anotar formato, cantidad/tamaño de fragmentos, intervalo máximo y estado de Wake Lock.
2. Repetir cambiando de pestaña y bloqueando/desbloqueando la pantalla; verificar si la grabación continúa y si los intervalos largos quedan registrados como posibles huecos.
3. En una sesión separada, probar cierre de tapa o suspensión solo si el equipo puede recuperarse de forma segura. Registrar el evento y la pérdida/interrupción observada.
4. Descargar el reporte JSON. No contiene el audio, solo navegador, plataforma, MIME, duración, conteos, tamaño agregado, disponibilidad de persistencia, Wake Lock y eventos.

## Registro de resultados

| Laptop/ID | Sistema y versión | Navegador y versión | MIME | 60 min continuos | Cambio de pestaña/bloqueo | Tapa/suspensión | Persistencia solicitada/concedida | Wake Lock | Bytes/hora | Huecos/resultados |
|---|---|---|---|---|---|---|---|---|---:|---|
| Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

Repetir una fila por laptop. No marcar el spike como aprobado hasta probar todas las combinaciones de laptop/navegador previstas para el piloto. Si una combinación interrumpe la grabación o no detecta los huecos, documentar el equipo/navegador como no soportado o revisar la estrategia antes de implementar la grabadora de producción.
