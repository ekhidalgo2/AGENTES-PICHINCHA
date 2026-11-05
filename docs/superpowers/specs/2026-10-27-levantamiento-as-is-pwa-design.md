# Diseño: levantamiento AS-IS y borrador A3 (versión 1, opción B con captura offline en laptops)

Fecha: 2026-10-27
Estado: aprobado por la dueña del producto para iniciar la v1. Reemplaza las versiones anteriores del mismo día. Incorpora la línea base, el flujo real del equipo, la captura offline en laptops y el uso del teléfono solo como grabadora externa.
Organización: MHCONSULTANCY

## Contexto de esta versión

MHCONSULTANCY no dispone de departamento de TI, Seguridad ni Legal internos. El alcance se ajusta a lo que un equipo pequeño puede operar con servicios administrados y apoyo externo puntual.

Decisiones de la dueña del producto que definen esta versión.

- **Captura offline dentro de la PWA solo en laptops de la empresa**, con notas estructuradas y grabación de audio cifrada por fragmentos.
- **El teléfono no graba dentro de la aplicación en la v1.** Puede usarse como grabadora externa con su aplicación nativa; el analista sube el archivo a la aplicación.
- **La transcripción se hace en un único computador de MHCONSULTANCY designado para ello**, suficiente para el equipo de 3 analistas del MVP.

Sin MDM, parte de la seguridad descansa en una política escrita de equipos que la aplicación no puede verificar técnicamente. El diseño lo declara así.

La estrategia es en dos etapas, piloto interno medido contra la línea base, y comercialización una vez probada.

## Intención

Crear una aplicación para que los analistas levanten procesos AS-IS y preparen un primer borrador del A3 a partir de entrevistas, notas, documentos y grabaciones, conservando la evidencia que respalda cada dato. Debe servir a analistas que diagraman en Bizagi y a especialistas de dominio que no diagraman, y permitir trabajar en sitio del cliente sin depender de la conexión. El objetivo es reducir rondas de corrección con el cliente, horas de validación interna y dependencia de los analistas diagramadores, sin sustituir la validación del analista ni la aprobación del dueño del proceso.

## Línea visual

- Nombre del producto: **Mapio by MHCONSULTANCY**. Mapio es la marca de la aplicación y MHCONSULTANCY el endoso corporativo.
- Seguir el moodboard MHCONSULTANCY: rojo corporativo (muestra llamada “Naranja”, CMYK 0/100/100/0), café (C7/M91/Y100/K46), gris medio (K50), negro y fondos claros blanco/marfil.
- Usar Futura para títulos, destacados y elementos gráficos; Myriad Pro Bold para el nombre de marca y textos principales. Cargar solo archivos de fuente con licencia válida; si no están disponibles, usar alternativas tipográficas aprobadas sin bloquear la lectura.
- Usar `Mapio by MHCONSULTANCY.jpeg` como logo del producto en la parte superior izquierda y `Logo MH.jpeg` como logo corporativo en la parte inferior derecha, ambos sobre superficies claras y conservando su fondo blanco; no recortarlos ni invertirlos.
- Usar `Sistema iconográfico aplicativo final.jpeg` como fuente normativa de iconografía: navegación principal, acciones secundarias, documentos, entrevistas, diagramas, A3, revisión, variantes de contorno/color/monocromo y tamaños 16/24/32/48 px. La interfaz utiliza esos iconos o SVGs fieles a ellos; no sustituirlos por una familia genérica. Fuentes: Expedientes, Documentos, Entrevistas, Guías, Diagramas, A3, Indicadores, Configuración y Revisión usan los iconos correspondientes de la lámina.
- Usar fotografías de hojas naturales del moodboard junto con la hoja segmentada de marca como acentos en portada, cabeceras y estados vacíos. No colocar fotografías, texturas ni filigranas detrás de tablas, transcripciones, formularios densos o el lienzo BPMN.
- La aplicación es una herramienta de trabajo: jerarquía clara, espacios limpios y superficies claras para lectura; rojo para acciones/estados importantes, café como acento secundario y grises/negro para estructura y texto. Mantener contraste accesible y no convertir cada pantalla en una pieza promocional.

## Cómo trabaja hoy el equipo

- Un solo analista por proceso, asignado por experiencia de dominio. A un mismo cliente no van más de dos analistas.
- La preparación es administrativa; la documentación se revisa a alto nivel el mismo día de la sesión, y puede no existir.
- **Perfil A (diagramador).** Entrevista y diagrama en vivo en Bizagi.
- **Perfil B (especialista que no diagrama).** Entrevista y toma notas; un analista operativo diagrama después, sin haber estado en la sesión. Los procesos contables se parten en 5 a 8 subprocesos.
- Validación interna posterior y hasta dos rondas de corrección con el cliente, cada una con hasta 3 días de espera acotada por contrato.
- El llenado del A3 se está introduciendo recién.

## Usuarios

- **Analista perfil A**, importa su `.bpmn` de Bizagi para verificarlo y vincularlo a la evidencia.
- **Analista perfil B**, la aplicación genera el borrador del diagrama desde notas, documentos y transcripciones; lo valida con una vista en lenguaje simple.
- **Revisor de diagramas**, analista perfil A que revisa los diagramas generados antes de llevarlos al cliente, obligatorio en el piloto.
- **Administrador de la organización**, gestiona usuarios, plantillas, guías, proveedores, políticas y registro de equipos.
- **Entrevistado y dueño del proceso**, sin cuenta. La aprobación del dueño se adjunta ligada a la revisión exportada.

## Alcance de la versión 1

1. Expedientes por proceso, con jerarquía proceso, subprocesos y actividades.
2. **PWA instalable con captura offline en laptops de la empresa**, notas estructuradas y grabación de audio cifrada y persistida por fragmentos.
3. **Carga de grabaciones externas**, archivos de audio grabados con el teléfono u otra grabadora, subidos con conexión desde cualquier equipo, con declaración del origen de la grabación.
4. Carga previa de documentación para preparar un borrador inicial y una guía ajustada a sus vacíos (requiere conexión y compuerta de IA).
5. Guías de entrevista por dominio, disponibles offline en la laptop.
6. Bloque de cierre de sesión de 15 a 20 minutos con verificación estructural determinística, ejecutada en la laptop sin conexión y sin IA, sobre el `.bpmn` importado (perfil A) o las notas estructuradas (perfil B).
7. Sincronización al servicio central y al almacenamiento de la empresa al recuperar conexión.
8. Carga con conexión de documentos, transcripciones existentes y videos existentes.
9. **Transcripción local en computadores de MHCONSULTANCY**, sin enviar audio a terceros.
10. Análisis con IA sobre texto, con citas verificadas.
11. Diagrama en dos modos, importación desde Bizagi y generación desde las fuentes; editor, vista en lenguaje simple y verificación de interfaces entre subprocesos.
12. Exportación BPMN 2.0 importable en Bizagi Modeler 4.0.0.65.
13. A3 por proceso completo y copia del libro Excel sin dañar la plantilla.
14. Taxonomía de cada proceso para análisis futuros por industria.

## Fuera de alcance de la versión 1

- Grabación dentro de la aplicación en teléfonos. El teléfono solo se usa como grabadora externa.
- Grabación de video dentro de la aplicación; los videos existentes se cargan con conexión.
- Transcripción en tiempo real y transcripción en teléfonos.
- IA o sincronización sin conexión.
- Cuentas para dueños de proceso o personal de clientes.
- Edición simultánea del borrador.
- Verificación técnica del estado de seguridad del equipo (MDM).
- Análisis comparativo entre clientes; la v1 solo captura taxonomía y autorización.
- Alta de organizaciones por autoservicio, facturación, despliegue en el entorno del cliente.
- Automatizar las 34 hojas del toolkit.

## Datos permitidos en el piloto

| Origen | Uso permitido | Condición |
|---|---|---|
| `internal` | Procesos internos de MHCONSULTANCY | Consentimiento de entrevistados |
| `simulated` | Entrevistas de rol o guiones | Marcado para no confundirlo con evidencia real |
| `client_authorized` | Levantamiento real en un cliente | Autorización escrita del cliente para grabación, transcripción, IA **y uso de teléfonos personales como grabadora si aplica**; revisión legal externa; proveedores aprobados |

Si la autorización del cliente no permite teléfonos personales, la aplicación rechaza la carga de grabaciones declaradas con ese origen en ese expediente.

## Equipos y política mínima

Sin MDM, la aplicación no puede comprobar el estado de seguridad de un equipo. La política se aplica por declaración firmada y registro, y así se informa al cliente.

- **Laptops de captura.** Cada laptop de la empresa que graba dentro de la PWA se registra en la aplicación, ligada a un analista. Antes de su primer uso, el analista declara bloqueo de pantalla, cifrado de disco del sistema operativo activo, sistema actualizado y equipo no compartido. La declaración se registra con fecha y versión y se renueva cada 6 meses. Sin declaración vigente, la PWA no permite grabar.
- **Teléfonos personales como grabadora.** No se registran en la aplicación. El analista firma un acuerdo de uso de equipo propio que exige bloqueo de pantalla, no respaldar las grabaciones en nubes personales, subirlas apenas tenga conexión y **borrarlas del teléfono cuando la aplicación confirme la carga con MD5**. Mientras la grabación está en el teléfono queda fuera del control y del cifrado de la aplicación; es un control de procedimiento y se declara así.
- **Computador de transcripción.** Un único computador de MHCONSULTANCY, registrado en la aplicación con la finalidad de transcripción, con la versión aprobada de Buzz. Como concentra audios de todos los clientes, cumple controles más estrictos que una laptop de captura: cuenta de usuario dedicada sin uso personal, cifrado de disco, bloqueo de pantalla, sin sincronización con nubes personales, y borrado de cada copia descargada al cargar el VTT. Es el único equipo habilitado para descargar grabaciones con fines de transcripción.
- **Contingencia.** Si el computador de transcripción falla, el procedimiento documentado de instalación de Buzz permite habilitar temporalmente una laptop de captura registrada, con autorización del administrador y registro en auditoría.
- Ante pérdida de una laptop o de un teléfono con grabaciones sin subir, el administrador revoca sesiones y registros, se documenta el incidente y se evalúa con el cliente si hubo datos expuestos. Una PWA no puede borrar remotamente datos locales; el cifrado de la aplicación limita la exposición solo en las laptops.

## Grabación offline en laptops

- La grabación usa `MediaRecorder` con fragmentos de 10 segundos, cada uno cifrado y guardado de inmediato en IndexedDB con índice, marcas de tiempo y estado de sesión. Al iniciar, la aplicación detecta sesiones interrumpidas y permite recuperarlas o descartarlas explícitamente.
- El formato se detecta con `isTypeSupported()` y se guarda por sesión.
- Se solicita `Screen Wake Lock` durante la grabación para evitar que el equipo suspenda la pantalla, y se registra como hueco cualquier interrupción detectada (suspensión, cierre de tapa, error de grabación) con su horario. Se recomienda grabar con la laptop conectada a la corriente.
- El bloqueo por inactividad se suspende mientras hay grabación activa; el bloqueo explícito detiene la grabación de forma segura antes de limpiar la clave.
- Se solicita `navigator.storage.persist()` y se informa el resultado y el espacio disponible.

## Grabaciones externas

- Se suben con conexión desde la aplicación, en el teléfono mediante el navegador o desde la laptop, con carga reanudable y verificación MD5.
- Formatos aceptados según la evaluación previa, como mínimo los que generan las grabadoras nativas de iPhone y Android (por ejemplo M4A) además de MP3, WAV y Opus; tamaño máximo configurable.
- Al subir, el analista declara el origen (`phone_external` u `other_external`), la entrevista y los participantes, y confirma que existe consentimiento de grabación de todos ellos.
- Tras la confirmación de la carga, la aplicación recuerda borrar el archivo del teléfono.

## Cifrado local

- En la laptop, notas, metadatos personales, recibos de consentimiento y fragmentos de audio se cifran con AES-GCM mediante Web Crypto.
- Clave aleatoria por usuario y equipo, envuelta con PBKDF2-HMAC-SHA256 de 600.000 iteraciones y una frase local de al menos 14 caracteres, independiente de la contraseña corporativa. La frase no se envía ni se guarda.
- Tras cinco intentos fallidos, demora exponencial hasta 30 minutos.
- Perder la frase implica perder lo no sincronizado; la aplicación lo advierte.
- El cifrado protege en reposo, no un equipo desbloqueado o comprometido. CSP restrictiva y contenido renderizado como texto.

## Actualizaciones de la PWA

- El esquema de IndexedDB se versiona y migra sin perder datos pendientes.
- Una nueva versión no se activa mientras haya grabación activa o datos sin sincronizar; se muestra aviso, se permite posponer y se aplica tras confirmación y migración exitosa.

## Sincronización

- Ocurre con la aplicación abierta y conexión, sin depender de sincronización en segundo plano. Si la sesión del servidor vence, pausa y continúa tras reautenticación, sin perder ni descifrar datos.
- El audio se descifra por fragmentos mientras el perfil está desbloqueado, se ensambla en un archivo y se carga directo al almacenamiento con sesión reanudable y MD5 incremental.
- La copia local se borra solo tras confirmar PostgreSQL, finalización de la carga y coincidencia del MD5.
- Los recibos de consentimiento capturados offline guardan hora del equipo y hora de recepción en el servidor; la del servidor es la de referencia.
- Las notas estructuradas de una entrevista las edita solo el analista asignado; si el servidor tiene una versión más reciente, la sincronización no sobrescribe y muestra el conflicto.

## Transcripción

La transcripción es local, para que el audio no salga de los equipos de MHCONSULTANCY y no exista un proveedor adicional que evaluar.

- **V1, Buzz en el computador de transcripción designado.** Aplicación de escritorio gratuita que ejecuta Whisper localmente, con identificación de hablantes y exportación a VTT. Desde ese computador se descarga la grabación, se transcribe en Buzz, se carga el VTT y se borra la copia descargada. Las grabaciones pendientes se atienden en orden de llegada, con prioridad para las que bloquean un cierre de sesión con el cliente. El instalador de Windows no está firmado; se descarga solo de la fuente oficial y se registra la versión aprobada.
- Aplica igual a grabaciones hechas en la PWA y a grabaciones externas subidas desde el teléfono.
- **Capacidad.** Un solo computador atiende a los 3 analistas. Un proceso complejo puede generar de 16 a 24 horas de audio, así que la evaluación debe medir cuántas horas de audio transcribe ese equipo por hora de trabajo y confirmar que una semana con dos procesos complejos no genere una cola que retrase la validación interna. Si no alcanza, se ajusta el modelo de Whisper o se habilita la contingencia.
- **Prueba en paralelo, transcripción dentro de la PWA en laptops** con Whisper vía Transformers.js y WebGPU, totalmente local. Se integra en una versión posterior solo si la prueba con grabaciones simuladas muestra calidad y tiempos aceptables.
- **Evaluación obligatoria antes del piloto**, con grabaciones simuladas en español ecuatoriano, varios hablantes y vocabulario contable y operativo, registrando calidad, separación de hablantes y tiempo por hora de audio. Incluir grabaciones hechas con teléfono en una sala de reunión, que son las de peor calidad esperada. Para el perfil B la transcripción es la fuente principal del diagrama.
- El consentimiento para transcripción se registra aparte aunque el procesamiento sea local.
- Los huecos de grabación se marcan en la transcripción para que la IA y el analista no los interpreten como silencio del proceso.

## Línea base estimada

Fuente, estimación de memoria del equipo, promedio de 6 empresas, jornada de 8 horas. Antes del piloto se cronometran al menos un levantamiento del perfil A y un proceso contable del perfil B; si difieren de forma relevante, prevalece la medición cronometrada.

### Clasificación de complejidad

Manda el criterio más alto.

| Nivel | Actividades | Roles | Áreas |
|---|---|---|---|
| Sencillo | hasta 20 | 1 a 3 | 1 |
| Medio | 21 a 30 | 4 a 6 | 2 a 3 |
| Complejo | más de 30, o con subprocesos | 7 o más | 4 o más |

La unidad de medida es el proceso completo; el número de subprocesos se registra como variable adicional.

### Perfil A, esfuerzo del analista por proceso

| Etapa | Sencillo | Medio | Complejo |
|---|---|---|---|
| Preparación | administrativa, fuera de la comparación | | |
| Sesión con diagramación en vivo | 2 a 4 h | 8 h | 16 a 24 h |
| Validación interna | 8 h | 16 h | 40 a 56 h |
| Correcciones, hasta 2 rondas de hasta 4 h | hasta 8 h | hasta 8 h | hasta 8 h |
| **Total** | **18 a 20 h** | **32 h** | **64 a 88 h** |
| Espera del cliente por ronda | hasta 3 días | hasta 3 días | hasta 3 días |

### Perfil B, proceso contable

| Etapa | Estimado |
|---|---|
| Sesión, validación y correcciones (como complejo) | 64 a 88 h |
| Subprocesos | 5 a 8 |
| Diagramación por subproceso | 8 a 16 h |
| Diagramación total | 40 a 128 h |
| **Total** | **104 a 216 h** |

### A3

Sin línea base; se evalúa como entregable nuevo. Las hojas 2.5 y 2.6 saldrán mayormente pendientes salvo datos medidos.

## Hipótesis y métricas del piloto

| Hipótesis | Métrica | Comparación |
|---|---|---|
| H1, calidad. Entrevista guiada y cierre de sesión reducen las rondas a una | Rondas por proceso y días calendario hasta el entregable | Hasta 2 rondas y hasta 3 días de espera por ronda |
| H2, eficiencia. Verificación estructural y cruce con documentación reducen la validación interna | Horas de validación interna | Tabla del perfil A, mismo nivel |
| H3, capacidad. La generación del diagrama reduce la diagramación del perfil B | Horas de diagramación más revisión por perfil A | 8 a 16 h por subproceso |
| H4, entregable nuevo. El A3 sale completo y trazable | Campos completados, aceptados y pendientes | Sin línea base |

Se registra además analista, perfil, complejidad, subprocesos, origen de la grabación (PWA en laptop o externa), huecos de grabación, horas de transcripción, citas rechazadas o corregidas y resultado de exportaciones. Se compara al mismo analista con y sin herramienta cuando sea posible.

## Flujo

1. El analista crea el expediente con origen de datos, complejidad, taxonomía y autorización del cliente si corresponde.
2. Con conexión, carga la documentación previa y, si la compuerta lo permite, recibe un borrador inicial y una guía ajustada. Descarga el expediente a su laptop para trabajo offline.
3. En sitio, registra participantes y consentimientos en la laptop, toma notas estructuradas y graba audio en la PWA, o graba con el teléfono como grabadora externa.
4. Cierre de sesión, la laptop ejecuta la verificación estructural sin conexión y muestra las preguntas pendientes con los actores presentes.
5. Con conexión, la laptop sincroniza notas, consentimientos y grabaciones; las grabaciones del teléfono se suben con declaración de origen y luego se borran del teléfono.
6. En el computador de transcripción designado se transcribe con Buzz y se carga el VTT; se cargan documentos y videos adicionales.
7. Si la compuerta lo permite, la IA cruza o genera el diagrama con citas verificadas.
8. El analista revisa, el perfil B valida con la vista en lenguaje simple, y el revisor perfil A acepta los diagramas generados.
9. Se exporta la revisión N; la aprobación del dueño se adjunta ligada a N y vence al editar.
10. Se exportan BPMN y Excel.

## Trazabilidad, verificación estructural, diagrama, Excel y taxonomía

- Citas de IA resueltas contra evidencia del mismo expediente y texto normalizado; esquema estricto; fuentes tratadas como datos.
- Métricas nunca inventadas; contradicciones señaladas, no resueltas.
- Verificación estructural sin IA, incluidas interfaces entre subprocesos, ejecutable offline en el navegador de la laptop. Revisa actividades sin rol, entrada o salida; compuertas sin condición o con una sola salida; carriles vacíos; roles documentados ausentes del flujo; caminos sin fin; actividades inalcanzables; salidas de un subproceso que nadie consume y entradas sin origen; roles que desaparecen entre subprocesos sin traspaso.
- Modelo de diagrama independiente de Bizagi, importación con informe de elementos no soportados, generación con carriles y subprocesos, vista en lenguaje simple, compatibilidad declarada solo tras prueba de ida y vuelta.
- Excel por edición del XML, `inlineStr`, sin escribir sobre celdas que ya tienen fórmula, `HYPERLINK()` en la primera fila de datos de 2.3 (`E14`; `E13` es el ejemplo de la plantilla), hoja visible `Propuestas pendientes` con revisión y estado de aprobación, recálculo al abrir, plantillas registradas con SHA-256 `0f662d7d7e1adc5dcafc5b9fa226c715f04afcff6feb1451225c32033a765d95` e inventario de 34 hojas, 91 partes, 1 gráfico, 27 formatos condicionales, 60 validaciones, 6 extensiones y `xl/calcChain.xml`.
- Taxonomía APQC PCF, industria, tamaño, complejidad y subprocesos; análisis comparativo solo con autorización contractual opcional y datos agregados y anonimizados.

## Arquitectura

- PWA con React y TypeScript, service worker para la interfaz, IndexedDB cifrado como cola local en laptops.
- API en Node.js con Fastify; PostgreSQL administrado con respaldos y recuperación a un punto en el tiempo.
- `organizationId` en toda tabla de negocio.
- Almacenamiento intercambiable, Google Drive en Unidad Compartida mediante cuenta de servicio, o bucket privado de Google Cloud Storage.
- Adaptador de análisis IA (Anthropic, solo texto) y transcripción por importación de VTT; motor local en el navegador como prueba.
- Verificación estructural e importación BPMN en un módulo compartido que corre en el navegador sin conexión y en el servidor.
- Dos ambientes, desarrollo y producción.

## Acceso

- Inicio de sesión con Google Workspace restringido al dominio de MHCONSULTANCY; la sesión offline en la laptop usa la frase local, y la sincronización exige sesión del servidor vigente.
- Roles de organización, de proyecto y marca de revisor de diagramas.
- Cookie segura, CSRF y límite de intentos.
- Un solo analista edita el borrador a la vez; la edición del borrador requiere conexión.
- Auditoría en tabla de solo inserción con hash encadenado.

## Privacidad

- Con origen `internal`, MHCONSULTANCY es responsable; con `client_authorized`, probablemente encargada, a confirmar por el abogado externo.
- Consentimiento por participante y finalidad, grabación, transcripción y procesamiento con IA.
- La transcripción local evita un subencargado de transcripción. Subencargados declarados, hosting, base de datos, almacenamiento e IA.
- El uso de teléfonos personales como grabadora con datos de clientes se informa al cliente y requiere su autorización.
- Retención configurable; sin plazos aprobados no se admite `client_authorized`.
- Borrado de grabaciones en teléfonos y de copias descargadas para transcribir, como controles de procedimiento.
- Logs sin contenido de entrevistas ni secretos.

## Operación sin departamento de TI

| Función | Responsable en la v1 |
|---|---|
| Dueña del producto y decisión final | Dueña de MHCONSULTANCY |
| Desarrollo y mantenimiento | Desarrollador externo con cesión del código |
| Revisión de privacidad y contratos | Abogado externo, antes del primer uso con cliente |
| Administración de Workspace, accesos, registro de laptops, declaraciones y acuerdos de uso de teléfono | Dueña de MHCONSULTANCY |
| Revisión de diagramas generados en el piloto | Analistas perfil A designados |
| Versión aprobada de Buzz, instalación y controles del computador de transcripción | Desarrollador externo, documentado |
| Operación diaria del computador de transcripción y su cola | Analista designado por la dueña del producto |
| Autorización del uso de datos y teléfonos | El cliente, por contrato |
| Simulacro trimestral de restauración | Desarrollador externo |

## Decisiones que preparan la comercialización

`organizationId`, almacenamiento y proveedores intercambiables, plantillas y guías como datos, taxonomía desde el inicio, cesión de propiedad intelectual y métricas de uso. La grabación dentro de la aplicación en teléfonos queda como evolución posible, condicionada a una prueba en dispositivos reales.

## Criterios de aceptación

1. En una laptop sin conexión, una sesión conserva notas, consentimientos y una grabación tras recargar o reabrir la PWA; al reconectar se sincroniza sin duplicados y con MD5.
2. Una grabación interrumpida en la laptop se recupera desde los fragmentos persistidos, y cada interrupción detectada queda registrada como hueco con su horario.
3. Los datos locales están cifrados por usuario y no se leen sin desbloqueo; la inactividad no interrumpe una grabación activa.
4. Una actualización de la PWA no se activa con grabación activa o datos sin sincronizar.
5. Una grabación hecha con el teléfono se sube desde el navegador del teléfono o desde la laptop, con declaración de origen, carga reanudable y MD5; se rechaza si el cliente no autorizó teléfonos personales.
6. La verificación estructural del cierre de sesión funciona sin conexión sobre un `.bpmn` de Bizagi y sobre notas estructuradas.
7. Un VTT de Buzz se importa con hablantes, marcas de tiempo y huecos, y queda como evidencia derivada de la grabación.
8. Para el perfil B se genera un diagrama con subprocesos y citas verificadas, revisado por un perfil A antes de exportarse al cliente.
9. El BPMN importa en Bizagi Modeler 4.0.0.65 y el Excel cumple la regla de exportación sin dañar la plantilla.
10. Una aprobación adjunta vence al editar el borrador.
11. Ningún usuario accede a proyectos ajenos ni a otra organización.
12. Ningún contenido se envía a IA sin proveedor aprobado, límites, origen permitido y consentimiento vigente.
13. Un respaldo se restaura en ambiente aislado.

## Pendientes antes del piloto

- Probar grabación de 60 minutos en la PWA en las laptops del equipo (suspensión, cierre de tapa, batería, Wake Lock).
- Evaluar Buzz en el computador de transcripción con grabaciones simuladas, incluidas grabaciones de teléfono, aprobar una versión y un modelo, y medir horas de audio transcritas por hora para validar la capacidad con 3 analistas.
- Confirmar los formatos que generan los teléfonos del equipo y aceptarlos en la carga.
- Prueba de transcripción en el navegador en las laptops.
- Cronometrar un levantamiento perfil A y un proceso contable perfil B.
- Confirmar Unidades Compartidas o usar GCS; probar carga reanudable con CORS.
- Redactar guías de dominio, designar revisores, registrar laptops, firmar declaraciones y acuerdos de uso de teléfono.
- Contratar desarrollador con cesión de código.

## Pendientes antes del primer uso con cliente

- Revisión legal externa, incluida la cláusula de uso de teléfonos personales como grabadora y la cláusula opcional de análisis comparativo.
- Revisión de términos del proveedor de IA.
- Modelo de autorización escrita del cliente.
