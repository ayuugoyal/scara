import express from "express";
import cors from "cors";
import portRoutes from "./routes/portRoutes";
import commandRoutes from "./routes/commandRoutes";

class App {
  public app: express.Application;
  private PORT: number;

  constructor() {
    this.app = express();
    this.PORT = Number(process.env.PORT) || 3001;
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private initializeRoutes() {
    this.app.use("/api", portRoutes);
    this.app.use("/api", commandRoutes);
  }

  public listen() {
    this.app.listen(this.PORT, () => {
      console.log(`Server running on port ${this.PORT}`);
    });
  }
}

const app = new App();
app.listen();

export default app;
