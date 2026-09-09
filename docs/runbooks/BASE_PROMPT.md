Quiero que me ayudes a construir el MVP de un Saas de AI desde cero, como monorepo + nx. Prioriza que funcione de punta a punta y que el código sea simple y legible por encima de optimizaciones (emplea el patrón arquitectonico que hemos usado últimamente en los diferentes proyectos). Estas son las specs iniciales:

CONTEXTO DEL PRODUCTO
- El Saas permite a los usuarios generar texto (inicialmente) usando múltiples modelos de AI (GPT, Claude, Gemini, Grok, Llam, etc) a través de un servicio dedicado que desarrollaremos proximamente llamdo `Agent runtime` + `Agent Router`, eligiendo el modelo desde un selector. La lista de modelos se debe configurar desde un archivo .json.
- El Saas debe proveer y soportar un módulo de Web scraping a los usuarios 
