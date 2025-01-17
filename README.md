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

## Testing

To run Listify tests:

1. **Tests Folder:** Go to the `tests` folder.

2. **Run Tests:**

    #### **Selenium (UI Tests):**

    * Folder: `tests/selenium`
    * Install dependencies (npm): `npm install selenium-webdriver chromedriver` (or your driver)
    * Run: `node <testFileName.js>`
    * Requires a running web server.

    #### **JMeter (Performance Tests):**

    * Requires JMeter installed ([download](https://jmeter.apache.org/download_jmeter.cgi)).
    * Folder: `tests/jmeter` (`.jmx` files).

    * **Run (GUI):**
        * Open JMeter.
        * `File` -> `Open` (`.jmx`).
        * Run (Play button).
        * Analyze results (Listeners).

    * **Run (Non-GUI - Recommended for load testing):**
        * Navigate to JMeter's `bin` directory.
        * Run: `jmeter -n -t ../../tests/jmeter/testPlan.jmx -l ../../tests/jmeter/results.jtl -j ../../tests/jmeter/jmeter.log`
        * Analyze `results.jtl` in JMeter.
        * `-n`: Non-GUI; `-t`: `.jmx`; `-l`: results; `-j`: log.
