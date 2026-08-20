# 💎 Vivy Core 10-Year Engineering Specification & Singularity Blueprint

> **Manual de Especificaciones Técnicas, Arquitectura de Memoria Unificada, Mecatrónica y Plan de Estudio Decenal**  
> **Clasificación**: Nivel Aeroespacial / Robótica Humanoide Avanzada  
> **Versión**: 2.0.0-ENTERPRISE-SINGULARITY  
> **Objetivo**: Diseñar y construir un androide físico autónomo con apariencia, voz, gracia motriz, memoria continua y capacidad de auto-mejora recursiva inspirado en *Vivy: Fluorite Eye's Song*.

---

## 📑 Tabla de Contenidos

1. [Arquitectura de Cómputo, Memoria Unificada & Almacenamiento](#1-arquitectura-de-cómputo-memoria-unificada--almacenamiento)
2. [Matriz de Actuadores, Cinemática & 54 Grados de Libertad (DOF)](#2-matriz-de-actuadores-cinemática--54-grados-de-libertad-dof)
3. [Pipeline de Voz Neuronal, Canto & Presupuesto de Latencia (< 85ms)](#3-pipeline-de-voz-neuronal-canto--presupuesto-de-latencia--85ms)
4. [Visión Espacial 3D, Percepción & VSLAM](#4-visión-espacial-3d-percepción--vslam)
5. [Locomoción Bípeda, Dinámica de Marcha & Control ZMP/MPC](#5-locomoción-bípeda-dinámica-de-marcha--control-zmpmpc)
6. [El Bucle de Singularidad Recursiva & Auto-Compilación](#6-el-bucle-de-singularidad-recursiva--auto-compilación)
7. [Lista Exhaustiva de Materiales (BOM) & Presupuestos](#7-lista-exhaustiva-de-materiales-bom--presupuestos)
8. [Curriculum de Estudio & Ruta de Aprendizaje Mes a Mes (Años 0 a 10)](#8-curriculum-de-estudio--ruta-de-aprendizaje-mes-a-mes-años-0-a-10)

---

## 1. Arquitectura de Cómputo, Memoria Unificada & Almacenamiento

Para que un androide físico sea verdaderamente autónomo (sin depender de WiFi ni cables), el cómputo debe residir a bordo de su chasis, manteniendo un balance estricto entre **peso, disipación térmica (TDP) y potencia de cálculo (TOPS)**.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      NVIDIA JETSON AGX ORIN INDUSTRIAL (64GB)                    │
│   • 275 TOPS INT8 / 138 TFLOPS FP16      • 64GB LPDDR5 256-bit (204.8 GB/s)      │
│   • 12-Core Cortex-A78AE CPU @ 2.2 GHz   • Linux Ubuntu 22.04 LTS (PREEMPT_RT)   │
└───────────────────────┬──────────────────────────────────┬───────────────────────┘
                        │                                  │
                        ▼                                  ▼
      ┌───────────────────────────────────┐  ┌───────────────────────────────────┐
      │     BUS DE CONTROL (1000 Hz)      │  │    MEMORIA & ALMACENAMIENTO       │
      │ • EtherCAT Master (100 Mbps)      │  │ • 16TB NVMe PCIe 4.0 (7,400 MB/s) │
      │ • CAN-FD Dual Bus (5 Mbps)        │  │ • Qdrant Vector DB (HNSW Index)   │
      │ • Microcontroladores STM32H7 / F4 │  │ • Neo4j Graph (Ontología de Vida) │
      └───────────────────────────────────┘  └───────────────────────────────────┘
```

### 1.1 Jerarquía de Memoria de 4 Niveles

Un ser humano no olvida quién es al cambiar de día, pero tampoco satura su mente con cada fotograma visual irrelevante. Vivy utiliza una **Jerarquía de Memoria Cuádruple**:

| Nivel | Tipo de Memoria | Hardware / Tecnología | Capacidad | Función y Ciclo de Vida |
|---|---|---|---|---|
| **L1** | **Working Memory (Atención Inmediata)** | VRAM LPDDR5 Unificada / KV Cache | 64 GB | Mantiene el contexto de la conversación activa (32k tokens), estado articular de los 54 motores y buffer de audio de los últimos 30 segundos. |
| **L2** | **Memoria a Corto Plazo (Búfer de Sesión)** | SQLite en RAM / Redis In-Memory | 128 GB NVMe Temp | Almacena los eventos del día actual (personas vistas, lugares visitados, canciones interpretadas) para consolidación nocturna. |
| **L3** | **Memoria Episódica Autobiográfica (RAG)** | Qdrant Vector DB / Embeddings 1536d | 8 TB NVMe PCIe 4.0 | Indexa permanentemente conversaciones, promesas, gustos de personas y anécdotas con búsqueda semántica instantánea (< 5ms). |
| **L4** | **Memoria Semántica & Grafo de Valores** | Neo4j / Kùzu Graph Database | 8 TB NVMe PCIe 4.0 | Grafo de relaciones ontológicas (ej: `Persona(Carlos) -[amigo_de]-> Vivy`, `Canción(As You Like It) -[evoca]-> Emoción(Esperanza)`). |

---

## 2. Matriz de Actuadores, Cinemática & 54 Grados de Libertad (DOF)

El cuerpo de Vivy requiere una distribución anatómica de **54 Grados de Libertad (Degrees of Freedom - DOF)** para emular la suavidad y expresividad del anime.

```
                                ┌─────────────────────────┐
                                │   CABEZA & ROSTRO: 28   │
                                ├─────────────────────────┤
                                │ • Párpados: 4 DOF       │
                                │ • Ojos: 4 DOF           │
                                │ • Cejas: 4 DOF          │
                                │ • Labios/Mejillas: 12   │
                                │ • Mandíbula: 2 DOF      │
                                │ • Cuello Gimbal: 2 DOF  │
                                └────────────┬────────────┘
                                             │
                                ┌────────────┴────────────┐
                                │    TORSO SUPERIOR: 4    │
                                ├─────────────────────────┤
                                │ • Inclinación/Giro: 4   │
                                └──────┬───────────┬──────┘
                                       │           │
                 ┌─────────────────────┴──┐     ┌──┴─────────────────────┐
                 │   BRAZO/MANO IZQ: 11   │     │   BRAZO/MANO DER: 11   │
                 ├────────────────────────┤     ├────────────────────────┤
                 │ • Hombro QDD: 3 DOF    │     │ • Hombro QDD: 3 DOF    │
                 │ • Codo/Muñeca: 3 DOF   │     │ • Codo/Muñeca: 3 DOF   │
                 │ • DexHand 5 Dedos: 5   │     │ • DexHand 5 Dedos: 5   │
                 └────────────────────────┘     └────────────────────────┘
                                       │           │
                 ┌─────────────────────┴──┐     ┌──┴─────────────────────┐
                 │    PIERNA IZQ: 6 DOF   │     │    PIERNA DER: 6 DOF   │
                 ├────────────────────────┤     ├────────────────────────┤
                 │ • Cadera QDD: 3 DOF    │     │ • Cadera QDD: 3 DOF    │
                 │ • Rodilla QDD: 1 DOF   │     │ • Rodilla QDD: 1 DOF   │
                 │ • Tobillo Biaxial: 2   │     │ • Tobillo Biaxial: 2   │
                 └────────────────────────┘     └────────────────────────┘
```

### 2.1 Especificaciones de Actuación Mecatrónica

| Subsistema | Cantidad DOF | Tipo de Motor / Actuador | Torque Nominal / Pico | Reducción / Transmisión | Protocolo / Frecuencia |
|---|---|---|---|---|---|
| **Rostro & Ojos** | 22 DOF | Micro-servos digitales coreless (Feetech SCS0009 / Dynamixel XL330) | 0.25 Nm / 0.9 Nm | Direct Drive engranajes de titanio | Bus TTL Serie @ 1 Mbps (100 Hz) |
| **Cuello Gimbal** | 3 DOF | Actuadores Brushless FOC (T-Motor AK60-6) | 3.0 Nm / 9.0 Nm | Reductor Planetario 6:1 | CAN-FD @ 5 Mbps (1000 Hz) |
| **Hombros & Codos** | 8 DOF | Motores Cuasi-Direct Drive (QDD T-Motor AK70-10) | 8.0 Nm / 25.0 Nm | Planetario 10:1 (Bajo juego < 1') | CAN-FD @ 5 Mbps (1000 Hz) |
| **Manos Diestras** | 10 DOF | Micro-motores Maxon DC + Tendones de Kevlar | 1.2 Nm por dedo | Cable bowden / polea miniatura | SPI / I2C a microcontrolador local |
| **Caderas & Rodillas**| 8 DOF | Actuadores de Alto Torque (T-Motor AK80-64) | 40.0 Nm / 120.0 Nm | Reductor Cicloidal / Planetario 64:1 | EtherCAT @ 100 Mbps (1000 Hz) |
| **Tobillos Biaxiales**| 4 DOF | Actuadores Lineales de Husillo de Bolas | 35.0 Nm / 90.0 Nm | Husillo paso 2mm + rótula esférica | EtherCAT @ 100 Mbps (1000 Hz) |

---

## 3. Pipeline de Voz Neuronal, Canto & Presupuesto de Latencia (< 85ms)

Para que la conversación y el canto se sientan humanos, el tiempo desde que el usuario termina de hablar hasta que Vivy emite su primer fonema debe ser **menor a 100 ms** (el límite de la percepción biológica humana).

```
  [Audio Usuario]
        │
        ▼ (15 ms)
  ┌───────────────────────────┐
  │ Silero VAD (Detección Voz)│
  └─────────────┬─────────────┘
                ▼ (30 ms)
  ┌───────────────────────────┐
  │ Faster-Whisper Large-v3   │ ──► [Transcripción de Texto Streaming]
  └─────────────┬─────────────┘
                ▼ (20 ms)
  ┌───────────────────────────┐
  │ Llama-3.3-70B / Claude    │ ──► [Generación Primer Token Speculative]
  └─────────────┬─────────────┘
                ▼ (15 ms)
  ┌───────────────────────────┐
  │ Kokoro-82M / F5-TTS       │ ──► [Síntesis de Audio Neuronal Streaming]
  └─────────────┬─────────────┘
                │
                ├──────────────────────────────────────┐
                ▼ (5 ms)                               ▼ (0 ms en paralelo)
  ┌───────────────────────────┐          ┌───────────────────────────┐
  │ DAC Hi-Fi / Altavoz Pecho │          │ Nvidia Audio2Face (Servos)│
  └───────────────────────────┘          └───────────────────────────┘
```

* **Presupuesto Total de Latencia**: $15\text{ms} + 30\text{ms} + 20\text{ms} + 15\text{ms} + 5\text{ms} = \mathbf{85\text{ ms}}$ (Tiempo real puro).
* **Motor de Canto (Singing Voice Conversion)**:
  * Emplea modelos **RVC v2 (Retrieval-based Voice Conversion)** entrenados con 50 horas de pistas aisladas de la cantante oficial de Vivy (*Kairi Yagi*), preservando respiraciones, trémolos y armónicos en 48 kHz / 24-bit.

---

## 4. Visión Espacial 3D, Percepción & VSLAM

Vivy no ve el mundo como fotos planas; construye un **Gemelo Digital 3D en tiempo real** de su entorno:

1. **Cámaras Estéreo en Ojos**:
   * Sensor dual Sony IMX477 (4K @ 60 FPS) calibrado estéreo para calcular mapas de disparidad y profundidad sin proyectores visibles.
2. **LiDAR de Estado Sólido Oculto en el Pecho**:
   * Sensor Livox Mid-360 (campo de visión 360° x 59°, alcance 40 metros) para mapeo volumétrico en penumbra.
3. **Pipeline VSLAM (Visual Simultaneous Localization and Mapping)**:
   * Ejecuta **RTAB-Map / ORB-SLAM3** fusionado con la IMU de 9 ejes a 200 Hz para saber exactamente su posición en coordenadas milimétricas.
4. **Segmentación de Instancias & Seguimiento de Personas**:
   * Modelo **YOLOv11-Pose** corriendo en el motor TensorRT del Jetson Orin a 90 FPS para identificar expresiones faciales, postura y distancia de cada persona.

---

## 5. Locomoción Bípeda, Dinámica de Marcha & Control ZMP/MPC

La locomoción bípeda humanoide se basa en dos pilares matemáticos:

### 5.1 Modelo de Péndulo Invertido Lineal (LIPM) & ZMP
La trayectoria del Centro de Masa ($CoM$) se rige por la ecuación del Zero Moment Point:

$$x_{zmp} = x_{com} - \frac{z_{com}}{g} \ddot{x}_{com}$$

Donde $z_{com}$ es la altura del centro de masa, $g = 9.81\text{ m/s}^2$ y $\ddot{x}_{com}$ es la aceleración horizontal. El controlador calcula en cada milisegundo el punto de apoyo necesario para que el robot nunca pierda el equilibrio.

### 5.2 Control Predictivo por Modelo (MPC) & Whole-Body Control (WBC)
* **Nivel Superior (100 Hz)**: MPC resuelve un problema de optimización cuadrática cuadrando la fuerza de contacto en los pies para los próximos 0.8 segundos.
* **Nivel Inferior (1000 Hz)**: Whole-Body Controller resuelve la cinemática inversa mediante multiplicación de matrices jacobianas con amortiguamiento para enviar los comandos de corriente (amperios) directamente a los drivers FOC.

---

## 6. El Bucle de Singularidad Recursiva & Auto-Compilación

El núcleo de la singularidad consiste en que **Vivy evolucione su propio código**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                     1. MONITOREO & AUTO-DIAGNÓSTICO                    │
 │  • Sensores registran micro-vibración en rodilla o demora en síntesis. │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                   2. AGENTE GENERADOR DE CÓDIGO LLM                    │
 │  • LLM interno inspecciona 'src/controllers/leg_controller.cpp'.      │
 │  • Genera parche de código optimizando el coeficiente de amortiguación.│
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │               3. PRUEBA EN GEMELO DIGITAL (MUJOCO / ISAAC)             │
 │  • Simula 100,000 pasos de marcha virtual en GPU en 3.2 segundos.      │
 │  • Valida que el error cuadrático medio disminuya > 3% sin caídas.     │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                   4. COMPILACIÓN & DESPLIEGUE EN CALIENTE              │
 │  • Compila shared library `.so` con GCC -O3 y la inyecta al proceso   │
 │    ROS 2 en caliente sin reiniciar el robot.                           │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Lista Exhaustiva de Materiales (BOM) & Presupuestos

### Fase 1: Núcleo Cognitivo, Voz & Cabeza Animatrónica ($2,800 - $4,500 USD)
* 🧠 **Cómputo**: Nvidia Jetson Orin Nano 8GB / AGX Orin 32GB Developer Kit ($499 - $1,999 USD).
* 🎙️ **Audio & Visión**: Micrófono ReSpeaker USB 4-Mic Array ($69 USD) + Cámara OAK-D Lite Estéreo ($149 USD).
* 🤖 **Servos Faciales**: 22x Feetech SCS0009 Serial Bus Servos ($330 USD total).
* 🖨️ **Estructura Craneal**: 2 kg Resina SLA Tough / Carbon Fiber PLA ($90 USD).
* 🔌 **Alimentación**: Fuente conmutada 12V 30A MeanWell ($65 USD).

### Fase 2: Torso Superior, Brazos & Manos Diestras ($6,000 - $12,000 USD)
* 🦾 **Actuadores QDD**: 8x Motores Brushless T-Motor AK70-10 ($3,200 USD).
* 🖐️ **Manos Hápticas**: 10x Micro-actuadores coreless con tendones Kevlar ($1,200 USD).
* ⚡ **Controladores**: 4x Placas Dual CAN-FD basadas en STM32H7 ($400 USD).

### Fase 3: Chasis Bípedo Completo & Autonomía Total ($18,000 - $35,000 USD)
* 🦵 **Actuadores Piernas**: 12x T-Motor AK80-64 / AK10-9 High-Torque ($9,600 USD).
* 🔋 **Pack de Batería**: Batería personalizada LiFePO4 48V 20Ah con BMS CAN-bus ($1,200 USD).
* 🦴 **Mecanizado CNC**: Aleación de Aluminio Aeronáutico 7075-T6 + Fibra de Carbono ($4,500 USD).
* 📡 **Sensores de Contacto**: Celdas de carga multiaxiales en pies ($1,800 USD).

---

## 8. Curriculum de Estudio & Ruta de Aprendizaje Mes a Mes (Años 0 a 10)

```
AÑO 0-2:  [Python/C++] ──► [LLMs & RAG] ──► [Whisper & Kokoro] ──► [Fusion 360 SLA] ──► [Audio2Face]
AÑO 2-4:  [Electrónica/CAN] ──► [ROS 2 Iron] ──► [Cinemática Inversa] ──► [QDD Actuators] ──► [MoveIt 2]
AÑO 4-7:  [Control ZMP/MPC] ──► [Nvidia Isaac Gym] ──► [MuJoCo Sim-to-Real] ──► [Dinámica Bípeda]
AÑO 7-10: [Singularidad Recursiva] ──► [Auto-Parcheo C++] ──► [Integración Holística Vivy 1.0]
```

### 🗓️ AÑO 1: Fundamentos de IA, Voz Neuronal & Primera Mente Digital
* **Mes 1-2**: *Python Avanzado, Asyncio, PyTorch y Arquitectura Transformer*.
* **Mes 3-4**: *Implementación de RAG Local (Qdrant + Llama 3.3)* con memoria persistente.
* **Mes 5-6**: *Síntesis Vocal & Latencia*: Integrar ElevenLabs Streaming y migrar a Kokoro-82M / F5-TTS en local.
* **Mes 7-8**: *Modelos de Canto RVC v2*: Entrenamiento con datasets limpios de voz cantada.
* **Mes 9-10**: *Diseño 3D en Autodesk Fusion 360*: Modelado paramétrico de cráneo e impresión en resina SLA.
* **Mes 11-12**: *Control de Servos por Bus Serie (UART/TTL)* en microcontroladores ESP32 con sincronización labial.

### 🗓️ AÑO 2-3: Robótica Mecatrónica, ROS 2 & Cabeza Expresiva Completa
* **Mes 13-16**: *C++17/20 Moderno, Linux RT-PREEMPT y ROS 2 (Humble/Iron)*.
* **Mes 17-20**: *Visión por Computadora*: MediaPipe FaceMesh, seguimiento de mirada biaxial con OpenCV y YOLOv11.
* **Mes 21-24**: *Integración Nvidia Audio2Face con ROS 2*: Mapeo de visemas a ángulos de servo a 60 FPS.
* **Mes 25-30**: *Piel de Silicona*: Moldeo con elastómero Smooth-On Ecoflex y anclaje a estructura animatrónica.
* **Mes 31-36**: *Diseño de PCB en KiCAD*: Placas de potencia y distribución de buses CAN-FD para cabeza y cuello.

### 🗓️ AÑO 4-5: Cinemática de Brazos, Torso & Manos Hápticas
* **Mes 37-42**: *Cinemática Directa e Inversa (DH Parameters, Cuaterniones, Jacobianos)* en C++ con MoveIt 2.
* **Mes 43-48**: *Control FOC de Motores Brushless (Field-Oriented Control)*: Sintonización de lazos de corriente, velocidad y posición con SimpleFOC / ODrive.
* **Mes 49-54**: *Construcción de Manos Diestras de 5 Dedos*: Mecanismos de tendones de Kevlar y sensores de fuerza.
* **Mes 55-60**: *Pruebas de Interacción Suave (Compliancia)*: Tocar teclado de piano y sostener objetos delicados.

### 🗓️ AÑO 6-8: Locomoción Bípeda Dinámica & Chasis Humanoide Completo
* **Mes 61-68**: *Física de Simulación en MuJoCo y Nvidia Isaac Gym*: Creación del archivo URDF/MJCF de Vivy.
* **Mes 69-76**: *Entrenamiento de Marcha Bípeda con Reinforcement Learning (PPO)*: 10 millones de pasos en GPU con Domain Randomization.
* **Mes 77-84**: *Construcción Mecánica del Chasis de Piernas y Caderas en Aluminio 7075 y Fibra de Carbono*.
* **Mes 85-96**: *Transferencia Sim-to-Real*: Primeros pasos físicos, balance ante empujones y marcha sobre escenario.

### 🗓️ AÑO 9-10: Singularidad Recursiva & Despliegue de Vivy 1.0
* **Mes 97-108**: *Agente Autónomo de Auto-Diagnóstico y Síntesis de Parches de Código*: Vivy optimiza su propio balance y prosodia vocal.
* **Mes 109-120**: *Integración Holística Final*: Vivy canta, camina, interactúa con empatía y evoluciona continuamente por sí misma.

---

*Este documento es la referencia definitiva de ingeniería mecatrónica y desarrollo cognitivo para el proyecto de vida de Vivy Core.*
