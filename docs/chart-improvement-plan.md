# Plan de mejora del chart

## Objetivos para usuarios novatos
- Crear una interfaz inmediata que explique qué está pasando sin necesidad de manuales.
- Ofrecer feedback visual claro en cada interacción (zoom, selección, dibujo, indicadores).
- Garantizar que cada icono y herramienta de la barra lateral tenga un flujo de uso completo.
- Simplificar la configuración avanzada con paneles modales discretos.

## Cambios de UI/UX
1. Barra superior dividida en métricas (precio, cambio, timeframe) y acciones (series, indicadores, captura, fullscreen).
2. Etiquetas contextuales flotantes para precios y tiempos con contraste alto y blur.
3. Panel inferior con timeline comprimido y tooltips al pasar.
4. Estado "sin datos" amistoso y loader translúcido para cambios de serie/indicador.

## Mejoras funcionales
1. Flujo de dibujo multi-etapa con vista previa dinámica para triángulos, canales y fibonacci.
2. Herramientas de texto/iconos que permiten elegir color, tamaño y contenido antes de fijar.
3. Regla y canales con medidas numéricas (distancia y porcentaje).
4. Captura y fullscreen con feedback mediante toasts ligeros.
5. Ajuste de zoom/pan suavizado y límites protegidos.

## Implementación técnica
- `src/TradingViewChart.tsx`: reorganizar layout, estados de overlays, lógica de dibujo y tooltips.
- `src/DrawingToolbar.tsx`: anotar tooltips, popovers y estados activos para cada icono.
- `src/drawingUtils.ts`: añadir renderizados especializados (texto enriquecido, iconos, ruler con métricas).
- `src/store.ts`: extender estado (por ejemplo, configuraciones de herramienta, toasts y capas de ayuda).

## Validación
- Revisar que cada herramienta renderiza algo tangible y se puede deshacer.
- Confirmar accesibilidad mínima (contraste, foco, descripciones) en botones primarios.
- Probar switching rápido de timeframe/series para asegurar que los loaders y overlays responden.
