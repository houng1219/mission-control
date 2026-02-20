import { defineApp } from "convex/server";
import twilio from "twilio";

const app = defineApp();

app.route(
  "action:hello",
  twilio.handler({
    bodyParser: twilio.bodyParser(),
    validateRequest: twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN!),
  })
);

export default app;
