import express from 'express';
import fs from 'fs';

const app = express();
const PORT = 8080;

// clases
class ProductManager {

    constructor() {
        this.filePath = "productos.json";
    }

    async getProducts() {
        try {

            const data = await fs.readFileSync(this.filePath, "utf8");
            return data ? JSON.parse(data) : [];

        } catch (error) {
            console.log("Error fetching en products:", error);
            return [];
        }
    }

    async getProductById(idProduct) {
        const products = await this.getProducts();

        const product = products.find(item => item.id === idProduct);

        return product ? product : null;
    }
}

//midlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true}))

//endpoint
// app.get("/", async (rep, res) => {
//     const products = new ProductManager();
//     let allProducts = await products.getProducts();
//     res.status(200).json(allProducts);
// })

app.get("/products", async (req, res) => {

    const products = new ProductManager();
    
    try{
        
        let allProducts = await products.getProducts();
        
        // Verifica si biene el limit
        const limit = parseInt(req.query.limit);

        if (!isNaN(limit) && limit > 0) {
            
            allProducts = allProducts.slice(0, limit);
        }
        // Verifica que el json venga con datos
        if (allProducts.length <= 0) {
            res.send("No se encontraron productos...!");
            return;
        }
        // si acepta html va a generar uno basico con un listado de lo devuelto por el json
        if (req.accepts('text/html')) {
            res.send(`
                <h1>Listado de productos</h1>
                <ul>
                    ${allProducts.map(p => `<li><strong>Nombre:</strong> ${p.nombre} => <strong>Precio:</strong> $${p.precio}</li>`).join('')}
                </ul>
            `);
        } else {
            res.status(200).json(allProducts);
        }
    }catch(error){
        console.error('Error:', error);
        res.status(500).send('Error del servidor');
    }
});

app.get("/products/:pid", async (req, res)=>{
    
    const xId = req.params.pid;
    const prodMan = new ProductManager();
    
    try{

        const product = await prodMan.getProductById(parseInt(xId));
        
        if(!product){
            res.status(404).send("Producto no encontrado");
        }
        
        if (req.accepts('text/html')) {
            res.send(`
                <h1>Listado de productos</h1>
                
                <p><strong>Nombre:</strong> ${product.nombre} => <strong>Precio:</strong> $${product.precio}</p>             
            `);
        } else {
            res.status(200).json(product);
        }

    }catch(error){
        console.error('Error:', error);
        res.status(500).send('Error del servidor');
    }
})

app.listen(PORT, () => console.log(`Express escuchando en el puerto: ${PORT}`));