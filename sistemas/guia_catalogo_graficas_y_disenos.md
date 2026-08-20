# 📘 Guía Maestra: Catálogo Visual de Gráficas, Nodos y Estilos de Telemetría

> **Documento de Referencia Técnica y Comercial para Flujoweb**  
> *Aprende cómo se llama cada gráfica, para qué sirve en la vida real, cuándo usarla, cuándo NO usarla y cómo vender soluciones de observabilidad a empresas corporativas.*

---

## 🎨 1. Estilos Visuales y Look & Feel Corporativos

No todos los clientes empresariales quieren estética Cyberpunk. Las grandes corporaciones (Bancos, Hospitales, Aseguradoras, Retail) buscan diseños más limpios y sobrios.

| Estilo Visual | Paleta & Colores | Empresas que lo usan | ¿Para qué tipo de cliente sirve? |
|---|---|---|---|
| **📊 Datadog Pro Dark** | Fondo `#0e1017`, Púrpura `#7c3aed`, Cian `#06b6d4`, Verde `#10b981` | Datadog, Dynatrace, New Relic | **Fintech, Bancos y Startups SaaS:** Muy respetado, transmite ingeniería seria y analítica moderna. |
| **📈 Grafana SRE Dark** | Fondo `#111217`, Naranja `#ff9900`, Azul `#5794f2`, Verde `#73bf69` | Grafana Labs, RedHat, Kubernetes | **Equipos DevOps, SysAdmins e Infraestructura:** Cuadrículas modulares enfocadas en métricas de servidores. |
| **🔍 ELK / Kibana SIEM** | Fondo `#10121a`, Verde azulado `#00bfb3`, Rojo `#e74c3c` | Elastic, Splunk, CrowdStrike | **Ciberseguridad, Auditoría y Cumplimiento Legal:** Análisis de millones de logs y detección de ataques. |
| **✨ Linear / Stripe Minimal** | Fondo `#090d16`, Gris pizarra, Tipografía ultra-limpia, Blanco de alto contraste | Stripe, Linear, Apple Developer | **Directores Ejecutivos (C-Level) y Startups de Silicon Valley:** Cero ruido visual, máxima elegancia y legibilidad. |
| **💎 Apple Glassmorphism** | Fondo `#0a0f1d`, Cristales translúcidos con `backdrop-filter: blur`, bordes finos | macOS, iOS Health, interfaces táctiles | **Presentaciones de Alto Nivel, Tablets y Apps Móviles:** Sensación premium y táctil. |
| **⚡ Cyberpunk Neon Tactical** | Fondo `#030812`, Verde neón `#00ff88`, Rejilla hexagonal, Acentos estroboscópicos | Mando militar, Simulación de fuego, TV Streaming | **Simuladores de Emergencia, Gaming y Centros de Operaciones Tácticas (NOC/SOC).** |

---

## 📊 2. Catálogo de Gráficas: Nombres y Casos de Uso

### 1. Gauge Circular SVG (Velocímetro 0–100%)
* **¿Qué es?** Un círculo animado que se llena porcentualmente con un número central.
* **¿Para qué sirve?** Presupuestos de Error (SLO 99.98%), Calificación de Seguridad (A+, 94/100) y Saturación de Base de Datos.
* **✅ Cuándo usar:** Para el **KPI #1 más importante** de toda la pantalla.
* **❌ Cuándo NO usar:** Cuando tienes 20 métricas distintas; usar demasiados círculos marea al usuario.

### 2. Barra de Uptime Segmentada (90 Días)
* **¿Qué es?** Una hilera de pequeñas barritas verticales (una por día) que se pintan verde, amarillo o rojo.
* **¿Para qué sirve?** Mostrar la disponibilidad histórica de APIs y servicios (como en *GitHub Status* o *Datadog Status*).
* **✅ Cuándo usar:** Para demostrarle a un cliente que tus servicios no se caen.
* **❌ Cuándo NO usar:** Para métricas en tiempo real de milisegundos.

### 3. Cascada de Trazas Distribuidas (APM Waterfall / Flamegraph)
* **¿Qué es?** Bloques horizontales apilados que muestran cuánto tiempo tardó cada microservicio o consulta SQL en responder.
* **¿Para qué sirve?** Identificar el cuello de botella exacto en una llamada a API compleja (ej: si MuleSoft tardó 40ms o si la base de datos tardó 400ms).
* **✅ Cuándo usar:** Para monitoreo de APIs de MuleSoft, microservicios y pagos bancarios.
* **❌ Cuándo NO usar:** Para monitoreo simple de memoria o CPU.

### 4. Onda Continua a 60 FPS (ECG / Osciloscopio Canvas)
* **¿Qué es?** Una línea continua que se dibuja en tiempo real con pulsos oscilantes (P-Q-R-S-T en medicina o senoidales en red).
* **¿Para qué sirve?** Signos vitales en hospitales (UCI), streaming de audio/video y frecuencia de paquetes de red.
* **✅ Cuándo usar:** Cuando necesitas dar la sensación de que el sistema está **vivo y transmitiendo activamente**.
* **❌ Cuándo NO usar:** Para datos estáticos o reportes mensuales.

### 5. Histograma de Percentiles de Latencia (p50 / p95 / p99)
* **¿Qué es?** Un gráfico de barras verticales agrupadas por rangos de tiempo (ej: peticiones de <20ms, 20-50ms, >200ms).
* **¿Para qué sirve?** En Fintech y APIs de alta velocidad, el promedio engaña; el **p99** te dice qué le pasó al 1% de los usuarios más lentos.
* **✅ Cuándo usar:** En SLAs bancarios y pasarelas de pago de alta frecuencia.
* **❌ Cuándo NO usar:** Si tu sistema solo recibe 1 petición por minuto.

### 6. Mapa de Calor Matricial (Heatmap)
* **¿Qué es?** Una cuadrícula de celdas donde el color varía de verde a amarillo/rojo según la densidad.
* **¿Para qué sirve?** Pisos de edificios con presencia de humo, servidores con alta concurrencia o errores por hora.
* **✅ Cuándo usar:** Para encontrar anomalías espaciales o temporales rápidamente.
* **❌ Cuándo NO usar:** Si solo tienes 2 o 3 datos simples.

---

## 🔮 3. Nodos, Esferas y Pulsos

* **Esfera Glassmorphism:** Círculo con resplandor interno y filtro de desenfoque. *(Uso: Servidores centrales, Nodos de balanceo)*.
* **Anillo Orbital Giratorio (Orbital Spinner):** Anillo que rota en 360° con una estela de luz. *(Uso: Handshake SSL en progreso, procesamiento JWT)*.
* **Píldora de Estado Viva (Live Status Pill):** Caja redondeada con un punto verde que parpadea y la latencia en ms. *(Uso: Encabezado superior de sistemas)*.
* **Nodo de Alarma Crítica (Strobe Alarm):** Círculo rojo de alta frecuencia con destellos. *(Uso: Evacuación de incendios, código azul médico, hackeos)*.

---

## ⚡ 4. Líneas y Pistas de Conexión

* **Pista con Cometa de Energía (Energy Comet Track):** Línea con una cabeza de luz que viaja a velocidad constante simulando paquetes de datos. *(Uso: Flujos de transacciones monetarias o colas Pub/Sub)*.
* **Pista Desvanecida (Ambient Fading Track):** Línea tenue al 10-15% de opacidad que une nodos sin saturar la pantalla. *(Uso: Diseños corporativos limpios y elegantes)*.

---

## 💡 Cómo pedir cualquier diseño en tus proyectos

Cuando quieras que construyamos algo nuevo, puedes combinar estos elementos diciendo:

> *"Quiero un sistema estilo **Datadog Pro** con una **Cascada de Trazas APM**, una **Píldora de Estado Viva** y **Pistas Desvanecidas** para monitorear mis APIs de MuleSoft."*
> 
> *"Quiero una pantalla estilo **Linear Minimal** con un **Gauge Circular SVG**, una **Barra de Uptime de 90 Días** y un **Histograma p99**."*
