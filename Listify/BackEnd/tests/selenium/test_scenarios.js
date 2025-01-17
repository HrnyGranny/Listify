const { Builder, By, until, Key } = require('selenium-webdriver');
const { MongoClient } = require('mongodb'); // Cliente de MongoDB para verificar el oráculo

(async function testScenario() {
    // Crear los drivers para Pepe y Ana
    const driverPepe = await new Builder().forBrowser('chrome').build();
    const driverAna = await new Builder().forBrowser('chrome').build();

    // MongoDB Atlas connection string
    const uri = 'mongodb+srv://HornyGranny:Ragnarok12.@cluster0.lsfk5ox.mongodb.net/Listify?retryWrites=true&w=majority&appName=Cluster0';

    try {
        // **Paso 1: Configurar las ventanas de los drivers**
        // Posicionar las ventanas en la pantalla
        await driverPepe.manage().window().setRect({ width: 960, height: 1080, x: 0, y: 0 }); // Ventana izquierda (Pepe)
        await driverAna.manage().window().setRect({ width: 960, height: 1080, x: 960, y: 0 }); // Ventana derecha (Ana)

        // **Paso 2: Registro de Pepe**
        await driverPepe.get("http://localhost:4200/");
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css(".text-center > .btn"))), 10000);
        await driverPepe.findElement(By.css(".text-center > .btn")).click(); // Clic en botón de registro
        
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.id("registerEmail"))), 10000);
        await driverPepe.findElement(By.id("registerEmail")).sendKeys("Pepe@gmail.com");
        await driverPepe.findElement(By.id("registerUsername")).sendKeys("Pepe");
        await driverPepe.findElement(By.id("registerPassword")).sendKeys("pepe123");
        await driverPepe.findElement(By.id("confirmPassword")).sendKeys("pepe123");
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css(".btn-secondary"))), 10000);
        await driverPepe.findElement(By.css(".btn-secondary")).click(); // Clic en botón de confirmar registro

        // Esperar a que Pepe sea redirigido después del registro
        await driverPepe.wait(until.urlContains('/user'), 20000);
        console.log("Registro de Pepe completado exitosamente.");

        // Obtener la cookie con el token después de la redirección
        const cookies = await driverPepe.manage().getCookies();
        const authCookie = cookies.find(cookie => cookie.name === 'token');

        // **Paso 3: Verificar en MongoDB que Pepe fue registrado**
        const client = new MongoClient(uri);
        await client.connect(); // Conectar al servidor de MongoDB
        const database = client.db('Listify'); // Nombre de tu base de datos
        const usersCollection = database.collection('users'); // Nombre de tu colección de usuarios

        // Buscar si Pepe fue registrado
        const pepe = await usersCollection.findOne({ email: "Pepe@gmail.com" });

        if (pepe) {
            console.log("La cuenta de Pepe ha sido registrada correctamente en la base de datos.");
        } else {
            console.error("Error: No se encontró la cuenta de Pepe en la base de datos.");
        }

        await client.close(); // Cerrar la conexión con MongoDB

        // **Paso 4: Registro de Ana**
        await driverAna.get("http://localhost:4200/");
        await driverAna.wait(until.elementIsVisible(driverAna.findElement(By.css(".text-center > .btn"))), 10000);
        await driverAna.findElement(By.css(".text-center > .btn")).click(); // Clic en botón de registro
        
        await driverAna.wait(until.elementIsVisible(driverAna.findElement(By.id("registerEmail"))), 10000);
        await driverAna.findElement(By.id("registerEmail")).sendKeys("Ana@gmail.com");
        await driverAna.findElement(By.id("registerUsername")).sendKeys("Ana");
        await driverAna.findElement(By.id("registerPassword")).sendKeys("ana123");
        await driverAna.findElement(By.id("confirmPassword")).sendKeys("ana123");
        await driverAna.wait(until.elementIsVisible(driverAna.findElement(By.css(".btn-secondary"))), 10000);
        await driverAna.findElement(By.css(".btn-secondary")).click(); // Clic en botón de confirmar registro

        // Esperar a que Ana sea redirigida después del registro
        await driverAna.wait(until.urlContains('/user'), 20000);
        console.log("Registro de Ana completado exitosamente.");

        // **Paso 5: Crear una lista, añadir elementos y compartirla con Ana**
        await driverPepe.get("http://localhost:4200/user");
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css(".btn-success"))), 10000);
        await driverPepe.findElement(By.css(".btn-success")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.id("listName"))), 10000);
        await driverPepe.findElement(By.id("listName")).click();
        await driverPepe.findElement(By.id("listName")).sendKeys("Cumpleaños");
        await driverPepe.wait(until.elementLocated(By.css(".ng-dirty > .btn")), 10000);
        await driverPepe.wait(until.elementIsEnabled(driverPepe.findElement(By.css(".ng-dirty > .btn"))), 10000);
        await driverPepe.findElement(By.css(".ng-dirty > .btn")).click();

        // Esperar 2 segundos antes de interactuar con el primer elemento de la lista
        await driverPepe.sleep(2000);
        
        // Añadir elementos a la lista
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css(".list-group-item"))), 10000);
        await driverPepe.findElement(By.css(".list-group-item")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css(".text-center"))), 10000);
        await driverPepe.findElement(By.css(".text-center")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.id("itemName"))), 10000);
        await driverPepe.findElement(By.id("itemName")).click();
        await driverPepe.findElement(By.id("itemName")).sendKeys("Latas de cerveza");
        await driverPepe.findElement(By.id("itemAmountInitial")).click();
        await driverPepe.findElement(By.id("itemAmountInitial")).clear();
        await driverPepe.findElement(By.id("itemAmountInitial")).sendKeys("30");
        await driverPepe.wait(until.elementIsEnabled(driverPepe.findElement(By.css(".ng-valid > .btn"))), 10000);
        await driverPepe.findElement(By.css(".ng-valid > .btn")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css(".text-primary"))), 10000);
        await driverPepe.findElement(By.css(".text-primary")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.id("itemName"))), 10000);
        await driverPepe.findElement(By.id("itemName")).click();
        await driverPepe.findElement(By.id("itemName")).sendKeys("Tarta");
        await driverPepe.wait(until.elementIsEnabled(driverPepe.findElement(By.css(".ng-valid > .btn"))), 10000);
        await driverPepe.findElement(By.css(".ng-valid > .btn")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css(".text-primary"))), 10000);
        await driverPepe.findElement(By.css(".text-primary")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.id("itemName"))), 10000);
        await driverPepe.findElement(By.id("itemName")).click();
        await driverPepe.findElement(By.id("itemName")).sendKeys("Bolsa de patatas fritas");
        await driverPepe.findElement(By.id("itemAmountInitial")).click();
        await driverPepe.findElement(By.id("itemAmountInitial")).clear();
        await driverPepe.findElement(By.id("itemAmountInitial")).sendKeys("2");
        await driverPepe.wait(until.elementIsEnabled(driverPepe.findElement(By.css(".ng-valid > .btn"))), 10000);
        await driverPepe.findElement(By.css(".ng-valid > .btn")).click();

        // **Paso 6: Compartir la lista con Ana**
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css(".btn-secondary:nth-child(1)"))), 10000);
        await driverPepe.findElement(By.css(".btn-secondary:nth-child(1)")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.id("shareWith"))), 10000);
        await driverPepe.findElement(By.id("shareWith")).click();
        await driverPepe.findElement(By.id("shareWith")).sendKeys("Ana", Key.RETURN);

        // Recargar la página del driverAna antes del paso 7
        await driverAna.navigate().refresh();
        await driverAna.wait(until.urlContains('/user'), 10000);

        // Esperar 3 segundos antes de interactuar con el primer elemento de la lista
        await driverPepe.sleep(3000);

        // **Paso 7: Ana carga la lista y marca la tarta como comprada**
        await driverAna.wait(until.elementIsVisible(driverAna.findElement(By.css(".list-group-item"))), 10000);
        await driverAna.findElement(By.css(".list-group-item")).click();
        await driverAna.actions().move({ origin: driverAna.findElement(By.linkText("Shared Lists")) }).perform();
        await driverAna.wait(until.elementIsVisible(driverAna.findElement(By.css(".list-group-item:nth-child(2) > .ng-untouched"))), 10000);
        await driverAna.findElement(By.css(".list-group-item:nth-child(2) > .ng-untouched")).click();

        // Esperar 3 segundos 
        await driverPepe.sleep(3000);

        // **Paso 8: Comprobar oraculo**
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css(".list-group-item:nth-child(2) > .ng-untouched"))), 10000);
        const tartaCheckbox = await driverPepe.findElement(By.css('.list-group-item:nth-child(2) input[type="checkbox"]'));
        const isTartaChecked = await tartaCheckbox.getAttribute('ng-reflect-model').then(value => value === 'true');
        console.log("Tarta comprada:", isTartaChecked ? "Sí" : "No");

    } catch (err) {
        console.error("Error durante el test:", err);
    } finally {
        // Cerrar los navegadores
        await driverPepe.quit();
        await driverAna.quit();
    }
})();