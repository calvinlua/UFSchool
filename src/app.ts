import Express from "express";
import compression from "compression";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import router from "./router";
import globalErrorHandler from "./config/globalErrorHandler";
import swaggerSpec from "./config/swagger";

const App = Express();

App.use(compression());
App.use(cors());
App.use(Express.json());
App.use(Express.urlencoded({ extended: true }));

// Swagger documentation
App.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { 
  customCss: ".swagger-ui .topbar { display: none }",
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

App.use("/api", router);
App.use(globalErrorHandler);

export default App;
