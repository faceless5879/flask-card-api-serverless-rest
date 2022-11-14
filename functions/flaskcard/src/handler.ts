import "source-map-support/register";

import serverlessExpress from "@vendia/serverless-express";
import { configureApp } from "@app";

const app = configureApp();

export default serverlessExpress({ app });
