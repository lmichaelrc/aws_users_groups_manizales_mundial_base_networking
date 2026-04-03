# 🏗️ Arquitectura Networking Base (AWS CDK POC)

## 📖 Descripción del Proyecto
Prueba de Concepto (POC) orientada a la creación de una infraestructura Cloud Base (*Base Networking*) dinámica y escalable utilizando **AWS CDK (Cloud Development Kit)** con TypeScript. El proyecto implementa las mejores prácticas de los pilares de Seguridad y Optimización de Costos del *AWS Well-Architected Framework*.

---

## 🏛️ Patrones Arquitectónicos Aplicados

1. **SRP e Inversión de Control (*SOLID*)**: Abandono de Stacks monolíticos. La lógica densa fue encapsulada en constructos `L3` que orquestan servicios interconectados.
2. **Corporate Naming Convention**: Generación dinámica, centralizada y determinista de etiquetas (*Tags*) en formato `Kebab-Case` (AWS) y `PascalCase` (CDK Locales) limitando fuertemente el error humano (ej: `poc-dev-vpc`).
3. **Desacoplamiento Estricto (*Inyección `.env`*)**: Inyección paramétrica que permite instanciar topologías gigantescas basadas enteramente en variables de archivos `.env`.
4. **Validación Temprana Defensiva**: Antes de sintetizar a CloudFormation, las capas superiores emiten un escáner de sanidad de objetos y Falsy Booleans rebotando despliegues defectuosos a un plano preventivo local.
5. **Defensa en Profundidad Estricta**: Security Groups base con negación de entrada exterior (Egress Total, Ingress Intranet), acoplado a un cortafuegos Network ACL iterativo bajo iterables DRY restrictivos.

---

## 🗂️ Estructura del Árbol y Responsabilidades

### 📌 Raíz del Proyecto (Configuración y Entrypoints)
- **`main.ts`** (*Entrypoint*): Punto base de la aplicación AWS CDK. Carga los secretos y rutas en la memoria (vía *Dotenv*), moldea los strings a su primitivo real (Tipado), e invoca ciegamente al Stack delegando responsabilidades. Enciende el motor conectándose a las variables ocultas globales (`CDK_DEFAULT_ACCOUNT`).
- **`cdk.json`**: El archivo de directrices para el Orquestador CDK CLI. Gestiona *Feature Flags* e informa directamente desde qué archivo de origen mapear la arquitectura (apunta a `main.ts`).
- **`.env` / `.env.example`**: La topología de inyección de configuración. Permite la clonación de despliegues paramétricos decidiendo topologías de IP (`VPC_CIDR`, Mask) o reducciones agresivas de costos locales (activables como `ENABLE_NAT_GATEWAYS=false`).
- **`cdk.context.json`**: La *"Memoria Caché Mágica"*. Archivo auto-gestionado que pre-carga respuestas críticas desde APIs de AWS (Como nombres de Availability Zones validas en curso) previniendo que una caída temporal de regiones te impida desplegar en modo offline.

### 📌 `src/` (El Código Corazón)
- **`src/poc-aws-cdk-stack.ts`** (*Capa de Orquestación*): La frontera de validación. Analiza todos los argumentos paramétricos y prohíbe que el compilador transe recursos AWS de faltar elementos críticos (como la red principal), y posteriormente expone instancias abstractas a CDK instanciando piezas L3 como si fueran cajas negras.
- **`src/constructs/base-network.ts`** (*Capa Operacional L3*): **El bloque más pesado**. Define exhaustivamente qué Subredes usar (Aisladas o Egress), ensambla los Grupos de Seguridad Base para microservicios futuros, e inyecta bucles iterativos de Seguridad Perimetral ACL sin repetición de código (*DRY Cycle*).
- **`src/utils/naming-service.ts`** (*Capa de Servicios*): Utilidad universal generadora dictatorial de Nombres AWS basada en reglas y convenciones empresariales. Todo constructor lógico la contacta para bautizarse.
- **`src/interfaces/*.ts`**: Capa del diseño estructurado basada en Tipado Fuerte de Componentes para desacoplar el casteo en el compilador sin sobrecargar a los constructos (*DTO Equivalents* adaptados a requerimientos puros TypeScript Idiomáticos de Framework).

### 📌 `test/` (Aseguramiento de Calidad)
- **`test/poc-aws-cdk.test.ts`**: Conjunto robusto de pruebas locales (Jest Test Suite). Carga instantáneas del árbol de síntesis comparando si hemos bloqueado inyecciones no deseadas (evitando estallar en costos imprevistos rastreando `AWS::EC2::NatGateway = 0` o verificando consistencia nominal de los Tags preventivamente en milisegundos).

---

## ⚙️ Requisitos Previos (Dependencias)
Para ejecutar este proyecto de infraestructura en tu entorno local, necesitas tener instalado y configurado lo siguiente:

- **Node.js**: Versión `18.x` o superior (Recomendado LTS).
- **AWS CLI**: Instalado y configurado (`aws configure`) con perfiles apuntando a la cuenta destino.
- **AWS CDK v2**: La tecnología motor subyacente (`aws-cdk-lib` >= `2.247.0`). Ejecutable bajo demanda usando `npx cdk`.
- **Credenciales Cloud**: Accesos IAM suficientes (AdministratorAccess o PowerUser) atados al perfil local activo de AWS CLI para construir topologías VPC complejas.

---

## 🏃 ¿Cómo inicializar y correr el proyecto?

### 1. Preparación del Entorno (Local)
Instala las dependencias estáticas de TypeScript y utilerías motor:
```bash
npm install
```

Crea tu archivo de secretos y configuración clonando la plantilla fundacional:
```bash
cp .env.example .env
```
*(Abre el `.env` recien creado y ajusta detalles vitales como `PROJECT_NAME`, `ENVIRONMENT` y tu `VPC_CIDR` objetivo).*

### 2. Inicialización en Nube (Bootstrap)
Si es la **primera vez en la historia** que vas a desplegar recursos CDK hacia la región o cuenta actual configurada en tu terminal, debes inicializar el stack caché primario de AWS:
```bash
npx cdk bootstrap
```

### 3. Validación y Pruebas Unitarias
Asegura estáticamente que no hayas roto ninguna topología de red ni convenciones lógicas de nombres:
```bash
npm run test
```

### 4. Orquestación y Despliegue (Pipelines / DevOps)
Analiza y visualiza los cambios estructurales antes de crear nada (Un *Dry-run*):
```bash
npx cdk diff
```

Apresiona el gatillo y despliega dinámicamente toda la red base a Amazon:
```bash
npx cdk deploy
```

Si terminaste de experimentar con la POC, aniquila la red (Te salvará de costos AWS):
```bash
npx cdk destroy
```
