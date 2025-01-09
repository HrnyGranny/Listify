<p align="center">
    <img src="https://github.com/user-attachments/assets/279b6de8-2d6d-41ee-9bde-a1db088c9d61" alt="Listify">
</p>

# Listify

Listify is a web application designed to help you manage your shopping lists in a simple and efficient way. With a modern interface developed in Angular and a robust backend built with Node.js and Express, Listify offers features to create, share, and collaborate on shopping lists.

## Creator

Created by **Álvaro Ruiz Roldán**  
Email: [Alvaro.Ruiz12@alu.uclm.es](mailto:Alvaro.Ruiz12@alu.uclm.es)

## Running Locally

To run Listify locally, follow these steps:

### **Install Dependencies (Backend)**

1. Navigate to the `backend` folder and run:

```bash 
npm install
```

If you encounter issues with dependencies, you can delete the `node_modules` folder and try running the command again:

```bash
rm -rf node_modules  
npm install
```

### **Run the Application Locally**

#### **Backend:**
In the `backend` folder, run:

```bash
npm start
```

The backend will run on **port 3000**.

#### **Frontend:**
In the `frontend` folder, run:

```bash
ng serve
```

The frontend will run on **port 4200**.

## Test 

Para ejecutar las pruebas de Listify, sigue estos pasos:

1. **Navegar a la Carpeta de Pruebas**:
   - Dirígete a la carpeta `tests` en la estructura de tu proyecto.

2. **Ejecutar Pruebas para Selenium o JMeter**:
 
   #### **Para Pruebas con Selenium**:

   - Primero, navega a la carpeta `tests/selenium` 
   
   - Ejecuta las pruebas con `node` 

   ```bash
   node <testFileName.js>

