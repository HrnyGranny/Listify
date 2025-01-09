const { Builder, By, until } = require('selenium-webdriver');
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


        // **Paso 5: Crear una lista, añadir elementos y compartirla con Ana**
        await driverPepe.get("http://localhost:4200/user");
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css(".btn-success"))), 10000);
        await driverPepe.findElement(By.css(".btn-success")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.id("listName"))), 10000);
        await driverPepe.findElement(By.id("listName")).click();
        await driverPepe.findElement(By.id("listName")).sendKeys("Cumpleaños");
        await driverPepe.wait(until.elementIsEnabled(driverPepe.findElement(By.css(".ng-dirty > .btn"))), 10000);
        await driverPepe.findElement(By.css(".ng-dirty > .btn")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css("#userLists .list-group-item:first-child"))), 10000);
        await driverPepe.findElement(By.css("#userLists .list-group-item:first-child")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.css(".text-center"))), 10000);
        await driverPepe.findElement(By.css(".text-center")).click();
        await driverPepe.wait(until.elementIsVisible(driverPepe.findElement(By.id("itemName"))), 10000);
        await driverPepe.findElement(By.id("itemName")).click();
        await driverPepe.findElement(By.id("itemName")).sendKeys("Latas de cerveza");
        await driverPepe.findElement(By.id("itemAmountInitial")).click();
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
        await driverPepe.findElement(By.id("itemAmountInitial")).sendKeys("2");
        await driverPepe.wait(until.elementIsEnabled(driverPepe.findElement(By.css(".ng-valid > .btn"))), 10000);
        await driverPepe.findElement(By.css(".ng-valid > .btn")).click();

    } catch (err) {
        console.error("Error durante el test:", err);
    } finally {
        // Cerrar los navegadores
        await driverPepe.quit();
        await driverAna.quit();
    }
})();